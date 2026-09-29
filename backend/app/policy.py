from datetime import datetime, timezone

from .models import DecisionValue, Mandate, MandateStatus, PolicyResult, StructuredPurchaseRequest


def evaluate_policy(
    mandate: Mandate,
    purchase: StructuredPurchaseRequest,
    *,
    now: datetime | None = None,
) -> PolicyResult:
    """Evaluate authorization using fixed, deterministic rule order. No I/O or LLMs."""
    current_time = now or datetime.now(timezone.utc)

    if mandate.status == MandateStatus.REVOKED:
        return PolicyResult(
            decision=DecisionValue.BLOCK,
            reason_code="MANDATE_REVOKED",
            matched_rule="revoked_mandate",
            reason="This spending mandate has been revoked.",
        )
    if mandate.status == MandateStatus.EXPIRED or mandate.expires_at <= current_time:
        return PolicyResult(
            decision=DecisionValue.BLOCK,
            reason_code="MANDATE_EXPIRED",
            matched_rule="expired_mandate",
            reason="This spending mandate has expired.",
        )
    allowed = {merchant.casefold() for merchant in mandate.allowed_merchants}
    if purchase.merchant.casefold() not in allowed:
        return PolicyResult(
            decision=DecisionValue.BLOCK,
            reason_code="MERCHANT_NOT_ALLOWED",
            matched_rule="merchant_allowlist",
            reason=f"Merchant '{purchase.merchant}' is not allowed by this mandate.",
        )
    if purchase.amount > mandate.remaining_budget:
        return PolicyResult(
            decision=DecisionValue.BLOCK,
            reason_code="BUDGET_EXCEEDED",
            matched_rule="remaining_budget",
            reason="The purchase amount exceeds the mandate's remaining budget.",
        )
    if purchase.currency != mandate.currency:
        return PolicyResult(
            decision=DecisionValue.BLOCK,
            reason_code="CURRENCY_MISMATCH",
            matched_rule="currency_match",
            reason=f"Purchase currency {purchase.currency} does not match mandate currency {mandate.currency}.",
        )
    if purchase.amount >= mandate.human_approval_threshold:
        return PolicyResult(
            decision=DecisionValue.NEEDS_HUMAN,
            reason_code="HUMAN_APPROVAL_REQUIRED",
            matched_rule="human_approval_threshold",
            reason="The purchase amount meets or exceeds the human approval threshold.",
        )
    return PolicyResult(
        decision=DecisionValue.ALLOW,
        reason_code="POLICY_ALLOW",
        matched_rule="all_checks_passed",
        reason="The purchase satisfies every mandate rule.",
    )
