import { CircleCheck, CircleX, UserRoundCheck } from "lucide-react";
import { statusLabel, type DecisionStatus } from "@/lib/clamp-data";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: DecisionStatus }) {
  const Icon = status === "allow" ? CircleCheck : status === "block" ? CircleX : UserRoundCheck;
  return <span className={cn("status-badge", `status-${status}`)}><Icon />{statusLabel(status)}</span>;
}