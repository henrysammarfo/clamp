from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.models import (
    DecisionValue,
    Mandate,
    MandateStatus,
    PurposeCategory,
    StructuredPurchaseRequest,
)
from app.policy import evaluate_policy


NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)


def mandate(**overrides) -> Mandate:
    values = {
        "id": "m1", "name": "Office", "purpose": "Equipment",
        "purpose_category": PurposeCategory.OFFICE,
        "total_budget": Decimal("500"), "remaining_budget": Decimal("200"),
        "currency": "USD", "allowed_merchants": ["Amazon"],
        "expires_at": NOW + timedelta(days=1),
        "human_approval_threshold": Decimal("100"),
        "status": MandateStatus.ACTIVE, "created_at": NOW,
    }
    values.update(overrides)
    return Mandate(**values)


def purchase(**overrides) -> StructuredPurchaseRequest:
    values = {
        "merchant": "Amazon", "amount": Decimal("65"), "currency": "USD",
        "item": "Keyboard", "purpose": "Work equipment",
        "purpose_category": PurposeCategory.OFFICE,
    }
    values.update(overrides)
    return StructuredPurchaseRequest(**values)


def test_office_category_allows_when_other_rules_pass():
    assert evaluate_policy(mandate(), purchase(), now=NOW).decision == DecisionValue.ALLOW


def test_purpose_mismatch_blocks():
    result = evaluate_policy(mandate(), purchase(purpose_category=PurposeCategory.FOOD), now=NOW)
    assert result.decision == DecisionValue.BLOCK
    assert result.reason_code == "PURPOSE_NOT_ALLOWED"
    assert result.matched_rule == "purpose_category"
    assert "FOOD" in result.reason and "OFFICE" in result.reason


def test_unclassified_purpose_blocks_non_legacy_mandate():
    result = evaluate_policy(mandate(), purchase(purpose_category=None), now=NOW)
    assert result.decision == DecisionValue.BLOCK
    assert result.reason_code == "PURPOSE_UNCLASSIFIED"
    assert result.matched_rule == "purpose_category"


def test_legacy_mandate_skips_purpose_category_rule():
    result = evaluate_policy(
        mandate(purpose_category=None), purchase(purpose_category=PurposeCategory.FOOD), now=NOW
    )
    assert result.decision == DecisionValue.ALLOW


def test_revoked_precedes_purpose_mismatch():
    result = evaluate_policy(
        mandate(status=MandateStatus.REVOKED),
        purchase(purpose_category=PurposeCategory.FOOD),
        now=NOW,
    )
    assert result.reason_code == "MANDATE_REVOKED"


def test_expired_precedes_purpose_mismatch():
    result = evaluate_policy(
        mandate(expires_at=NOW - timedelta(seconds=1)),
        purchase(purpose_category=PurposeCategory.FOOD),
        now=NOW,
    )
    assert result.reason_code == "MANDATE_EXPIRED"


def test_purpose_mismatch_precedes_merchant_mismatch():
    result = evaluate_policy(
        mandate(), purchase(merchant="eBay", purpose_category=PurposeCategory.FOOD), now=NOW
    )
    assert result.reason_code == "PURPOSE_NOT_ALLOWED"


def test_human_threshold_still_applies_after_purpose_passes():
    result = evaluate_policy(mandate(), purchase(amount=Decimal("100")), now=NOW)
    assert result.decision == DecisionValue.NEEDS_HUMAN
    assert result.reason_code == "HUMAN_APPROVAL_REQUIRED"


def test_remaining_rules_still_apply_after_purpose_passes():
    assert evaluate_policy(mandate(), purchase(amount=Decimal("201")), now=NOW).reason_code == "BUDGET_EXCEEDED"
    assert evaluate_policy(mandate(), purchase(merchant="eBay"), now=NOW).reason_code == "MERCHANT_NOT_ALLOWED"
    assert evaluate_policy(mandate(), purchase(currency="EUR"), now=NOW).reason_code == "CURRENCY_MISMATCH"
