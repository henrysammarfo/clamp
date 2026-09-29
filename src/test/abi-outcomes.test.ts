import { describe, expect, it } from "vitest";
import { outcomeFromStatus, statusFromOutcome } from "@/server/chain/abi";

describe("outcome codes", () => {
  it("uses 1..4 with zero meaning unset", () => {
    expect(outcomeFromStatus("allow")).toBe(1);
    expect(outcomeFromStatus("block")).toBe(2);
    expect(outcomeFromStatus("review")).toBe(3);
    expect(outcomeFromStatus("revoke")).toBe(4);
    expect(statusFromOutcome(0)).toBe("unset");
    expect(statusFromOutcome(1)).toBe("allow");
    expect(statusFromOutcome(4)).toBe("revoke");
  });
});
