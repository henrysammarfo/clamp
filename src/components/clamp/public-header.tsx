import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Product" },
  { to: "/case-studies", label: "Case studies" },
  { to: "/docs", label: "Docs" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicHeader({ inverse = false }: { inverse?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={`public-header ${inverse ? "header-inverse" : ""}`}>
      <Brand compact />
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.to === "/" }}
            activeProps={{ className: "active" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button asChild className="desktop-sign rounded-full">
        <Link to="/sign-in">Sign in</Link>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="mobile-menu-trigger rounded-full"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}>
          <nav
            className="mobile-sheet"
            aria-label="Mobile navigation"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ animationDelay: `${i * 55}ms` }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/sign-in" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
