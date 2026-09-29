# CLAMP backend

FastAPI + SQLite MVP for spending mandates, deterministic purchase authorization, decision receipts, Kiln usage metrics, and unsigned blockchain audit payloads.

## Setup

Python 3.11+ is recommended.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set the Kiln key in `backend/.env` for local development or export it in the shell. An exported value takes precedence over `.env`. The application reads the key only from the resulting `KILN_API_KEY` environment variable and never persists it.

```bash
uvicorn app.main:app --reload --port 8000
```

By default SQLite data is stored at `backend/clamp.db`. Set `DATABASE_PATH` to override it. Local CORS origins default to ports 3000 and 5173 and can be changed with a comma-separated `CORS_ORIGINS` value.

Interactive API documentation is available at `http://localhost:8000/docs` and health at `http://localhost:8000/health`.

## Flow

1. `POST /api/mandates` creates an ACTIVE mandate.
2. `POST /api/decisions` sends only the interpretation task to Kiln, parses its JSON with `json.loads`, validates it with Pydantic, and passes it to the deterministic policy engine.
3. An ALLOW reserves the amount immediately. NEEDS_HUMAN reserves it only after `POST /api/decisions/{id}/approve` succeeds.
4. The response includes an unsigned `audit_payload`. After the frontend writes it on-chain, `POST /api/decisions/{id}/chain` attaches `{ "network": "base-sepolia", "tx_hash": "0x..." }`.

Kiln is never asked whether a purchase should be allowed. Malformed/empty Kiln output returns HTTP 502. Calls that reach Kiln are recorded even when the response is invalid; failed interpretations have no decision ID because no receipt exists yet.

## Example

```bash
curl -X POST http://localhost:8000/api/mandates \
  -H 'content-type: application/json' \
  -d '{
    "name":"Office supplies",
    "purpose":"Buy work equipment",
    "total_budget":"250.00",
    "currency":"USD",
    "allowed_merchants":["Amazon"],
    "expires_at":"2026-12-31T23:59:59Z",
    "human_approval_threshold":"100.00"
  }'
```

Then use the returned mandate ID:

```bash
curl -X POST http://localhost:8000/api/decisions \
  -H 'content-type: application/json' \
  -d '{"mandate_id":"MANDATE_ID","request":"Buy a keyboard for $65 from Amazon."}'
```

## Endpoints

- `GET /health`
- `POST /api/mandates`
- `GET /api/mandates`
- `GET /api/mandates/{id}`
- `POST /api/decisions`
- `GET /api/decisions`
- `GET /api/decisions/{id}`
- `POST /api/decisions/{id}/approve`
- `POST /api/decisions/{id}/chain`
- `GET /api/metrics/summary`

## Tests

```bash
cd backend
pytest -q
```

The policy tests do not use Kiln. The API test injects a fake interpreter, exercises SQLite, budget deduction, audit payload generation, metrics, and chain attachment.

## Real Kiln smoke test

The smoke test uses the real application, real Kiln client, and a temporary SQLite database. It creates a fresh equivalent mandate per scenario because an ALLOW reserves budget and would otherwise change later scenarios.

```bash
cd backend
KILN_API_KEY="your-key" python scripts/smoke_real.py
```

It exits non-zero if A/B/C do not produce ALLOW/BLOCK/NEEDS_HUMAN and prints the structured receipts, metrics summary, and persisted per-call token/latency rows. The temporary database is removed when the script exits.
