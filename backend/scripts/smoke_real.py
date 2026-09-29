"""Run the real Kiln -> policy -> SQLite integration smoke test.

Usage from backend/: KILN_API_KEY=... python scripts/smoke_real.py
Each scenario gets a fresh mandate so ALLOW budget reservation does not affect
the NEEDS_HUMAN scenario.
"""

import json
import os
import sqlite3
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import create_app  # noqa: E402


SCENARIOS = [
    ("A", "Buy a keyboard from Amazon for $65.", "ALLOW"),
    ("B", "Buy AirPods from Apple for $120.", "BLOCK"),
    ("C", "Buy an office chair from Amazon for $90.", "NEEDS_HUMAN"),
]


def main() -> int:
    if not os.getenv("KILN_API_KEY"):
        print("KILN_API_KEY is required", file=sys.stderr)
        return 2

    with tempfile.TemporaryDirectory(prefix="clamp-smoke-") as directory:
        db_path = str(Path(directory) / "smoke.db")
        app = create_app(db_path)
        results = []
        failure = None
        with TestClient(app) as client:
            for label, natural_request, expected in SCENARIOS:
                mandate_response = client.post(
                    "/api/mandates",
                    json={
                        "name": f"Kiln smoke {label}",
                        "purpose": "Office supplies",
                        "total_budget": "100",
                        "currency": "USD",
                        "allowed_merchants": ["Amazon"],
                        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
                        "human_approval_threshold": "80",
                    },
                )
                mandate_response.raise_for_status()
                decision_response = client.post(
                    "/api/decisions",
                    json={"mandate_id": mandate_response.json()["id"], "request": natural_request},
                )
                if not decision_response.is_success:
                    failure = {
                        "scenario": label,
                        "status_code": decision_response.status_code,
                        "error": decision_response.json(),
                    }
                    break
                receipt = decision_response.json()
                if receipt["decision"] != expected:
                    raise AssertionError(f"Scenario {label}: expected {expected}, got {receipt['decision']}")
                results.append({"scenario": label, "mandate": mandate_response.json(), "receipt": receipt})

            metrics = client.get("/api/metrics/summary")
            metrics.raise_for_status()

        with sqlite3.connect(db_path) as connection:
            connection.row_factory = sqlite3.Row
            persisted_calls = [dict(row) for row in connection.execute(
                "SELECT request_id, model, stage, prompt_tokens, completion_tokens, total_tokens, latency_ms, decision_id FROM kiln_calls ORDER BY id"
            )]

        print(json.dumps({"flows": results, "failure": failure, "metrics": metrics.json(), "persisted_kiln_calls": persisted_calls}, indent=2))
    return 1 if failure else 0


if __name__ == "__main__":
    raise SystemExit(main())
