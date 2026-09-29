from datetime import datetime, timedelta, timezone
import json
import sqlite3
import hashlib

from fastapi.testclient import TestClient

from app.kiln import InterpretationResult
from app.main import create_app
from app.models import KilnCallMetric, PurposeCategory, StructuredPurchaseRequest


class FakeInterpreter:
    def interpret(self, request, mandate_currency):
        return InterpretationResult(
            purchase=StructuredPurchaseRequest(merchant="Amazon", amount="65", currency="USD", item="Keyboard", purpose="Work", purpose_category=PurposeCategory.OFFICE),
            metric=KilnCallMetric(request_id="fake-1", model="gpt-oss-120b", stage="INTERPRET", prompt_tokens=10, completion_tokens=5, total_tokens=15, latency_ms=20),
        )


class ThresholdInterpreter:
    def interpret(self, request, mandate_currency):
        return InterpretationResult(
            purchase=StructuredPurchaseRequest(merchant="Amazon", amount="90", currency="USD", item="Chair", purpose="Office supplies", purpose_category=PurposeCategory.OFFICE),
            metric=KilnCallMetric(model="gpt-oss-120b", stage="INTERPRET", latency_ms=1),
        )


class FoodInterpreter:
    def interpret(self, request, mandate_currency):
        return InterpretationResult(
            purchase=StructuredPurchaseRequest(
                merchant="Amazon", amount="65", currency="USD", item="Team lunch",
                purpose="Food for the team", purpose_category=PurposeCategory.FOOD,
            ),
            metric=KilnCallMetric(model="test-model", stage="INTERPRET", latency_ms=1),
        )


def create_test_mandate(client, *, total="200", threshold="80"):
    response = client.post("/api/mandates", json={
        "name": "Office", "purpose": "Office supplies", "purpose_category": "OFFICE", "total_budget": total, "currency": "USD",
        "allowed_merchants": ["Amazon"],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "human_approval_threshold": threshold,
    })
    assert response.status_code == 201
    return response.json()


def test_end_to_end_allow_and_chain(tmp_path):
    app = create_app(str(tmp_path / "test.db"))
    app.state.interpreter = FakeInterpreter()
    with TestClient(app) as client:
        mandate = client.post("/api/mandates", json={
            "name": "Office", "purpose": "Equipment", "purpose_category": "OFFICE", "total_budget": "200", "currency": "USD",
            "allowed_merchants": ["Amazon"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "human_approval_threshold": "100",
        })
        assert mandate.status_code == 201
        decision = client.post("/api/decisions", json={"mandate_id": mandate.json()["id"], "request": "Buy a keyboard for $65 from Amazon."})
        assert decision.status_code == 201
        body = decision.json()
        assert body["decision"] == "ALLOW"
        assert body["audit_payload"]["purchase_request_hash"].startswith("0x")
        attached = client.post(f"/api/decisions/{body['decision_id']}/chain", json={"network": "base-sepolia", "tx_hash": "0xabc"})
        assert attached.json()["tx_hash"] == "0xabc"
        assert client.get("/api/metrics/summary").json()["kiln"]["total_tokens"] == 15
        refreshed = client.get(f"/api/mandates/{mandate.json()['id']}").json()
        assert refreshed["remaining_budget"] == "135"


def test_approval_is_not_applied_twice(tmp_path):
    app = create_app(str(tmp_path / "approval.db"))
    app.state.interpreter = ThresholdInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        pending = client.post("/api/decisions", json={"mandate_id": mandate["id"], "request": "Buy a $90 chair from Amazon"}).json()
        assert pending["decision"] == "NEEDS_HUMAN"

        first = client.post(f"/api/decisions/{pending['decision_id']}/approve")
        second = client.post(f"/api/decisions/{pending['decision_id']}/approve")

        assert first.status_code == 200
        assert first.json()["decision"] == "ALLOW"
        assert second.status_code == 409
        assert client.get(f"/api/mandates/{mandate['id']}").json()["remaining_budget"] == "110"


def test_mandate_chain_attachment_is_idempotent_for_same_receipt(tmp_path):
    app = create_app(str(tmp_path / "mandate-chain.db"))
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        url = f"/api/mandates/{mandate['id']}/chain"

        first = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xmandate"})
        same = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xmandate"})
        conflict = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xother"})
        stored = client.get(f"/api/mandates/{mandate['id']}").json()

        assert first.status_code == 200
        assert same.status_code == 200
        assert conflict.status_code == 409
        assert stored["blockchain_network"] == "base-sepolia"
        assert stored["tx_hash"] == "0xmandate"


def test_chain_attachment_cannot_be_overwritten(tmp_path):
    app = create_app(str(tmp_path / "chain.db"))
    app.state.interpreter = FakeInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client, threshold="100")
        receipt = client.post("/api/decisions", json={"mandate_id": mandate["id"], "request": "Buy a keyboard"}).json()
        url = f"/api/decisions/{receipt['decision_id']}/chain"

        first = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xfirst"})
        same = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xfirst"})
        second = client.post(url, json={"network": "other", "tx_hash": "0xsecond"})
        stored = client.get(f"/api/decisions/{receipt['decision_id']}").json()

        assert first.status_code == 200
        assert same.status_code == 200
        assert second.status_code == 409
        assert stored["blockchain_network"] == "base-sepolia"
        assert stored["tx_hash"] == "0xfirst"


def test_pending_decision_cannot_be_attached_to_chain(tmp_path):
    app = create_app(str(tmp_path / "pending-chain.db"))
    app.state.interpreter = ThresholdInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        receipt = client.post("/api/decisions", json={"mandate_id": mandate["id"], "request": "Buy a $90 chair"}).json()

        response = client.post(
            f"/api/decisions/{receipt['decision_id']}/chain",
            json={"network": "base-sepolia", "tx_hash": "0xpremature"},
        )

        assert response.status_code == 409
        stored = client.get(f"/api/decisions/{receipt['decision_id']}").json()
        assert stored["tx_hash"] is None


def test_human_reject_blocks_without_budget_deduction(tmp_path):
    app = create_app(str(tmp_path / "reject.db"))
    app.state.interpreter = ThresholdInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        pending = client.post(
            "/api/decisions",
            json={"mandate_id": mandate["id"], "request": "Buy a $90 chair from Amazon"},
        ).json()
        assert pending["decision"] == "NEEDS_HUMAN"

        rejected = client.post(f"/api/decisions/{pending['decision_id']}/reject")
        second = client.post(f"/api/decisions/{pending['decision_id']}/reject")

        assert rejected.status_code == 200
        assert rejected.json()["decision"] == "BLOCK"
        assert rejected.json()["matched_rule"] == "human_rejection"
        assert rejected.json()["reason_code"] == "HUMAN_REJECTED"
        assert second.status_code == 409
        assert client.get(f"/api/mandates/{mandate['id']}").json()["remaining_budget"] == "200"


def test_revoke_mandate_blocks_future_requests_and_persists_chain_receipt(tmp_path):
    app = create_app(str(tmp_path / "revoke.db"))
    app.state.interpreter = FakeInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client, threshold="100")
        revoked = client.post(f"/api/mandates/{mandate['id']}/revoke")

        assert revoked.status_code == 200
        body = revoked.json()
        assert body["decision"] == "REVOKE"
        assert body["reason_code"] == "MANDATE_REVOKED"
        assert body["tx_hash"] is None

        stored_mandate = client.get(f"/api/mandates/{mandate['id']}").json()
        assert stored_mandate["status"] == "REVOKED"
        assert stored_mandate["revocation_id"] == body["revocation_id"]

        blocked = client.post(
            "/api/decisions",
            json={"mandate_id": mandate["id"], "request": "Buy a keyboard"},
        )
        assert blocked.status_code == 201
        assert blocked.json()["decision"] == "BLOCK"
        assert blocked.json()["reason_code"] == "MANDATE_REVOKED"
        assert client.get(f"/api/mandates/{mandate['id']}").json()["remaining_budget"] == "200"

        url = f"/api/mandates/{mandate['id']}/revoke/chain"
        first = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xrevoke"})
        same = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xrevoke"})
        conflict = client.post(url, json={"network": "base-sepolia", "tx_hash": "0xother"})

        assert first.status_code == 200
        assert first.json()["tx_hash"] == "0xrevoke"
        assert same.status_code == 200
        assert conflict.status_code == 409


def test_revoke_cannot_be_applied_twice(tmp_path):
    app = create_app(str(tmp_path / "revoke-twice.db"))
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        first = client.post(f"/api/mandates/{mandate['id']}/revoke")
        second = client.post(f"/api/mandates/{mandate['id']}/revoke")

        assert first.status_code == 200
        assert second.status_code == 409


def test_new_mandate_stores_and_returns_purpose_category(tmp_path):
    app = create_app(str(tmp_path / "purpose-category.db"))
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        assert mandate["purpose_category"] == "OFFICE"
        assert client.get(f"/api/mandates/{mandate['id']}").json()["purpose_category"] == "OFFICE"


def test_purpose_mismatch_persists_without_budget_deduction(tmp_path):
    app = create_app(str(tmp_path / "purpose-mismatch.db"))
    app.state.interpreter = FoodInterpreter()
    with TestClient(app) as client:
        mandate = create_test_mandate(client)
        response = client.post(
            "/api/decisions",
            json={"mandate_id": mandate["id"], "request": "Buy lunch from Amazon for $65"},
        )
        assert response.status_code == 201
        receipt = response.json()
        assert receipt["decision"] == "BLOCK"
        assert receipt["reason_code"] == "PURPOSE_NOT_ALLOWED"
        assert receipt["matched_rule"] == "purpose_category"
        assert receipt["structured_request"]["purpose_category"] == "FOOD"
        assert client.get(f"/api/mandates/{mandate['id']}").json()["remaining_budget"] == "200"
        assert client.get(f"/api/decisions/{receipt['decision_id']}").json()["reason_code"] == "PURPOSE_NOT_ALLOWED"


def test_old_database_migrates_legacy_mandate_and_decision(tmp_path):
    db_path = tmp_path / "legacy.db"
    created = datetime.now(timezone.utc)
    expires = created + timedelta(days=1)
    legacy_purchase = {
        "merchant": "Amazon", "amount": "10", "currency": "USD",
        "item": "Paper", "purpose": "Office supplies",
    }
    with sqlite3.connect(db_path) as connection:
        connection.executescript("""
            CREATE TABLE mandates (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, purpose TEXT NOT NULL,
                total_budget TEXT NOT NULL, remaining_budget TEXT NOT NULL,
                currency TEXT NOT NULL, allowed_merchants TEXT NOT NULL,
                expires_at TEXT NOT NULL, human_approval_threshold TEXT NOT NULL,
                status TEXT NOT NULL, created_at TEXT NOT NULL
            );
            CREATE TABLE decisions (
                decision_id TEXT PRIMARY KEY, mandate_id TEXT NOT NULL,
                original_request TEXT NOT NULL, structured_request TEXT NOT NULL,
                decision TEXT NOT NULL, matched_rule TEXT NOT NULL,
                reason_code TEXT NOT NULL, reason TEXT NOT NULL,
                timestamp TEXT NOT NULL, blockchain_network TEXT, tx_hash TEXT
            );
        """)
        connection.execute(
            "INSERT INTO mandates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ("legacy-mandate", "Legacy", "Office supplies", "100", "100", "USD",
             json.dumps(["Amazon"]), expires.isoformat(), "80", "ACTIVE", created.isoformat()),
        )
        connection.execute(
            "INSERT INTO decisions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
            ("legacy-decision", "legacy-mandate", "Buy paper", json.dumps(legacy_purchase),
             "ALLOW", "all_checks_passed", "POLICY_ALLOW", "Allowed", created.isoformat()),
        )

    app = create_app(str(db_path))
    with TestClient(app) as client:
        mandate = client.get("/api/mandates/legacy-mandate")
        decision = client.get("/api/decisions/legacy-decision")
        assert mandate.status_code == 200
        assert mandate.json()["purpose_category"] is None
        assert decision.status_code == 200
        assert decision.json()["structured_request"]["purpose_category"] is None
        legacy_normalized = json.dumps(legacy_purchase, sort_keys=True, separators=(",", ":"))
        assert decision.json()["audit_payload"]["purchase_request_hash"] == (
            "0x" + hashlib.sha256(legacy_normalized.encode()).hexdigest()
        )
