import { createPublicClient, createWalletClient, http, type Hex } from "viem";
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

export function getChainStatus() {
  const config = chainConfig();
  return {
    configured: isChainConfigured(),
    network: "Base Sepolia",
    chainId: baseSepolia.id,
    contractAddress: config.contractAddress ?? null,
    rpcConfigured: Boolean(config.rpcUrl),
    keyConfigured: Boolean(config.privateKey),
  };
}

export async function commitMandateOnChain(mandateHash: Hex): Promise<{ txHash: Hex }> {
  const { publicClient, walletClient, account, address } = requireChain();
  const hash = await walletClient.writeContract({
    address,
    abi: clampAuditAbi,
    functionName: "commitMandate",
    args: [mandateHash],
    account,
    chain: baseSepolia,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash };
}

export async function recordDecisionOnChain(input: {
  mandateHash: Hex;
  decisionHash: Hex;
  outcome: DecisionOutcomeCode;
}): Promise<{ txHash: Hex }> {
  const { publicClient, walletClient, account, address } = requireChain();
  const hash = await walletClient.writeContract({
    address,
    abi: clampAuditAbi,
    functionName: "recordDecision",
    args: [input.mandateHash, input.decisionHash, input.outcome],
    account,
    chain: baseSepolia,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash };
}
