import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={cn("brand-mark", className)} aria-hidden="true">
      <span className="brand-core">
        <ShieldCheck />
      </span>
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="CLAMP home">
      <Mark />
      {!compact && <span className="font-semibold tracking-normal">CLAMP</span>}
    </Link>
  );
}
