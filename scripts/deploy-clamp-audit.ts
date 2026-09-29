import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(
  readFileSync(join(root, "contracts/artifacts/ClampAudit.json"), "utf8"),
) as { abi: unknown[]; bytecode: Hex };

const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
const privateKey = process.env.BASE_SEPOLIA_PRIVATE_KEY as Hex | undefined;

if (!rpcUrl || !privateKey) {
  console.error("Set BASE_SEPOLIA_RPC_URL and BASE_SEPOLIA_PRIVATE_KEY before deploying.");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(rpcUrl),
});

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  account,
  chain: baseSepolia,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (!receipt.contractAddress) {
  console.error("Deploy succeeded without contract address", receipt);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      network: "Base Sepolia",
      chainId: baseSepolia.id,
      deployer: account.address,
      txHash: hash,
      contractAddress: receipt.contractAddress,
      explorer: `https://sepolia.basescan.org/address/${receipt.contractAddress}`,
      next: `export CLAMP_AUDIT_ADDRESS=${receipt.contractAddress}`,
    },
    null,
    2,
  ),
);
