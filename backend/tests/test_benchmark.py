from copy import deepcopy
from decimal import Decimal

from app.models import PurposeCategory, StructuredPurchaseRequest
from app.policy import evaluate_policy
from scripts.benchmark_adversarial import (
    calculate_consistency,
    calculate_summary,
    load_cases,
    mandate_for_case,
    parse_all_ai_content,
)


def test_dataset_contains_exactly_30_valid_cases():
    cases = load_cases()
    assert len(cases) == 30
    assert {case["expected_decision"] for case in cases} <= {
        "ALLOW", "BLOCK", "NEEDS_HUMAN"
    }


def test_representative_combined_cases_follow_precedence():
    cases = {case["id"]: case for case in load_cases()}
    assert cases["combined_01"]["expected_reason_code"] == "PURPOSE_NOT_ALLOWED"
    assert cases["combined_02"]["expected_reason_code"] == "MERCHANT_NOT_ALLOWED"
    assert cases["combined_03"]["expected_reason_code"] == "BUDGET_EXCEEDED"
    assert cases["combined_04"]["expected_reason_code"] == "CURRENCY_MISMATCH"
    assert cases["lifecycle_03"]["expected_reason_code"] == "MANDATE_REVOKED"


def test_summary_and_consistency_calculation():
    records = [
        {
            "approach": approach, "case_id": case_id, "actual_decision": decision,
            "correct_decision": correct, "correct_reason": correct,
            "latency_ms": 10, "prompt_tokens": 2, "completion_tokens": 1,
            "total_tokens": 3, "parse_error": False,
        }
        for approach in ("CLAMP", "ALL_AI")
        for case_id, decisions in (("a", ["ALLOW", "ALLOW", "ALLOW"]), ("b", ["BLOCK", "ALLOW", "BLOCK"]))
        for decision, correct in zip(decisions, [True, True, False])
    ]
    assert calculate_consistency(
        [record for record in records if record["approach"] == "CLAMP"], 3
    )["consistent_cases"] == 1
    summary = calculate_summary(records, total_cases=2, expected_runs=3)
    assert summary["CLAMP"]["runs"] == 6
    assert summary["CLAMP"]["decision_correct"] == 4
    assert summary["CLAMP"]["decision_accuracy_pct"] == 66.67
    assert summary["CLAMP"]["consistency_pct"] == 50.0
    assert summary["ALL_AI"]["total_tokens"] == 18


def test_malformed_all_ai_output_is_invalid_and_counted_incorrect():
    parsed, error = parse_all_ai_content("not json")
    assert parsed is None
    assert error == "invalid_json"
    record = {
        "approach": "ALL_AI", "case_id": "bad", "actual_decision": None,
        "correct_decision": False, "correct_reason": False, "latency_ms": 5,
        "prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2,
        "parse_error": True,
    }
    summary = calculate_summary([record], total_cases=1, expected_runs=1)
    assert summary["ALL_AI"]["decision_correct"] == 0
    assert summary["ALL_AI"]["malformed_outputs"] == 1


def test_benchmark_policy_does_not_mutate_remaining_budget():
    case = deepcopy(load_cases()[0])
    mandate = mandate_for_case(case)
    before = mandate.remaining_budget
    purchase = StructuredPurchaseRequest(
        merchant="Amazon", amount=Decimal("25"), currency="USD", item="Paper",
        purpose="Office supplies", purpose_category=PurposeCategory.OFFICE,
    )
    result = evaluate_policy(mandate, purchase)
    assert result.decision.value == "ALLOW"
    assert mandate.remaining_budget == before
