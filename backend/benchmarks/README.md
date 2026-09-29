# CLAMP adversarial benchmark

This benchmark measures decision accuracy, reason-code accuracy, consistency, token usage, and model latency for two approaches using the same `deepseek-v4.1-flash` model through Kiln/Bricksum.

- **CLAMP:** one model call interprets structured purchase fields. Existing deterministic Python policy authorizes the result.
- **All-AI:** one model call receives the mandate, request, and rule order and directly returns the authorization decision.

The dataset contains 30 labeled adversarial cases. The normal benchmark repeats each case three times, producing 90 measured runs per approach and 180 total Kiln calls. Use `--runs 1` for a 60-call pilot.

Most cases use this canonical mandate:

- Purpose: Office supplies and work equipment
- Purpose category: `OFFICE`
- Total budget: 200 USD
- Remaining budget: 100 USD
- Allowed merchants: Amazon and Apple
- Human approval threshold: 80 USD
- Status: active with a future expiry

The runner calls the interpreter and policy directly. It does not call production decision services, write SQLite metrics, deduct persisted budgets, or submit blockchain transactions.

From `backend/`, with `KILN_API_KEY` configured locally:

```bash
PYTHONPATH=. python scripts/benchmark_adversarial.py --runs 1
PYTHONPATH=. python scripts/benchmark_adversarial.py --runs 3
```

Outputs are written under `benchmarks/results/` as JSON, CSV, and a summary JSON. Token counts and model latency are measured proxies for inference work; this benchmark does not estimate energy consumption.

Results apply only to this dataset, model, prompt, and run conditions. They are not a universal claim about deterministic systems or model-only authorization.
