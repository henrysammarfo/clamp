import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CircleCheck,
  Code2,
  Fingerprint,
  Send,
  ShieldCheck,
  UserRoundCheck,
  Bot,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { signInFn } from "@/api/auth";
import { PublicPage, Section } from "./page";
import { StatusBadge } from "./status-badge";

const features = [
  {
    icon: Bot,
    title: "AI interprets",
    text: "Kiln turns a natural language procurement request into structured purchase fields.",
  },
  {
    icon: Code2,
    title: "Code authorizes",
    text: "Deterministic policy checks purpose, budget, merchant, currency, expiry, and approval threshold.",
  },
  {
    icon: UserRoundCheck,
    title: "Humans handle exceptions",
    text: "Exceptional spend waits for explicit approval or rejection, and authority can be revoked at any time.",
  },
  {
    icon: Fingerprint,
    title: "Base records the receipt",
    text: "Final audit receipts can be verified against the tamper resistant ClampAudit v2 state on Base Sepolia.",
  },
];

export function ProductPage() {
  return (
    <PublicPage
      eyebrow="Product"
      title="Give AI spending authority without giving up control."
      intro="CLAMP is an authorization and audit control plane for AI agents that spend. A human delegates narrow, temporary authority instead of granting unrestricted access or approving every purchase."
    >
      <Section kicker="Why CLAMP" title="Financial authority needs explicit boundaries.">
        <div className="panel public-panel max-w-3xl">
          <p className="text-lg leading-relaxed">
            Enterprise procurement agents can move routine work faster, but they should act only
            within authority a person deliberately grants. CLAMP makes that authority specific,
            temporary, reviewable, and revocable.
          </p>
        </div>
      </Section>
      <Section kicker="How it works" title="AI interprets. Code decides.">
        <div className="space-y-8">
          <p className="max-w-3xl text-lg leading-relaxed text-white/70">
            AI interprets. Code authorizes. Humans handle exceptions. Base records the receipt.
          </p>
          <div className="feature-grid">
            {features.map(({ icon: Icon, ...f }) => (
              <article className="feature-card" key={f.title}>
                <Icon />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section kicker="Procurement example" title="Delegate a mandate, not unlimited authority.">
        <div className="panel-grid">
          <div className="panel public-panel">
            <p className="eyebrow">Office procurement mandate</p>
            <ul className="rule-list mt-5">
              <li>
                <CircleCheck /> Purpose: OFFICE
              </li>
              <li>
                <CircleCheck /> Budget: $2,000
              </li>
              <li>
                <CircleCheck /> Merchants: Amazon, Apple
              </li>
              <li>
                <UserRoundCheck /> Human approval: $500 or more
              </li>
              <li>
                <CircleCheck /> Expiry: Friday
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            {(
              [
                ["allow", "$60 keyboard", "Inside the mandate."],
                ["block", "$40 groceries", "Purpose is outside the mandate."],
                ["review", "$700 monitor", "A person must approve exceptional spend."],
                ["revoke", "Revoke mandate", "Delegated authority ends."],
              ] as const
            ).map(([status, title, text]) => (
              <div className="panel public-panel flex items-center gap-5" key={status}>
                <StatusBadge status={status} />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm opacity-70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section kicker="Evidence" title="Inspect the decision and verify the receipt.">
        <div className="receipt-hero">
          <div>
            <p className="eyebrow">Measured and verifiable</p>
            <h2>
              Decision.
              <br />
              Reason.
              <br />
              Receipt.
            </h2>
          </div>
          <div>
            <ShieldCheck />
            <p className="mt-4 max-w-md text-sm text-white/70">
              CLAMP supports read-only verification of final Base Sepolia audit receipts and a
              measured 30 case adversarial benchmark. These demonstrate the control path; they do
              not prove that a purchase happened or that an AI was correct.
            </p>
          </div>
        </div>
      </Section>
      <Section kicker="Product boundary" title="Control authorization, not payments.">
        <div className="panel public-panel max-w-3xl">
          <p className="text-lg leading-relaxed">
            CLAMP controls authorization and records audit receipts. It does not execute payment,
            custody funds, prove a purchase happened, or prove that an AI decision was correct or
            fair.
          </p>
        </div>
      </Section>
    </PublicPage>
  );
}

export function CaseStudiesPage() {
  return (
    <PublicPage
      eyebrow="Case studies"
      title="Same mandate. Three outcomes."
      intro="See how CLAMP handles a valid request, a forbidden merchant, and a borderline budget case."
    >
      <section className="content-section">
        <div className="section-heading">
          <p>Demo cases</p>
          <h2>Reconstruct each call.</h2>
        </div>
        <div className="space-y-3">
          {caseStudies.map((c) => (
            <Link
              to="/case-studies/$slug"
              params={{ slug: c.slug }}
              className="panel public-panel flex items-center justify-between gap-5 transition-colors hover:brightness-95"
              key={c.slug}
            >
              <div>
                <StatusBadge status={c.status} />
                <h3 className="mt-5 text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm opacity-70">{c.description}</p>
              </div>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug) ?? caseStudies[0];
  if (!study) return null;
  return (
    <PublicPage eyebrow="Case study" title={study.title} intro={study.description}>
      <Section kicker={study.kicker} title="The complete decision path">
        <div className="timeline">
          {[
            ["01", "Agent request", study.request],
            [
              "02",
              "Kiln parse",
              `${study.merchant} · $${study.amount.toFixed(2)} · office supplies`,
            ],
            ["03", "Code gate", `${study.rule}: ${study.reason}`],
            ["04", "Receipt", "Base Sepolia audit receipt for a final decision"],
          ].map(([n, t, d]) => (
            <div className="timeline-item" key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <div className="pb-20">
        <Button asChild variant="secondary" className="rounded-full">
          <Link to="/case-studies">Back to cases</Link>
        </Button>
      </div>
    </PublicPage>
  );
}

export function DocsPage() {
  const sections: Array<[string, string, string]> = [
    [
      "01 · Model",
      "Natural language to action",
      "Kiln parses merchant, amount, currency, item, and classifies purpose. It does not decide permission.",
    ],
    [
      "02 · Gate",
      "Rules to decision",
      "Code evaluates purpose category, merchant allowlist, budget, currency, deadline, and approval threshold. It uses zero model calls.",
    ],
    [
      "03 · Human",
      "Uncertainty to hold",
      "Requests at or above the configured approval threshold become Needs human. Authorization stays pending.",
    ],
    [
      "04 · Chain",
      "Outcome to receipt",
      "Mandate commitments and final decision receipts write to Base Sepolia for audit verification. CLAMP does not execute payment.",
    ],
  ];
  return (
    <PublicPage
      eyebrow="Documentation"
      title="Before the tool call."
      intro="A short guide to CLAMP mandates, the code gate, human reviews, and audit receipts."
    >
      {sections.map(([k, t, d]) => (
        <Section kicker={k} title={t} key={k}>
          <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">{d}</p>
        </Section>
      ))}
    </PublicPage>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Message saved in this session");
  };
  return (
    <PublicPage
      eyebrow="Contact"
      title="Build safer agent action."
      intro="CLAMP is Team 14 Challenge B for GWDC 2026 Korea."
    >
      <Section kicker="Team 14" title="Henry and Hyewon">
        <div className="feature-grid">
          <article className="feature-card">
            <ShieldCheck />
            <h3>Henry Sam Marfo</h3>
            <p>On chain receipts, product experience, demo and pitch.</p>
          </article>
          <article className="feature-card">
            <BrainCircuit />
            <h3>Song Hyewon</h3>
            <p>Kiln client, policy gate, metering, testing and audit shape.</p>
          </article>
        </div>
      </Section>
      <Section
        kicker="Start a conversation"
        title={sent ? "Message received." : "Tell us what your agent controls."}
      >
        {sent ? (
          <div className="panel">
            <CircleCheck className="text-success" />
            <p className="mt-5 text-muted-foreground">
              Thanks. For production delivery, connect an email service to this form.
            </p>
          </div>
        ) : (
          <form className="form-grid" onSubmit={submit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <Input id="name" required placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" required placeholder="you@company.com" />
            </div>
            <div className="field field-full">
              <label htmlFor="message">Message</label>
              <Textarea
                id="message"
                required
                className="min-h-36"
                placeholder="What should your agent be allowed to do?"
              />
            </div>
            <Button type="submit" className="w-max rounded-full">
              <Send /> Send message
            </Button>
          </form>
        )}
      </Section>
    </PublicPage>
  );
}

export function SignInPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("judge@demo.clamp");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInFn({ data: { email } });
      toast.success("Signed server session created");
      nav({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper grid place-items-center p-5">
      <form className="w-full max-w-md border border-paper/20 p-8 bg-ink" onSubmit={submit}>
        <p className="eyebrow">Secure access</p>
        <h1 className="font-display text-5xl mt-4">Enter CLAMP.</h1>
        <p className="text-steel mt-4 mb-8">
          Creates a signed httpOnly session and a tenant scoped workspace. Product state is not kept
          in browser storage.
        </p>
        <div className="space-y-4">
          <div className="field">
            <label htmlFor="email">Work email</label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-paper text-ink"
              required
              type="email"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={busy}>
            {busy ? "Opening…" : "Continue to control room"} <ArrowRight />
          </Button>
          <Button asChild variant="ghost" className="w-full text-paper">
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
