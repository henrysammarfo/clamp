import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  Menu,
  ScrollText,
  Settings,
  Shield,
  UserRoundCheck,
  WalletCards,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mandates", label: "Mandates", icon: Shield },
  { to: "/requests/new", label: "New request", icon: WalletCards },
  { to: "/decisions", label: "Decisions", icon: ScrollText },
  { to: "/reviews", label: "Reviews", icon: UserRoundCheck },
  { to: "/audit", label: "Audit", icon: FileCheck2 },
  { to: "/metrics", label: "Metrics", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const sidebar = (
    <>
      <div className="app-brand">
        <Brand />
        <button onClick={() => setOpen(false)} aria-label="Close navigation">
          <X />
        </button>
      </div>
      <div className="demo-chip">
        <Gauge /> Live fail closed
      </div>
      <nav className="app-nav">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || path.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={active ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <p>Active network</p>
        <strong>
          <i /> Base Sepolia
        </strong>
        <small>Real txs when chain env is set</small>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="app-sidebar desktop-only">{sidebar}</aside>
      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}>
          <aside className="app-sidebar mobile-sheet" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="app-main">
        <header className="app-topbar">
          <Button
            variant="secondary"
            size="icon"
            className="mobile-only rounded-full"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
          {action}
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
