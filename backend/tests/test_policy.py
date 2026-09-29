from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.models import DecisionValue, Mandate, MandateStatus, StructuredPurchaseRequest
from app.policy import evaluate_policy


NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)


def mandate(**overrides) -> Mandate:
    values = {
        "id": "m1", "name": "Office", "purpose": "Equipment",
        "total_budget": Decimal("500"), "remaining_budget": Decimal("200"),
        "currency": "USD", "allowed_merchants": ["Amazon"],
        "expires_at": NOW + timedelta(days=1), "human_approval_threshold": Decimal("100"),
        "status": MandateStatus.ACTIVE, "created_at": NOW,
    }
    values.update(overrides)
    return Mandate(**values)


def purchase(**overrides) -> StructuredPurchaseRequest:
    values = {"merchant": "Amazon", "amount": Decimal("65"), "currency": "USD", "item": "Keyboard", "purpose": "Work"}
    values.update(overrides)
    return StructuredPurchaseRequest(**values)


@pytest.mark.parametrize(
    ("mandate_changes", "purchase_changes", "expected"),
    [
        ({}, {}, DecisionValue.ALLOW),
        ({}, {"amount": Decimal("201")}, DecisionValue.BLOCK),
        ({}, {"merchant": "eBay"}, DecisionValue.BLOCK),
        ({"expires_at": NOW - timedelta(seconds=1)}, {}, DecisionValue.BLOCK),
        ({"status": MandateStatus.REVOKED}, {}, DecisionValue.BLOCK),
        ({}, {"amount": Decimal("100")}, DecisionValue.NEEDS_HUMAN),
    ],
)
def test_policy_cases(mandate_changes, purchase_changes, expected):
    assert evaluate_policy(mandate(**mandate_changes), purchase(**purchase_changes), now=NOW).decision == expected


def test_revoked_precedes_expired():
    result = evaluate_policy(mandate(status=MandateStatus.REVOKED, expires_at=NOW - timedelta(days=1)), purchase(), now=NOW)
    assert result.reason_code == "MANDATE_REVOKED"
