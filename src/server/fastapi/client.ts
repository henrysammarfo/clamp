import type {
  FastApiDecision,
  FastApiMandate,
  FastApiMandateCreate,
  FastApiMetrics,
} from "./types";

const DEFAULT_FASTAPI_BASE_URL = "http://127.0.0.1:8000";

export class FastApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FastApiError";
  }
}

function baseUrl(): string {
  const value = process.env["FASTAPI_BASE_URL"] ?? DEFAULT_FASTAPI_BASE_URL;
  return value.replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `FastAPI request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") message = body.detail;
      else if (body.detail) message = JSON.stringify(body.detail);
    } catch {
      // Keep the status-only message when the response is not JSON.
    }
    throw new FastApiError(message, response.status);
  }
  return (await response.json()) as T;
}

export const fastApiClient = {
  health: () => request<unknown>("/health"),
  listMandates: () => request<FastApiMandate[]>("/api/mandates"),
  getMandate: (id: string) => request<FastApiMandate>(`/api/mandates/${encodeURIComponent(id)}`),
  createMandate: (input: FastApiMandateCreate) =>
    request<FastApiMandate>("/api/mandates", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  attachMandateChain: (id: string, input: { network: string; tx_hash: string }) =>
    request<FastApiMandate>(`/api/mandates/${encodeURIComponent(id)}/chain`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listDecisions: () => request<FastApiDecision[]>("/api/decisions"),
  getDecision: (id: string) => request<FastApiDecision>(`/api/decisions/${encodeURIComponent(id)}`),
  createDecision: (input: { mandate_id: string; request: string }) =>
    request<FastApiDecision>("/api/decisions", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  approveDecision: (id: string) =>
    request<FastApiDecision>(`/api/decisions/${encodeURIComponent(id)}/approve`, {
      method: "POST",
    }),
  attachChain: (id: string, input: { network: string; tx_hash: string }) =>
    request<FastApiDecision>(`/api/decisions/${encodeURIComponent(id)}/chain`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getMetrics: () => request<FastApiMetrics>("/api/metrics/summary"),
};

export function fastApiRuntimeStatus() {
  return { baseUrl: baseUrl() };
}
