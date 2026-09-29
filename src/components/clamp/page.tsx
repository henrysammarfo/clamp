import type { ReactNode } from "react";
import { PublicHeader } from "./public-header";

export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="public-page">
      <PublicHeader inverse />
      <main>
        <section className="public-intro">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <div>{intro}</div>
        </section>
        {children}
      </main>
      <footer>
        <span>CLAMP · Authorization and audit control for AI agents that spend</span>
        <span>Team 14 · GWDC 2026 Korea</span>
      </footer>
    </div>
  );
}

export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <p>{kicker}</p>
        <h2>{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
