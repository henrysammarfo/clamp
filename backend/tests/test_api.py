from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.kiln import InterpretationResult
from app.main import create_app
from app.models import KilnCallMetric, StructuredPurchaseRequest


class FakeInterpreter:
    def interpret(self, request, mandate_currency):
        return InterpretationResult(
            purchase=StructuredPurchaseRequest(merchant="Amazon", amount="65", currency="USD", item="Keyboard", purpose="Work"),
            metric=KilnCallMetric(request_id="fake-1", model="gpt-oss-120b", stage="INTERPRET", prompt_tokens=10, completion_tokens=5, total_tokens=15, latency_ms=20),
        )


class ThresholdInterpreter:
    def interpret(self, request, mandate_currency):
        return InterpretationResult(
            purchase=StructuredPurchaseRequest(merchant="Amazon", amount="90", currency="USD", item="Chair", purpose="Office supplies"),
            metric=KilnCallMetric(model="gpt-oss-120b", stage="INTERPRET", latency_ms=1),
        )


def create_test_mandate(client, *, total="200", threshold="80"):
    response = client.post("/api/mandates", json={
        "name": "Office", "purpose": "Office supplies", "total_budget": total, "currency": "USD",
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
            "name": "Office", "purpose": "Equipment", "total_budget": "200", "currency": "USD",
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
