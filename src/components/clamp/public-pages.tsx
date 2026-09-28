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
    title: "Parse once",
    text: "Kiln turns natural language into a proposed buy. Song owns this call.",
  },
  {
    icon: Code2,
    title: "Gate in code",
    text: "Budget including fees, merchant, purpose, and deadline use zero model calls.",
  },
  {
    icon: UserRoundCheck,
    title: "Escalate uncertainty",
    text: "Borderline requests wait. Nothing is paid until a person decides.",
  },
  {
    icon: Fingerprint,
    title: "Leave a receipt",
    text: "Each request, rule, decision, reason, and Base Sepolia tx stays reconstructable.",
  },
];

export function ProductPage() {
  return (
    <PublicPage
      eyebrow="Product"
      title="Control before action."
      intro="CLAMP gives an AI agent a narrow temporary mandate, not broad access to your money."
    >
      <Section kicker="The control loop" title="One sentence in. One clear decision out.">
        <div className="feature-grid">
          {features.map(({ icon: Icon, ...f }) => (
            <article className="feature-card" key={f.title}>
              <Icon />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section kicker="Decision model" title="Three outcomes. No ambiguity.">
        <div className="space-y-3">
          {(
            [
              ["allow", "Clearly inside", "Proceed and record settlement."],
              ["block", "Clearly outside", "Stop, pay nothing, and record why."],
              ["review", "A person should decide", "Hold all action until approval or rejection."],
            ] as const
          ).map(([status, title, text]) => (
            <div className="panel flex items-center gap-5" key={status}>
              <StatusBadge status={status} />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section kicker="Evidence" title="A trail another person can read.">
        <div className="receipt-hero">
          <div>
            <p className="eyebrow">Demo story</p>
            <h2>
              BestBuy.
              <br />
              Blocked.
            </h2>
          </div>
          <div>
            <StatusBadge status="block" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Merchant not on list. Nothing paid. Stop receipt recorded on Base Sepolia when the
              chain is configured.
            </p>
          </div>
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
              className="panel flex items-center justify-between gap-5 transition-colors hover:bg-accent"
              key={c.slug}
            >
              <div>
                <StatusBadge status={c.status} />
                <h3 className="mt-5 text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
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
            ["04", "Receipt", "Base Sepolia stop or settle hash when live"],
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
      "Kiln parses merchant, amount, fees, purpose, and time. It does not decide permission. Song owns this.",
    ],
    [
      "02 · Gate",
      "Rules to decision",
      "Code evaluates budget including fees, merchant allowlist, deadline, and purpose. It uses zero model calls.",
    ],
    [
      "03 · Human",
      "Uncertainty to hold",
      "Requests near a limit or with a fuzzy purpose become Needs human. Payment stays stopped.",
    ],
    [
      "04 · Chain",
      "Outcome to receipt",
      "Mandate commits and decision receipts write to Base Sepolia. Henry owns this path.",
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
