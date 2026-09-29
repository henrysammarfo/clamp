from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MandateStatus(str, Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"


class DecisionValue(str, Enum):
    ALLOW = "ALLOW"
    BLOCK = "BLOCK"
    NEEDS_HUMAN = "NEEDS_HUMAN"


class MandateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    purpose: str = Field(min_length=1, max_length=500)
    total_budget: Decimal = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    allowed_merchants: list[str] = Field(min_length=1)
    expires_at: datetime
    human_approval_threshold: Decimal = Field(gt=0)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()

    @field_validator("allowed_merchants")
    @classmethod
    def clean_merchants(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if not cleaned:
            raise ValueError("at least one non-empty merchant is required")
        return list(dict.fromkeys(cleaned))

    @field_validator("expires_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("expires_at must include a timezone")
        return value.astimezone(timezone.utc)


class Mandate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    purpose: str
    total_budget: Decimal
    remaining_budget: Decimal
    currency: str
    allowed_merchants: list[str]
    expires_at: datetime
    human_approval_threshold: Decimal
    status: MandateStatus
    created_at: datetime


class StructuredPurchaseRequest(BaseModel):
    merchant: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    item: str = Field(min_length=1, max_length=500)
    purpose: str = Field(min_length=1, max_length=500)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()

    @field_validator("merchant", "item", "purpose")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class DecisionCreate(BaseModel):
    mandate_id: str
    request: str = Field(min_length=1, max_length=4000)


class PolicyResult(BaseModel):
    decision: DecisionValue
    reason_code: str
    matched_rule: str
    reason: str


class AuditPayload(BaseModel):
    decision_id: str
    mandate_id: str
    purchase_request_hash: str
    decision: DecisionValue
    reason_code: str
    timestamp: datetime


class DecisionReceipt(BaseModel):
    id: str
    decision_id: str
    mandate_id: str
    original_request: str
    structured_request: StructuredPurchaseRequest
    decision: DecisionValue
    matched_rule: str
    reason_code: str
    reason: str
    timestamp: datetime
    blockchain_network: str | None = None
    tx_hash: str | None = None
    audit_payload: AuditPayload


class ChainAttachment(BaseModel):
    network: str = Field(min_length=1, max_length=100)
    tx_hash: str = Field(min_length=1, max_length=200)


class KilnCallMetric(BaseModel):
    request_id: str | None = None
    model: str
    stage: Literal["INTERPRET", "EXPLAIN"]
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    latency_ms: int

