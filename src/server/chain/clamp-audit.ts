import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { chainConfig, isChainConfigured } from "../env";
import { clampAuditAbi, type DecisionOutcomeCode } from "./abi";

export class ChainNotConfiguredError extends Error {
  readonly code = "CHAIN_NOT_CONFIGURED" as const;

  constructor() {
    super(
      "Base Sepolia is not configured. Set BASE_SEPOLIA_RPC_URL, BASE_SEPOLIA_PRIVATE_KEY, and CLAMP_AUDIT_ADDRESS.",
    );
    this.name = "ChainNotConfiguredError";
  }
}

export class ChainTxFailedError extends Error {
  readonly code = "CHAIN_TX_FAILED" as const;

  constructor(txHash: Hex) {
    super(`Base Sepolia transaction reverted or failed: ${txHash}`);
    this.name = "ChainTxFailedError";
  }
}

function requireChain() {
  const config = chainConfig();
  if (!config.rpcUrl || !config.privateKey || !config.contractAddress) {
    throw new ChainNotConfiguredError();
  }
  const account = privateKeyToAccount(config.privateKey);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(config.rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(config.rpcUrl),
  });
  return {
    publicClient,
    walletClient,
    account,
    address: config.contractAddress,
  };
}

async function waitSuccess(txHash: Hex): Promise<TransactionReceipt> {
  const { publicClient } = requireChain();
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    throw new ChainTxFailedError(txHash);
  }
  return receipt;
}

async function waitFor<T>(
  label: string,
  read: () => Promise<T>,
  ok: (value: T) => boolean,
): Promise<T> {
  let last: T | undefined;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    last = await read();
    if (ok(last)) return last;
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw new Error(`${label} failed after retries.`);
}

export function getChainStatus() {
  const config = chainConfig();
  return {
    configured: isChainConfigured(),
    network: "Base Sepolia",
    chainId: baseSepolia.id,
    contractAddress: config.contractAddress ?? null,
    rpcConfigured: Boolean(config.rpcUrl),
    keyConfigured: Boolean(config.privateKey),
    contractVersion: "ClampAudit v2 access controlled",
  };
}

type MandateView = {
  exists: boolean;
  revoked: boolean;
  committer: `0x${string}`;
  committedAt: bigint;
};

type DecisionView = {
  exists: boolean;
  mandateHash: Hex;
  outcome: number;
  actor: `0x${string}`;
  recordedAt: bigint;
};

function asMandateView(result: unknown): MandateView {
  if (Array.isArray(result)) {
    return {
      exists: Boolean(result[0]),
      revoked: Boolean(result[1]),
      committer: result[2] as `0x${string}`,
      committedAt: result[3] as bigint,
    };
  }
  const obj = result as MandateView;
  return {
    exists: Boolean(obj.exists),
    revoked: Boolean(obj.revoked),
    committer: obj.committer,
    committedAt: obj.committedAt,
  };
}

function asDecisionView(result: unknown): DecisionView {
  if (Array.isArray(result)) {
    return {
      exists: Boolean(result[0]),
      mandateHash: result[1] as Hex,
      outcome: Number(result[2]),
      actor: result[3] as `0x${string}`,
      recordedAt: result[4] as bigint,
    };
  }
  const obj = result as DecisionView;
  return {
    exists: Boolean(obj.exists),
    mandateHash: obj.mandateHash,
    outcome: Number(obj.outcome),
    actor: obj.actor,
    recordedAt: obj.recordedAt,
  };
}

export async function readMandateOnChain(mandateHash: Hex): Promise<MandateView> {
  const { publicClient, address } = requireChain();
  const result = await publicClient.readContract({
    address,
    abi: clampAuditAbi,
    functionName: "getMandate",
    args: [mandateHash],
  });
  return asMandateView(result);
}

export async function readDecisionOnChain(decisionHash: Hex): Promise<DecisionView> {
  const { publicClient, address } = requireChain();
  const result = await publicClient.readContract({
    address,
    abi: clampAuditAbi,
    functionName: "getDecision",
    args: [decisionHash],
  });
  return asDecisionView(result);
}

export async function commitMandateOnChain(mandateHash: Hex): Promise<{ txHash: Hex }> {
  const { walletClient, account, address } = requireChain();
  const hash = await walletClient.writeContract({
    address,
    abi: clampAuditAbi,
    functionName: "commitMandate",
    args: [mandateHash],
    account,
    chain: baseSepolia,
  });
  await waitSuccess(hash);
  await waitFor(
    "Mandate commit read back",
    () => readMandateOnChain(mandateHash),
    (view) => view.exists,
  );
  return { txHash: hash };
}

export async function recordDecisionOnChain(input: {
  mandateHash: Hex;
  decisionHash: Hex;
  outcome: DecisionOutcomeCode;
}): Promise<{ txHash: Hex }> {
  const { walletClient, account, address } = requireChain();
  if (input.outcome < 1 || input.outcome > 4) {
    throw new Error("Outcome must be 1..4.");
  }
  const hash = await walletClient.writeContract({
    address,
    abi: clampAuditAbi,
    functionName: "recordDecision",
    args: [input.mandateHash, input.decisionHash, input.outcome],
    account,
    chain: baseSepolia,
  });
  await waitSuccess(hash);
  await waitFor(
    "Decision record read back",
    () => readDecisionOnChain(input.decisionHash),
    (view) => view.exists && view.outcome === input.outcome,
  );
  return { txHash: hash };
}
