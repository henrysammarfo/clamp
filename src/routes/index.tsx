import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PublicHeader } from "@/components/clamp/public-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLAMP · Control before action" },
      {
        name: "description",
        content:
          "You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.",
      },
      { property: "og:title", content: "CLAMP · Control before action" },
      {
        property: "og:description",
        content: "Delegation control for AI agents that spend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { symbol: "1", target: 1, suffix: "", decimals: 0, label: "Code gate" },
  { symbol: "3", target: 3, suffix: "", decimals: 0, label: "Outcomes" },
  { symbol: "0", target: 0, suffix: "", decimals: 0, label: "Fake pays" },
  { symbol: "B", target: 0, suffix: "", decimals: 0, label: "Challenge B" },
];

function Index() {
  const [values, setValues] = useState(stats.map(() => "0"));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        stats.forEach((s, i) => {
          setTimeout(
            () => {
              if (s.label === "Challenge B") {
                setValues((old) => old.map((v, j) => (j === i ? "B" : v)));
                return;
              }
              const begin = performance.now();
              const duration = 1200 + i * 60;
              const tick = (now: number) => {
                const p = Math.min(1, (now - begin) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                setValues((old) =>
                  old.map((v, j) => (j === i ? (s.target * eased).toFixed(s.decimals) : v)),
                );
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            },
            480 + i * 90,
          );
        });
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <div className="bg">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <PublicHeader />
      <main className="hero">
        <div className="trust-row anim" style={{ "--d": ".05s" } as React.CSSProperties}>
          <div className="trust-pill">GWDC 2026 Korea · Team 14 · Challenge B</div>
        </div>
        <h1 className="headline">
          <span>CLAMP</span>
          <span>Control before action</span>
        </h1>
        <p className="hero-copy anim" style={{ "--d": ".28s" } as React.CSSProperties}>
          You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the
          audit trail.
        </p>
        <div className="flex flex-wrap gap-3 anim" style={{ "--d": ".4s" } as React.CSSProperties}>
          <Link to="/sign-in" className="hero-cta">
            Open control room
          </Link>
          <Link
            to="/product"
            className="hero-cta"
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,.35)" }}
          >
            See how it works
          </Link>
        </div>
      </main>
      <footer className="stats" ref={ref}>
        {stats.map((s, i) => (
          <div className="stat" style={{ animationDelay: `${0.5 + i * 0.08}s` }} key={s.label}>
            <span className="stat-symbol">{s.symbol}</span>
            <strong>
              {values[i]}
              {s.suffix}
            </strong>
            <small>{s.label}</small>
          </div>
        ))}
      </footer>
    </div>
  );
}
