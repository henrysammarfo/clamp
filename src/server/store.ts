import type { Decision, Mandate } from "@/lib/clamp-types";

type TenantBucket = {
  mandates: Map<string, Mandate>;
  decisions: Map<string, Decision>;
};

const globalStore = globalThis as typeof globalThis & {
  __clampTenantStore?: Map<string, TenantBucket>;
};

function root(): Map<string, TenantBucket> {
  if (!globalStore.__clampTenantStore) {
    globalStore.__clampTenantStore = new Map();
  }
  return globalStore.__clampTenantStore;
}

function bucket(tenantId: string): TenantBucket {
  const map = root();
  let item = map.get(tenantId);
  if (!item) {
    item = { mandates: new Map(), decisions: new Map() };
    map.set(tenantId, item);
  }
  return item;
}

export function listMandates(tenantId: string): Mandate[] {
  return [...bucket(tenantId).mandates.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getMandate(tenantId: string, id: string): Mandate | null {
  return bucket(tenantId).mandates.get(id) ?? null;
}

export function saveMandate(mandate: Mandate): Mandate {
  bucket(mandate.tenantId).mandates.set(mandate.id, mandate);
  return mandate;
}

export function listDecisions(tenantId: string): Decision[] {
  return [...bucket(tenantId).decisions.values()].sort((a, b) => b.time.localeCompare(a.time));
}

export function getDecision(tenantId: string, id: string): Decision | null {
  return bucket(tenantId).decisions.get(id) ?? null;
}

export function saveDecision(decision: Decision): Decision {
  bucket(decision.tenantId).decisions.set(decision.id, decision);
  return decision;
}

export function clearTenant(tenantId: string): void {
  root().delete(tenantId);
}
