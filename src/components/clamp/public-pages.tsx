import { Link } from "@tanstack/react-router";
import { ArrowRight, Blocks, Bot, BrainCircuit, CircleCheck, Clock3, Code2, FileCheck2, Fingerprint, Gauge, LockKeyhole, ReceiptText, Send, ShieldCheck, UserRoundCheck, WalletCards } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { caseStudies, decisions } from "@/lib/clamp-data";
import { PublicPage, Section } from "./page";
import { StatusBadge } from "./status-badge";

const features = [
  { icon: Bot, title: "Parse once", text: "Kiln qwen3-32b turns natural language into a structured proposed action." },
  { icon: Code2, title: "Gate in code", text: "Budget including fees, merchant, purpose, and deadline are checked with zero inference." },
  { icon: UserRoundCheck, title: "Escalate uncertainty", text: "Borderline requests wait. Nothing is paid until a person makes the call." },
  { icon: Fingerprint, title: "Leave a receipt", text: "Each request, rule, decision, reason, and transaction reference stays reconstructable." },
];

export function ProductPage() {
  return <PublicPage eyebrow="Product" title="Control before action." intro="CLAMP gives an AI agent a narrow, temporary mandate—not broad access to your money."><Section kicker="The control loop" title="One sentence in. One deterministic decision out."><div className="feature-grid">{features.map(({icon:Icon,...f}) => <article className="feature-card" key={f.title}><Icon/><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></Section><Section kicker="Decision model" title="Three outcomes. No ambiguity."><div className="space-y-3">{(["allow","block","review"] as const).map((status,i)=><div className="panel flex items-center gap-5" key={status}><StatusBadge status={status}/><div><h3 className="font-semibold">{i===0?"Clearly inside":i===1?"Clearly outside":"A person should decide"}</h3><p className="mt-1 text-sm text-muted-foreground">{i===0?"Proceed and record settlement.":i===1?"Stop, pay nothing, and record why.":"Hold all action until approval or rejection."}</p></div></div>)}</div></Section><Section kicker="Evidence" title="A trail another person can read."><div className="receipt-hero"><div><p className="eyebrow">Example decision</p><h2>BestBuy.<br/>Blocked.</h2></div><div><StatusBadge status="block"/><p className="mt-4 max-w-xs text-sm text-muted-foreground">Merchant not on list. Nothing paid. Stop receipt recorded.</p></div></div></Section></PublicPage>;
}

export function CaseStudiesPage() {
  return <PublicPage eyebrow="Case studies" title="Same mandate. Three outcomes." intro="See exactly how CLAMP handles a valid request, a forbidden merchant, and a borderline budget case."><section className="content-section"><div className="section-heading"><p>Demo cases</p><h2>Reconstruct each call.</h2></div><div className="space-y-3">{caseStudies.map(c=><Link to="/case-studies/$slug" params={{slug:c.slug}} className="panel flex items-center justify-between gap-5 transition-colors hover:bg-accent" key={c.slug}><div><StatusBadge status={c.status}/><h3 className="mt-5 text-xl font-semibold">{c.title}</h3><p className="mt-2 text-sm text-muted-foreground">{c.description}</p></div><ArrowRight/></Link>)}</div></section></PublicPage>;
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const study=caseStudies.find(c=>c.slug===slug) ?? caseStudies[0];
  const decision=decisions.find(d=>d.id===study?.slug) ?? decisions[0];
  if (!study || !decision) return null;
  return <PublicPage eyebrow="Case study" title={study.title} intro={study.description}><Section kicker={study.kicker} title="The complete decision path"><div className="timeline">{[
    ["01","Agent request",decision.request],["02","Kiln parse",`${decision.merchant} · $${decision.amount.toFixed(2)} · office supplies`],["03","Code gate",`${decision.rule}: ${decision.reason}`],["04","Receipt",`${decision.tx} · Base Sepolia example`]
  ].map(([n,t,d])=><div className="timeline-item" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></Section><div className="pb-20"><Button asChild variant="secondary" className="rounded-full"><Link to="/case-studies">Back to cases</Link></Button></div></PublicPage>;
}

export function DocsPage() {
  const sections: Array<[string, string, string]> = [
    ["01 · Model","Natural language → action","Kiln qwen3-32b parses merchant, amount, fees, purpose, and requested time. It does not decide permission."],
    ["02 · Gate","Rules → decision","Code evaluates budget including fees, merchant allowlist, deadline, and purpose. It uses zero model calls."],
    ["03 · Human","Uncertainty → hold","Requests near a limit or with a fuzzy purpose become Needs human. Payment remains stopped."],
    ["04 · Chain","Outcome → receipt","Mandate commitments and decision references produce an inspectable Base testnet audit trail."],
  ];
  return <PublicPage eyebrow="Documentation" title="Before the tool call." intro="A concise guide to CLAMP’s mandates, deterministic policy gate, human reviews, and audit receipts.">{sections.map(([k,t,d])=><Section kicker={k} title={t} key={k}><p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">{d}</p></Section>)}</PublicPage>;
}

export function ContactPage() {
  const [sent,setSent]=useState(false);
  const submit=(e:FormEvent)=>{e.preventDefault();setSent(true);toast.success("Message captured for this demo")};
  return <PublicPage eyebrow="Contact" title="Build safer agent action." intro="CLAMP is Team 14’s Challenge B project for GWDC 2026 Korea."><Section kicker="Team 14" title="Henry × Hyewon"><div className="feature-grid"><article className="feature-card"><ShieldCheck/><h3>Henry Sam Marfo</h3><p>On-chain receipts, product experience, demo and pitch.</p></article><article className="feature-card"><BrainCircuit/><h3>Song Hyewon</h3><p>Kiln client, policy gate, metering, testing and audit shape.</p></article></div></Section><Section kicker="Start a conversation" title={sent?"Message received.":"Tell us what your agent controls."}>{sent?<div className="panel"><CircleCheck className="text-success"/><p className="mt-5 text-muted-foreground">This is a front-end demonstration. Connect a delivery service before using this form in production.</p></div>:<form className="form-grid" onSubmit={submit}><div className="field"><label htmlFor="name">Name</label><Input id="name" required placeholder="Your name"/></div><div className="field"><label htmlFor="email">Email</label><Input id="email" type="email" required placeholder="you@company.com"/></div><div className="field field-full"><label htmlFor="message">Message</label><Textarea id="message" required className="min-h-36" placeholder="What should your agent be allowed to do?"/></div><Button type="submit" className="w-max rounded-full"><Send/> Send message</Button></form>}</Section></PublicPage>;
}

export function SignInPage(){return <div className="min-h-screen bg-ink text-paper grid place-items-center p-5"><div className="w-full max-w-md border border-paper/20 p-8 bg-ink"><p className="eyebrow">Demo access</p><h1 className="font-display text-5xl mt-4">Enter CLAMP.</h1><p className="text-steel mt-4 mb-8">No account is required for this demonstration.</p><div className="space-y-4"><div className="field"><label htmlFor="email">Work email</label><Input id="email" defaultValue="judge@demo.clamp" className="bg-paper text-ink"/></div><Button asChild className="w-full rounded-full"><Link to="/dashboard">Continue to demo <ArrowRight/></Link></Button><Button asChild variant="ghost" className="w-full text-paper"><Link to="/">Return home</Link></Button></div></div></div>}