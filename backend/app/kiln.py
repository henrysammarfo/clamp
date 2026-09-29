import json
import os
import time
from dataclasses import dataclass

from openai import OpenAI
from pydantic import ValidationError

from .models import KilnCallMetric, StructuredPurchaseRequest


KILN_BASE_URL = "https://api.bricksum.com/v1"
KILN_MODEL = "deepseek-v4.1-flash"


class KilnError(RuntimeError):
    def __init__(self, message: str, metric: KilnCallMetric | None = None):
        super().__init__(message)
        self.metric = metric


@dataclass
class InterpretationResult:
    purchase: StructuredPurchaseRequest
    metric: KilnCallMetric


class KilnInterpreter:
    def interpret(self, request: str, mandate_currency: str) -> InterpretationResult:
        api_key = os.getenv("KILN_API_KEY")
        if not api_key:
            raise KilnError("KILN_API_KEY is not configured")

        client = OpenAI(api_key=api_key, base_url=KILN_BASE_URL)
        prompt = (
            "Extract the purchase request into exactly one JSON object with these keys: "
            "merchant, amount, currency, item, purpose. amount must be a positive JSON number; "
            "currency must be a 3-letter code. Output JSON only, with no markdown or commentary. "
            f"If currency is implied, use {mandate_currency}. Purchase request: {request}"
        )
        started = time.perf_counter()
        try:
            response = client.chat.completions.create(
                model=KILN_MODEL,
                messages=[
                    {"role": "system", "content": "You extract data. Return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0,
            )
        except Exception as exc:
            latency_ms = round((time.perf_counter() - started) * 1000)
            metric = KilnCallMetric(model=KILN_MODEL, stage="INTERPRET", latency_ms=latency_ms)
            raise KilnError(f"Kiln request failed: {exc}", metric) from exc
        latency_ms = round((time.perf_counter() - started) * 1000)
        usage = response.usage
        metric = KilnCallMetric(
            request_id=getattr(response, "id", None),
            model=getattr(response, "model", KILN_MODEL) or KILN_MODEL,
            stage="INTERPRET",
            prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
            completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
            total_tokens=getattr(usage, "total_tokens", 0) or 0,
            latency_ms=latency_ms,
        )
        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise KilnError("Kiln returned an empty response", metric)
        try:
            raw = json.loads(content.strip())
            purchase = StructuredPurchaseRequest.model_validate(raw)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise KilnError("Kiln returned malformed or invalid purchase JSON", metric) from exc
        return InterpretationResult(purchase=purchase, metric=metric)
