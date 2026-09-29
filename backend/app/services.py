import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException

from .database import Database
from .models import (
    AuditPayload,
    ChainAttachment,
    DecisionReceipt,
    DecisionValue,
    KilnCallMetric,
    Mandate,
    MandateCreate,
    MandateStatus,
    StructuredPurchaseRequest,
)
from .policy import evaluate_policy


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _mandate_from_row(row: sqlite3.Row) -> Mandate:
    return Mandate(
        id=row["id"], name=row["name"], purpose=row["purpose"],
        total_budget=Decimal(row["total_budget"]), remaining_budget=Decimal(row["remaining_budget"]),
        currency=row["currency"], allowed_merchants=json.loads(row["allowed_merchants"]),
        expires_at=datetime.fromisoformat(row["expires_at"]),
        human_approval_threshold=Decimal(row["human_approval_threshold"]),
        status=row["status"], created_at=datetime.fromisoformat(row["created_at"]),
        blockchain_network=row["blockchain_network"], tx_hash=row["tx_hash"],
    )


def _normalized_hash(purchase: StructuredPurchaseRequest) -> str:
    normalized = json.dumps(purchase.model_dump(mode="json"), sort_keys=True, separators=(",", ":"))
    return "0x" + hashlib.sha256(normalized.encode()).hexdigest()


def _receipt_from_row(row: sqlite3.Row) -> DecisionReceipt:
    purchase = StructuredPurchaseRequest.model_validate_json(row["structured_request"])
    timestamp = datetime.fromisoformat(row["timestamp"])
    return DecisionReceipt(
        id=row["decision_id"], decision_id=row["decision_id"], mandate_id=row["mandate_id"],
        original_request=row["original_request"], structured_request=purchase,
        decision=row["decision"], matched_rule=row["matched_rule"], reason_code=row["reason_code"],
        reason=row["reason"], timestamp=timestamp, blockchain_network=row["blockchain_network"],
        tx_hash=row["tx_hash"],
        audit_payload=AuditPayload(
            decision_id=row["decision_id"], mandate_id=row["mandate_id"],
            purchase_request_hash=_normalized_hash(purchase), decision=row["decision"],
            reason_code=row["reason_code"], timestamp=timestamp,
        ),
    )


class ClampService:
    def __init__(self, db: Database):
        self.db = db

    def create_mandate(self, data: MandateCreate) -> Mandate:
        mandate_id, created = str(uuid4()), utcnow()
        with self.db.transaction() as connection:
            connection.execute(
                "INSERT INTO mandates (id, name, purpose, total_budget, remaining_budget, currency, allowed_merchants, expires_at, human_approval_threshold, status, created_at, blockchain_network, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
                (mandate_id, data.name, data.purpose, str(data.total_budget), str(data.total_budget),
                 data.currency, json.dumps(data.allowed_merchants), data.expires_at.isoformat(),
                 str(data.human_approval_threshold), MandateStatus.ACTIVE.value, created.isoformat()),
            )
        return self.get_mandate(mandate_id)

    def get_mandate(self, mandate_id: str, connection=None) -> Mandate:
        owns = connection is None
        connection = connection or self.db.connect()
        try:
            row = connection.execute("SELECT * FROM mandates WHERE id = ?", (mandate_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Mandate not found")
            mandate = _mandate_from_row(row)
            if mandate.status == MandateStatus.ACTIVE and mandate.expires_at <= utcnow():
                connection.execute("UPDATE mandates SET status = 'EXPIRED' WHERE id = ?", (mandate_id,))
                if owns:
                    connection.commit()
                mandate.status = MandateStatus.EXPIRED
            return mandate
        finally:
            if owns:
                connection.close()

    def list_mandates(self) -> list[Mandate]:
        with self.db.connect() as connection:
            ids = [row[0] for row in connection.execute("SELECT id FROM mandates ORDER BY created_at DESC")]
        return [self.get_mandate(mandate_id) for mandate_id in ids]

    def save_metric(self, metric: KilnCallMetric, decision_id: str | None) -> None:
        with self.db.transaction() as connection:
            connection.execute(
                "INSERT INTO kiln_calls (request_id, model, stage, prompt_tokens, completion_tokens, total_tokens, latency_ms, timestamp, decision_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (metric.request_id, metric.model, metric.stage, metric.prompt_tokens, metric.completion_tokens,
                 metric.total_tokens, metric.latency_ms, utcnow().isoformat(), decision_id),
            )

    def create_decision(self, mandate_id: str, original_request: str, purchase: StructuredPurchaseRequest) -> DecisionReceipt:
        decision_id, timestamp = str(uuid4()), utcnow()
        with self.db.transaction() as connection:
            mandate = self.get_mandate(mandate_id, connection)
            result = evaluate_policy(mandate, purchase, now=timestamp)
            if result.decision == DecisionValue.ALLOW:
                new_budget = mandate.remaining_budget - purchase.amount
                connection.execute("UPDATE mandates SET remaining_budget = ? WHERE id = ?", (str(new_budget), mandate_id))
            connection.execute(
                "INSERT INTO decisions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
                (decision_id, mandate_id, original_request, purchase.model_dump_json(), result.decision.value,
                 result.matched_rule, result.reason_code, result.reason, timestamp.isoformat()),
            )
        return self.get_decision(decision_id)

    def get_decision(self, decision_id: str) -> DecisionReceipt:
        with self.db.connect() as connection:
            row = connection.execute("SELECT * FROM decisions WHERE decision_id = ?", (decision_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Decision not found")
        return _receipt_from_row(row)

    def list_decisions(self) -> list[DecisionReceipt]:
        with self.db.connect() as connection:
            rows = connection.execute("SELECT * FROM decisions ORDER BY timestamp DESC").fetchall()
        return [_receipt_from_row(row) for row in rows]

    def approve(self, decision_id: str) -> DecisionReceipt:
        with self.db.transaction() as connection:
            row = connection.execute("SELECT * FROM decisions WHERE decision_id = ?", (decision_id,)).fetchone()
            if not row:
                raise HTTPException(404, "Decision not found")
            if row["decision"] != DecisionValue.NEEDS_HUMAN.value:
                raise HTTPException(409, "Only NEEDS_HUMAN decisions can be approved")
            mandate = self.get_mandate(row["mandate_id"], connection)
            purchase = StructuredPurchaseRequest.model_validate_json(row["structured_request"])
            if mandate.status != MandateStatus.ACTIVE or mandate.remaining_budget < purchase.amount:
                raise HTTPException(409, "Mandate is no longer active or has insufficient budget")
            connection.execute("UPDATE mandates SET remaining_budget = ? WHERE id = ?", (str(mandate.remaining_budget - purchase.amount), mandate.id))
            connection.execute(
                "UPDATE decisions SET decision = 'ALLOW', matched_rule = 'human_approval', reason_code = 'HUMAN_APPROVED', reason = 'A human approved this purchase.' WHERE decision_id = ?",
                (decision_id,),
            )
        return self.get_decision(decision_id)

    def attach_mandate_chain(self, mandate_id: str, data: ChainAttachment) -> Mandate:
        with self.db.transaction() as connection:
            existing = connection.execute(
                "SELECT blockchain_network, tx_hash FROM mandates WHERE id = ?",
                (mandate_id,),
            ).fetchone()
            if not existing:
                raise HTTPException(404, "Mandate not found")
            if existing["tx_hash"]:
                if existing["blockchain_network"] != data.network or existing["tx_hash"] != data.tx_hash:
                    raise HTTPException(409, "Blockchain transaction is already attached")
            else:
                connection.execute(
                    "UPDATE mandates SET blockchain_network = ?, tx_hash = ? WHERE id = ?",
                    (data.network, data.tx_hash, mandate_id),
                )
        return self.get_mandate(mandate_id)

    def attach_chain(self, decision_id: str, data: ChainAttachment) -> DecisionReceipt:
        with self.db.transaction() as connection:
            existing = connection.execute(
                "SELECT decision, blockchain_network, tx_hash FROM decisions WHERE decision_id = ?",
                (decision_id,),
            ).fetchone()
            if not existing:
                raise HTTPException(404, "Decision not found")
            if existing["decision"] == DecisionValue.NEEDS_HUMAN.value:
                raise HTTPException(409, "Decision must be approved before blockchain attachment")
            if existing["tx_hash"]:
                if existing["blockchain_network"] != data.network or existing["tx_hash"] != data.tx_hash:
                    raise HTTPException(409, "Blockchain transaction is already attached")
            else:
                connection.execute(
                    "UPDATE decisions SET blockchain_network = ?, tx_hash = ? WHERE decision_id = ?",
                    (data.network, data.tx_hash, decision_id),
                )
        return self.get_decision(decision_id)

    def metrics_summary(self) -> dict:
        with self.db.connect() as connection:
            decisions = {row["decision"]: row["count"] for row in connection.execute("SELECT decision, COUNT(*) count FROM decisions GROUP BY decision")}
            kiln = connection.execute("SELECT COUNT(*) calls, COALESCE(SUM(prompt_tokens), 0) prompt, COALESCE(SUM(completion_tokens), 0) completion, COALESCE(SUM(total_tokens), 0) total, COALESCE(AVG(latency_ms), 0) latency FROM kiln_calls").fetchone()
        return {"decisions": {value.value: decisions.get(value.value, 0) for value in DecisionValue}, "kiln": {"calls": kiln["calls"], "prompt_tokens": kiln["prompt"], "completion_tokens": kiln["completion"], "total_tokens": kiln["total"], "average_latency_ms": round(kiln["latency"], 2)}}
