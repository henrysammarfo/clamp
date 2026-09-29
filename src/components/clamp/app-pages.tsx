import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  FileCheck2,
  Filter,
  LockKeyhole,
  Search,
  Shield,
  ShieldX,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  explorerTxUrl,
  statusLabel,
  type Decision,
  type DecisionStatus,
  type EfficiencyMetrics,
  type Mandate,
} from "@/lib/clamp-types";
import { getDashboardFn } from "@/api/dashboard";
import {
  getDecisionFn,
  getMetricsFn,
  listDecisionsFn,
  approveReviewFn,
  retryDecisionChainSyncFn,
  submitAgentRequestFn,
} from "@/api/decisions";
import {
  createMandateFn,
  getMandateFn,
  listMandatesFn,
  retryMandateChainSyncFn,
} from "@/api/mandates";
import { getRuntimeStatusFn } from "@/api/settings";
import { AppShell } from "./app-shell";
import { StatusBadge } from "./status-badge";

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed";
}

function DecisionList({ items }: { items: Decision[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No decisions yet for this tenant.</p>;
  }
  return (
    <div className="decision-list">
      {items.map((d) => (
        <Link to="/decisions/$id" params={{ id: d.id }} className="decision-row" key={d.id}>
          <div>
            <h3>{d.merchant}</h3>
            <p>{d.reason}</p>
          </div>
          <StatusBadge status={d.status} />
          <strong>${d.amount.toFixed(2)}</strong>
          <time>{new Date(d.time).toLocaleString()}</time>
        </Link>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Mandate | null>(null);
  const [recent, setRecent] = useState<Decision[]>([]);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardFn()
      .then((data) => {
        setActive(data.activeMandate);
        setRecent(data.recentDecisions);
        setPending(data.totals.pending);
      })
      .catch((e) => setError(errMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const available = active ? Math.max(0, active.budget - active.spent) : 0;

  return (
    <AppShell title="Control room" eyebrow="Tenant workspace">
      {error && (
        <div className="panel mb-5">
          <p className="text-sm">{error}</p>
          <Button asChild className="mt-4">
            <Link to="/sign-in">Sign in</Link>
          </Button>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading tenant state…</p>
      ) : (
        <>
          <div className="metric-grid">
            {[
              [
                "Available",
                active ? `$${available.toFixed(2)}` : "—",
                active ? `of $${active.budget.toFixed(2)} mandate` : "Create a mandate",
              ],
              ["Decisions", String(recent.length), "recent"],
              ["Pending", String(pending), "human review"],
              ["Network", "Base Sepolia", "live when env is set"],
            ].map((x) => (
              <div className="metric-cell" key={x[0]}>
                <p>{x[0]}</p>
                <strong>{x[1]}</strong>
                <span>{x[2]}</span>
              </div>
            ))}
          </div>
          <div className="panel-grid">
            <div className="panel">
              <div className="panel-head">
                <h2>Recent decisions</h2>
                <Link to="/decisions">View ledger</Link>
              </div>
              <DecisionList items={recent.slice(0, 3)} />
            </div>
            <div className="mandate-card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Active mandate</p>
                  <h2>{active?.name ?? "None yet"}</h2>
                </div>
                <StatusBadge status={active?.status === "active" ? "allow" : "block"} />
              </div>
              {active ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {active.purpose} · {active.merchants.join(", ")}
                  </p>
                  <div className="budget-track">
                    <span
                      style={{ width: `${Math.min(100, (active.spent / active.budget) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <strong>${active.spent.toFixed(2)} spent</strong>
                    <span className="text-muted-foreground">${available.toFixed(2)} left</span>
                  </div>
                  <Button asChild variant="outline" className="mt-5 w-full">
                    <Link to="/mandates/$id" params={{ id: active.id }}>
                      Inspect mandate <ArrowRight />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="mt-5 w-full">
                  <Link to="/mandates/new">Create mandate</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="panel mt-5">
            <div className="panel-head">
              <div>
                <h2>CLAMP vs all AI</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Metrics load from Song metering. Fail closed until wired.
                </p>
              </div>
              <Link to="/metrics">Open analysis</Link>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

export function MandatesPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMandatesFn()
      .then((data) => setMandates(data.mandates))
      .catch((e) => setError(errMessage(e)));
  }, []);

  return (
    <AppShell title="Mandates" eyebrow="Delegated authority">
      <div className="page-actions">
        <Button asChild>
          <Link to="/mandates/new">Create mandate</Link>
        </Button>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {mandates.map((m) => (
          <Link
            to="/mandates/$id"
            params={{ id: m.id }}
            className="mandate-card transition-colors hover:bg-accent"
            key={m.id}
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="eyebrow">{m.status}</p>
                <h2 className="mt-2 text-xl font-semibold">{m.name}</h2>
              </div>
              <Shield
                className={m.status === "active" ? "text-success" : "text-muted-foreground"}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {m.purpose} · {m.merchants.join(", ")}
            </p>
            <div className="budget-track">
              <span style={{ width: `${Math.min(100, (m.spent / m.budget) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <strong>
                ${m.spent.toFixed(2)} / ${m.budget}
              </strong>
              <span className="text-muted-foreground">
                {new Date(m.expiresAt).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
        {!mandates.length && !error && (
          <p className="text-sm text-muted-foreground">
            No mandates yet. Create one to commit on chain.
          </p>
        )}
      </div>
    </AppShell>
  );
}

export function NewMandatePage() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [pendingSync, setPendingSync] = useState<Mandate | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const merchants = String(form.get("merchants") ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    setBusy(true);
    try {
      const { mandate } = await createMandateFn({
        data: {
          name: String(form.get("name") ?? ""),
          purpose: String(form.get("purpose") ?? ""),
          budget: Number(form.get("budget")),
          currency: String(form.get("currency") ?? "USD"),
          merchants,
          expiresAt: new Date(String(form.get("expiry") ?? "")).toISOString(),
          humanApprovalThreshold: Number(form.get("humanApprovalThreshold")),
        },
      });
      if (mandate.chainSyncPending && mandate.commitTxHash) {
        setPendingSync(mandate);
        toast.error("Mandate is on chain, but the backend receipt still needs to sync.");
      } else {
        toast.success("Mandate committed and receipt persisted");
        nav({ to: "/mandates/$id", params: { id: mandate.id } });
      }
    } catch (error) {
      toast.error(errMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Create mandate" eyebrow="New delegated authority">
      <form className="panel form-grid" onSubmit={submit}>
        <div className="field field-full">
          <label htmlFor="mandate-name">Mandate name</label>
          <Input id="mandate-name" name="name" defaultValue="Office essentials" required />
        </div>
        <div className="field field-full">
          <label htmlFor="purpose">Purpose</label>
          <Input id="purpose" name="purpose" defaultValue="Office supplies" required />
          <small>The agent may act only for this purpose.</small>
        </div>
        <div className="field">
          <label htmlFor="budget">Total budget</label>
          <Input id="budget" name="budget" type="number" defaultValue="50" min="1" required />
        </div>
        <div className="field">
          <label htmlFor="currency">Currency</label>
          <Input
            id="currency"
            name="currency"
            defaultValue="USD"
            minLength={3}
            maxLength={3}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="human-approval-threshold">Human approval threshold</label>
          <Input
            id="human-approval-threshold"
            name="humanApprovalThreshold"
            type="number"
            defaultValue="40"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="expiry">Expiry</label>
          <Input id="expiry" name="expiry" type="datetime-local" required />
        </div>
        <div className="field field-full">
          <label htmlFor="merchants">Allowed merchants</label>
          <Input id="merchants" name="merchants" defaultValue="Amazon, Apple, Uber" required />
          <small>Separate merchants with commas.</small>
        </div>
        <div className="field-full flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/mandates">Cancel</Link>
          </Button>
          <Button type="submit" disabled={busy || Boolean(pendingSync)}>
            <LockKeyhole /> {busy ? "Committing…" : "Commit mandate"}
          </Button>
        </div>
      </form>
      {pendingSync?.commitTxHash && (
        <div className="panel mt-5">
          <p className="eyebrow">Receipt sync required</p>
          <h2 className="mt-2 font-semibold">Mandate is confirmed on Base Sepolia.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Do not create the mandate again. Retry only the backend receipt sync.
          </p>
          <p className="mt-3 break-all font-mono text-xs">{pendingSync.commitTxHash}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={async () => {
                try {
                  const { mandate } = await retryMandateChainSyncFn({
                    data: {
                      mandateId: pendingSync.id,
                      txHash: pendingSync.commitTxHash!,
                    },
                  });
                  setPendingSync(null);
                  toast.success("Mandate receipt synced");
                  nav({ to: "/mandates/$id", params: { id: mandate.id } });
                } catch (error) {
                  toast.error(errMessage(error));
                }
              }}
            >
              Retry receipt sync
            </Button>
            <Button asChild variant="outline">
              <a href={explorerTxUrl(pendingSync.commitTxHash)} target="_blank" rel="noreferrer">
                <ExternalLink /> View tx
              </a>
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export function MandateDetailPage({ id }: { id: string }) {
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    Promise.all([getMandateFn({ data: { id } }), listDecisionsFn()])
      .then(([m, d]) => {
        setMandate(m.mandate);
        setDecisions(d.decisions.filter((x) => x.mandateId === id));
      })
      .catch((e) => setError(errMessage(e)));
  };

  useEffect(load, [id]);

  if (error) {
    return (
      <AppShell title="Mandate" eyebrow={id}>
        <p className="text-sm text-destructive">{error}</p>
      </AppShell>
    );
  }
  if (!mandate) {
    return (
      <AppShell title="Mandate" eyebrow={id}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={mandate.name}
      eyebrow={`Mandate · ${mandate.id}`}
      action={
        <Button asChild variant="outline">
          <Link to="/requests/new">Test request</Link>
        </Button>
      }
    >
      <div className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Enforced rules</h2>
            <span
              className={`status-badge ${mandate.status === "active" ? "status-allow" : "status-block"}`}
            >
              {mandate.status === "active" ? (
                <>
                  <Shield /> Active
                </>
              ) : (
                <>
                  <ShieldX /> {mandate.status}
                </>
              )}
            </span>
          </div>
          <ul className="rule-list">
            <li>
              <Check /> Purpose: {mandate.purpose}
            </li>
            <li>
              <Check /> Budget: ${mandate.budget.toFixed(2)}, including fees
            </li>
            <li>
              <UserRoundCheck /> Human approval at ${mandate.humanApprovalThreshold.toFixed(2)}
            </li>
            <li>
              <Check /> Merchants: {mandate.merchants.join(", ")}
            </li>
            <li>
              <Check /> Expires: {new Date(mandate.expiresAt).toLocaleString()}
            </li>
          </ul>
          <div className="budget-track">
            <span style={{ width: `${Math.min(100, (mandate.spent / mandate.budget) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <strong>${mandate.spent.toFixed(2)} committed</strong>
            <span>${(mandate.budget - mandate.spent).toFixed(2)} remaining</span>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">On chain commitment</p>
          <h2 className="mt-3 font-mono text-sm break-all">
            {mandate.commitTxHash ?? "No chain receipt attached yet"}
          </h2>
          <p className="my-5 text-sm leading-relaxed text-muted-foreground">
            Base Sepolia · hash {mandate.mandateHash.slice(0, 18)}…
          </p>
          {mandate.commitTxHash && (
            <Button asChild variant="outline" className="mb-3 w-full">
              <a href={explorerTxUrl(mandate.commitTxHash)} target="_blank" rel="noreferrer">
                <ExternalLink /> View on Basescan
              </a>
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full"
            disabled
            title="The FastAPI contract does not currently expose mandate revocation."
          >
            <ShieldX />
            {mandate.status === "revoked" ? "Mandate revoked" : "Revocation unavailable"}
          </Button>
          {mandate.status === "active" && (
            <p className="mt-2 text-xs text-muted-foreground">
              The backend does not currently provide a revocation endpoint.
            </p>
          )}
        </div>
      </div>
      <div className="panel mt-5">
        <div className="panel-head">
          <h2>Decision activity</h2>
        </div>
        <DecisionList items={decisions} />
      </div>
    </AppShell>
  );
}

export function NewRequestPage() {
  const [text, setText] = useState("Buy a $22 USB C hub on BestBuy");
  const [mandateId, setMandateId] = useState("");
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listMandatesFn()
      .then((data) => {
        setMandates(data.mandates.filter((m) => m.status === "active"));
        setMandateId(data.mandates.find((m) => m.status === "active")?.id ?? "");
      })
      .catch((e) => toast.error(errMessage(e)));
  }, []);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    if (!mandateId) {
      toast.error("Create an active mandate first.");
      return;
    }
    setBusy(true);
    setDecision(null);
    try {
      const result = await submitAgentRequestFn({
        data: { mandateId, text },
      });
      setDecision(result.decision);
      toast(statusLabel(result.decision.status));
    } catch (error) {
      toast.error(errMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Agent request" eyebrow="Parse then gate then receipt">
      <form onSubmit={run} className="panel">
        <div className="field">
          <label htmlFor="mandate">Mandate</label>
          <select
            id="mandate"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={mandateId}
            onChange={(e) => setMandateId(e.target.value)}
            required
          >
            <option value="">Select mandate</option>
            {mandates.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field mt-4">
          <label htmlFor="request">What does the agent want to do?</label>
          <Textarea
            id="request"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 text-lg"
          />
          <small>
            Evaluation is performed by FastAPI using Kiln parsing and deterministic policy.
          </small>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            <Sparkles /> {busy ? "Evaluating…" : "Evaluate request"}
          </Button>
          {[
            "Buy $30 of printer paper on Amazon",
            "Buy a $22 USB C hub on BestBuy",
            "Buy a $17 charging cable from Apple",
          ].map((x) => (
            <Button type="button" variant="outline" onClick={() => setText(x)} key={x}>
              {x.split(" ").slice(-1)}
            </Button>
          ))}
        </div>
      </form>
      {decision && (
        <div className="panel mt-5 animate-fade-in">
          <div className="receipt-hero">
            <div>
              <p className="eyebrow">Code gate</p>
              <h2>{statusLabel(decision.status)}.</h2>
            </div>
            <StatusBadge status={decision.status} />
          </div>
          <div className="timeline">
            {[
              ["01", "Request", decision.request],
              ["02", "Parsed action", `${decision.merchant} · $${decision.amount.toFixed(2)}`],
              ["03", "Matched rule", `${decision.rule}: ${decision.reason}`],
              [
                "04",
                "Receipt",
                decision.txHash ??
                  (decision.status === "review"
                    ? "Held for human review. No pay yet."
                    : "Waiting for chain write"),
              ],
            ].map((x) => (
              <div className="timeline-item" key={x[0]}>
                <span>{x[0]}</span>
                <div>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {decision.chainSyncPending && decision.txHash && (
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const result = await retryDecisionChainSyncFn({
                      data: { decisionId: decision.id, txHash: decision.txHash! },
                    });
                    setDecision(result.decision);
                    toast.success("Decision receipt synced");
                  } catch (error) {
                    toast.error(errMessage(error));
                  }
                }}
              >
                Retry receipt sync
              </Button>
            )}
            {decision.txHash && (
              <Button asChild variant="outline">
                <a href={explorerTxUrl(decision.txHash)} target="_blank" rel="noreferrer">
                  <ExternalLink /> View tx
                </a>
              </Button>
            )}
          </div>
          {decision.chainSyncPending && (
            <p className="mt-3 text-xs text-warning">
              The chain transaction is confirmed. Do not submit the purchase request again; retry only receipt sync.
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}

export function DecisionsPage() {
  const [filter, setFilter] = useState<DecisionStatus | "all">("all");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDecisionsFn()
      .then((data) => setDecisions(data.decisions))
      .catch((e) => setError(errMessage(e)));
  }, []);

  const shown = filter === "all" ? decisions : decisions.filter((d) => d.status === filter);

  return (
    <AppShell title="Decisions" eyebrow="Policy ledger">
      <div className="page-actions filter-row">
        {(["all", "allow", "block", "review"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            <Filter />
            {f === "all" ? "All" : statusLabel(f)}
          </Button>
        ))}
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="panel">
        <DecisionList items={shown} />
      </div>
    </AppShell>
  );
}

export function DecisionDetailPage({ id }: { id: string }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDecisionFn({ data: { id } })
      .then((data) => setDecision(data.decision))
      .catch((e) => setError(errMessage(e)));
  }, [id]);

  if (error) {
    return (
      <AppShell title="Decision receipt" eyebrow={id}>
        <p className="text-sm text-destructive">{error}</p>
      </AppShell>
    );
  }
  if (!decision) {
    return (
      <AppShell title="Decision receipt" eyebrow={id}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const copy = () => {
    navigator.clipboard?.writeText(
      `${decision.request}\n${statusLabel(decision.status)}: ${decision.reason}\n${decision.txHash ?? "no tx yet"}`,
    );
    toast.success("Evidence summary copied");
  };

  return (
    <AppShell
      title="Decision receipt"
      eyebrow={`Receipt · ${decision.id}`}
      action={
        <Button variant="outline" onClick={copy}>
          <Copy /> Copy evidence
        </Button>
      }
    >
      <div className="receipt-hero">
        <div>
          <p className="eyebrow">
            {decision.merchant} · {new Date(decision.time).toLocaleString()}
          </p>
          <h2>{statusLabel(decision.status)}.</h2>
        </div>
        <StatusBadge status={decision.status} />
      </div>
      <div className="panel-grid">
        <div className="panel">
          <div className="timeline">
            {[
              ["01", "Original request", decision.request],
              [
                "02",
                "Parsed action",
                `${decision.merchant} · ${decision.amount.toFixed(2)}`,
              ],
              ["03", "Matched rule", decision.rule],
              ["04", "Decision reason", decision.reason],
              [
                "05",
                decision.status === "allow" ? "On-chain audit" : "Stop or hold",
                decision.status === "allow"
                  ? "Decision receipt recorded"
                  : decision.status === "block"
                    ? "Nothing paid. Stop recorded."
                    : "No payment. Awaiting a person.",
              ],
            ].map((x) => (
              <div className="timeline-item" key={x[0]}>
                <span>{x[0]}</span>
                <div>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel h-max">
          <p className="eyebrow">Transaction reference</p>
          <p className="my-4 font-mono text-sm break-all">{decision.txHash ?? "Pending or held"}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Base Sepolia audit anchor. This transaction records the decision receipt; it does not
            execute payment.
          </p>
          {decision.txHash && (
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href={explorerTxUrl(decision.txHash)} target="_blank" rel="noreferrer">
                <ExternalLink /> Open Basescan
              </a>
            </Button>
          )}
          <Button variant="outline" className="mt-3 w-full" onClick={copy}>
            <Copy /> Copy summary
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export function ReviewsPage() {
  const [items, setItems] = useState<Decision[]>([]);
  const [pendingSync, setPendingSync] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    listDecisionsFn()
      .then((data) => setItems(data.decisions.filter((d) => d.status === "review")))
      .catch((e) => setError(errMessage(e)));
  };

  useEffect(load, []);

  const approve = async (decisionId: string) => {
    try {
      const result = await approveReviewFn({ data: { decisionId } });
      if (result.decision.chainSyncPending) {
        setPendingSync(result.decision);
        toast.error("Approval is on chain, but the backend receipt still needs to sync.");
      } else {
        toast.success("Approved on chain");
      }
      load();
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  return (
    <AppShell title="Human review" eyebrow={`${items.length} waiting`}>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {pendingSync?.txHash && (
        <div className="panel mb-4">
          <p className="eyebrow">Receipt sync required</p>
          <h2 className="mt-2 font-semibold">Approval is confirmed on Base Sepolia.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Do not approve or submit the purchase again. Retry only the receipt sync.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                try {
                  await retryDecisionChainSyncFn({
                    data: { decisionId: pendingSync.id, txHash: pendingSync.txHash! },
                  });
                  setPendingSync(null);
                  toast.success("Approval receipt synced");
                } catch (error) {
                  toast.error(errMessage(error));
                }
              }}
            >
              Retry receipt sync
            </Button>
            <Button asChild variant="outline">
              <a href={explorerTxUrl(pendingSync.txHash)} target="_blank" rel="noreferrer">
                <ExternalLink /> View tx
              </a>
            </Button>
          </div>
        </div>
      )}
      {!items.length && !error && !pendingSync && (
        <div className="panel">
          <p className="text-sm text-muted-foreground">
            No Needs human items. Requests reach this queue only after FastAPI returns Needs human.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => (
          <div className="panel" key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <StatusBadge status="review" />
                <h2 className="mt-5 text-2xl font-semibold">
                  ${item.amount.toFixed(2)} · {item.merchant}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {item.reason}
                </p>
              </div>
              <Clock3 className="text-warning" />
            </div>
            <ul className="rule-list mt-7">
              <li>
                <Check /> Request: {item.request}
              </li>
              <li>
                <UserRoundCheck /> Rule: {item.rule}
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => approve(item.id)}>
                <Check /> Approve
              </Button>
              <Button
                variant="destructive"
                disabled
                title="Human rejection is not supported by the backend API."
              >
                Block unavailable
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              The backend currently supports human approval only. Rejection is not yet available.
            </p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function AuditPage() {
  const [q, setQ] = useState("");
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    listDecisionsFn()
      .then((data) => setDecisions(data.decisions))
      .catch((e) => toast.error(errMessage(e)));
  }, []);

  const shown = useMemo(
    () =>
      decisions.filter((d) =>
        `${d.request} ${d.reason} ${d.txHash ?? ""}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [decisions, q],
  );

  const exportSummary = () => {
    const body = shown
      .map(
        (d) =>
          `${d.time}\t${statusLabel(d.status)}\t${d.request}\t${d.rule}\t${d.reason}\t${d.txHash ?? ""}`,
      )
      .join("\n");
    navigator.clipboard?.writeText(body);
    toast.success("Audit summary copied");
  };

  return (
    <AppShell title="Audit trail" eyebrow="Reconstruct every decision">
      <div className="panel">
        <div className="page-actions">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search request, reason, or hash"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={exportSummary}>
            <FileCheck2 /> Export summary
          </Button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Request</th>
                <th>Rule</th>
                <th>Decision</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((d) => (
                <tr key={d.id}>
                  <td>{new Date(d.time).toLocaleString()}</td>
                  <td>
                    <Link
                      to="/decisions/$id"
                      params={{ id: d.id }}
                      className="font-semibold hover:text-signal"
                    >
                      {d.request}
                    </Link>
                  </td>
                  <td>{d.rule}</td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="font-mono">{d.txHash ?? "held"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export function MetricsPage() {
  const [metrics, setMetrics] = useState<EfficiencyMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMetricsFn()
      .then((data) => setMetrics(data.metrics))
      .catch((e) => setError(errMessage(e)));
  }, []);

  return (
    <AppShell title="Efficiency" eyebrow="CLAMP versus all AI">
      {error && (
        <div className="panel mb-5">
          <p className="text-sm text-destructive">{error}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Live token and latency numbers come from FastAPI. No illustrative fake table.
          </p>
        </div>
      )}
      {metrics && (
        <>
          <div className="metric-grid">
            {[
              ["Kiln calls", String(metrics.kilnCalls), "measured"],
              ["Total tokens", String(metrics.totalTokens), "measured"],
              ["Prompt tokens", String(metrics.promptTokens), "measured"],
              ["Average latency", `${metrics.averageLatencyMs.toFixed(2)}ms`, "Kiln calls"],
            ].map((x) => (
              <div className="metric-cell" key={x[0]}>
                <p>{x[0]}</p>
                <strong>{x[1]}</strong>
                <span>{x[2]}</span>
              </div>
            ))}
          </div>
          <div className="panel mt-5">
            <div className="panel-head">
              <div>
                <h2>Measured backend activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Persisted Kiln usage and decision counts from FastAPI.
                </p>
              </div>
              <Activity />
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Approach</th>
                    <th>LLM calls</th>
                    <th>Tokens</th>
                    <th>Decision latency</th>
                    <th>Policy source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>CLAMP</strong>
                    </td>
                    <td>{metrics.kilnCalls}</td>
                    <td>{metrics.totalTokens}</td>
                    <td>{metrics.averageLatencyMs.toFixed(2)}ms avg</td>
                    <td>FastAPI deterministic policy</td>
                  </tr>
                  <tr>
                    <td>All AI baseline</td>
                    <td>Unavailable</td>
                    <td>Unavailable</td>
                    <td>Not yet measured</td>
                    <td>No backend data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <div className="grid gap-4 md:grid-cols-3 mt-5">
        {[
          [CircleDollarSign, "Fewer calls", "Parse once and explain once."],
          [LockKeyhole, "Hard boundary", "The model never grants permission."],
          [
            Activity,
            "Energy thesis",
            "Lower token demand implies less inference work. Hardware energy is stated, not guessed.",
          ],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Activity;
          return (
            <div className="panel" key={t as string}>
              <I className="text-signal" />
              <h3 className="mt-8 font-semibold">{t as string}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d as string}</p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

export function SettingsPage() {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getRuntimeStatusFn>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRuntimeStatusFn()
      .then(setStatus)
      .catch((e) => setError(errMessage(e)));
  }, []);

  return (
    <AppShell title="Settings" eyebrow="Runtime configuration">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {status && (
        <>
          <div className="panel max-w-3xl">
            <div className="panel-head">
              <h2>Runtime labels</h2>
            </div>
            {[
              ["Mode", status.session.mode],
              ["Tenant", status.session.tenantId],
              ["Operator", status.session.email],
              ["Model", status.modelPreference],
              ["Network", `${status.chain.network} (${status.chain.chainId})`],
              ["Contract", status.chain.contractAddress ?? "Not deployed"],
              ["Gate", status.gatePolicy],
            ].map((x) => (
              <div
                className="flex justify-between gap-5 border-t border-border py-4 text-sm"
                key={x[0]}
              >
                <span className="text-muted-foreground">{x[0]}</span>
                <strong className="text-right break-all">{x[1]}</strong>
              </div>
            ))}
          </div>
          <div className="panel mt-5 max-w-3xl">
            <h2 className="font-semibold">Integration status</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4 text-sm border-b border-border pb-3">
                <span>Base Sepolia</span>
                <strong>{status.chain.configured ? "Configured" : "Missing env"}</strong>
              </div>
              <div className="flex justify-between gap-4 text-sm border-b border-border pb-3">
                <span>{status.backend.name}</span>
                <strong className="text-right max-w-md">
                  {status.backend.wired ? "Connected" : `Unavailable: ${status.backend.detail}`}
                </strong>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              CLAMP does not claim to be unhackable. It uses hard controls, tenant sessions, and an
              inspectable trail.
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}
