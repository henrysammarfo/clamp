import { CircleCheck, CircleX, ShieldX, UserRoundCheck } from "lucide-react";
import { statusLabel, type DecisionStatus } from "@/lib/clamp-data";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: DecisionStatus }) {
  const Icon =
    status === "allow"
      ? CircleCheck
      : status === "block"
        ? CircleX
        : status === "revoke"
          ? ShieldX
          : UserRoundCheck;
  const tone = status === "revoke" ? "block" : status;
  return (
    <span className={cn("status-badge", `status-${tone}`)}>
      <Icon />
      {statusLabel(status)}
    </span>
  );
}
