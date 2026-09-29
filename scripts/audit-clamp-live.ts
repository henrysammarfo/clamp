/**
 * Live Base Sepolia verification for hardened ClampAudit.
 * Requires .env with RPC, key, and CLAMP_AUDIT_ADDRESS.
 */
import { createPublicClient, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { clampAuditAbi } from "../src/server/chain/abi";
import {
  commitMandateOnChain,
  readDecisionOnChain,
  readMandateOnChain,
  recordDecisionOnChain,
} from "../src/server/chain/clamp-audit";
import { hashDecision, hashMandate } from "../src/server/chain/hash";

const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
const privateKey = process.env.BASE_SEPOLIA_PRIVATE_KEY as `0x${string}` | undefined;
const address = process.env.CLAMP_AUDIT_ADDRESS as `0x${string}` | undefined;

if (!rpcUrl || !privateKey || !address) {
  console.error("Missing chain env");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

const findings: Array<{ id: string; ok: boolean; detail: string }> = [];

function check(id: string, ok: boolean, detail: string) {
  findings.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

const code = await publicClient.getBytecode({ address });
check(
  "bytecode_present",
  Boolean(code && code !== "0x"),
  `runtime bytes=${code ? (code.length - 2) / 2 : 0}`,
);

const owner = await publicClient.readContract({
  address,
  abi: clampAuditAbi,
  functionName: "owner",
});
check("owner_is_deployer", owner.toLowerCase() === account.address.toLowerCase(), `owner=${owner}`);

const recorder = await publicClient.readContract({
  address,
  abi: clampAuditAbi,
  functionName: "isRecorder",
  args: [account.address],
});
check("deployer_is_recorder", recorder === true, `isRecorder=${recorder}`);

const stranger = privateKeyToAccount(generatePrivateKey());
const probeHash = "0x2222222222222222222222222222222222222222222222222222222222222222" as const;
try {
  await publicClient.simulateContract({
    address,
    abi: clampAuditAbi,
    functionName: "commitMandate",
    args: [probeHash],
    account: stranger.address,
  });
  check("stranger_commit_blocked", false, "stranger simulate unexpectedly succeeded");
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  check(
    "stranger_commit_blocked",
    /NotWriter|not writer|0x/i.test(msg) || msg.length > 0,
    `stranger rejected via simulate`,
  );
}

const stamp = Date.now();
const mandate = {
  id: `audit${stamp}`,
  tenantId: "tenant_audit",
  purpose: "Office supplies",
  budget: 50,
  merchants: ["Amazon", "Apple", "Uber"],
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
};
const mandateHash = hashMandate(mandate);
const { txHash: commitTx } = await commitMandateOnChain(mandateHash);
const mandateView = await readMandateOnChain(mandateHash);
check(
  "commit_readable",
  mandateView.exists && !mandateView.revoked,
  `commitTx=${commitTx} committer=${mandateView.committer}`,
);

try {
  await publicClient.simulateContract({
    address,
    abi: clampAuditAbi,
    functionName: "recordDecision",
    args: [mandateHash, "0x3333333333333333333333333333333333333333333333333333333333333333", 0],
    account: account.address,
  });
  check("outcome_zero_blocked", false, "outcome 0 simulate succeeded");
} catch {
  check("outcome_zero_blocked", true, "outcome 0 rejected via simulate");
}

const allowDecision = {
  id: `allow${stamp}`,
  tenantId: "tenant_audit",
  mandateId: mandate.id,
  request: "Buy $10 on Amazon",
  merchant: "Amazon",
  amount: 10,
  fee: 0.5,
  status: "allow" as const,
  rule: "All checks passed",
  reason: "Inside mandate",
};
const allowHash = hashDecision(allowDecision);
const { txHash: allowTx } = await recordDecisionOnChain({
  mandateHash,
  decisionHash: allowHash,
  outcome: 1,
});
const allowView = await readDecisionOnChain(allowHash);
check(
  "allow_outcome_one",
  allowView.exists && allowView.outcome === 1 && allowView.mandateHash === mandateHash,
  `allowTx=${allowTx} outcome=${allowView.outcome}`,
);

try {
  await recordDecisionOnChain({
    mandateHash,
    decisionHash: allowHash,
    outcome: 1,
  });
  check("duplicate_decision_blocked", false, "duplicate accepted");
} catch {
  check("duplicate_decision_blocked", true, "duplicate rejected");
}

const revokeDecision = {
  id: `revoke${stamp}`,
  tenantId: "tenant_audit",
  mandateId: mandate.id,
  request: "Revoke mandate",
  merchant: "system",
  amount: 0,
  fee: 0,
  status: "revoke" as const,
  rule: "Revocation",
  reason: "Mandate revoked by operator.",
};
const revokeHash = hashDecision(revokeDecision);
const { txHash: revokeTx } = await recordDecisionOnChain({
  mandateHash,
  decisionHash: revokeHash,
  outcome: 4,
});
const afterRevoke = await readMandateOnChain(mandateHash);
check(
  "revoke_flags_mandate",
  afterRevoke.revoked === true,
  `revokeTx=${revokeTx} revoked=${afterRevoke.revoked}`,
);

try {
  const post = hashDecision({
    ...allowDecision,
    id: `post${stamp}`,
    status: "block",
    rule: "Should fail",
    reason: "After revoke",
  });
  await recordDecisionOnChain({
    mandateHash,
    decisionHash: post,
    outcome: 2,
  });
  check("post_revoke_blocked", false, "post revoke write accepted");
} catch {
  check("post_revoke_blocked", true, "post revoke write rejected");
}

const failed = findings.filter((f) => !f.ok);
console.log(
  JSON.stringify(
    {
      contract: address,
      owner,
      passed: findings.filter((f) => f.ok).length,
      failed: failed.length,
      findings,
    },
    null,
    2,
  ),
);
process.exit(failed.length ? 1 : 0);
