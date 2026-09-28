export const clampAuditAbi = [
  {
    type: "function",
    name: "commitMandate",
    stateMutability: "nonpayable",
    inputs: [{ name: "mandateHash", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "recordDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "mandateHash", type: "bytes32" },
      { name: "decisionHash", type: "bytes32" },
      { name: "outcome", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "mandateExists",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decisionExists",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decisionOutcome",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "event",
    name: "MandateCommitted",
    inputs: [
      { name: "mandateHash", type: "bytes32", indexed: true },
      { name: "actor", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DecisionRecorded",
    inputs: [
      { name: "mandateHash", type: "bytes32", indexed: true },
      { name: "decisionHash", type: "bytes32", indexed: true },
      { name: "outcome", type: "uint8", indexed: false },
      { name: "actor", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export type DecisionOutcomeCode = 0 | 1 | 2 | 3;

export function outcomeFromStatus(
  status: "allow" | "block" | "review" | "revoke",
): DecisionOutcomeCode {
  if (status === "allow") return 0;
  if (status === "block") return 1;
  if (status === "review") return 2;
  return 3;
}
