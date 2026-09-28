import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpenCheck, ChevronRight, CircleGauge, FileClock, Gauge, Menu, Plus, ScrollText, Settings, Shield, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Gauge },
  { to: "/mandates", label: "Mandates", icon: Shield },
  { to: "/decisions", label: "Decisions", icon: BookOpenCheck },
  { to: "/reviews", label: "Human review", icon: FileClock },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
  { to: "/metrics", label: "Efficiency", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ title, eyebrow, action, children }: { title: string; eyebrow: string; action?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: s => s.location.pathname });
  const sidebar = <><div className="app-brand"><Brand /><button onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div><div className="demo-chip"><CircleGauge /> Demo environment</div><nav className="app-nav">{nav.map(item => { const Icon = item.icon; const active = path === item.to || path.startsWith(`${item.to}/`); return <Link key={item.to} to={item.to} className={active ? "active" : ""} onClick={() => setOpen(false)}><Icon /><span>{item.label}</span>{active && <ChevronRight className="nav-chevron" />}</Link>; })}</nav><div className="sidebar-bottom"><p>Active network</p><strong><i /> Base Sepolia</strong><small>Example receipts only</small></div></>;
  return <div className="app-shell"><aside className="sidebar">{sidebar}</aside>{open && <div className="sidebar-overlay" onClick={() => setOpen(false)}><aside onClick={e => e.stopPropagation()}>{sidebar}</aside></div>}<main className="app-main"><header className="app-topbar"><Button variant="outline" size="icon" className="app-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></Button><div><p>{eyebrow}</p><h1>{title}</h1></div><div className="topbar-actions">{action}<Button asChild className="rounded-full"><Link to="/requests/new"><Plus /> New request</Link></Button></div></header><div className="app-content">{children}</div></main></div>;
}