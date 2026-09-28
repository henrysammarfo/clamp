import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "contracts/ClampAudit.sol");
const outDir = join(root, "contracts/artifacts");
const source = readFileSync(sourcePath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "ClampAudit.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))) as {
  errors?: Array<{ severity: string; formattedMessage: string }>;
  contracts?: {
    "ClampAudit.sol": {
      ClampAudit: {
        abi: unknown[];
        evm: { bytecode: { object: string } };
      };
    };
  };
};

const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}

const artifact = output.contracts?.["ClampAudit.sol"]?.ClampAudit;
if (!artifact?.evm?.bytecode?.object) {
  console.error("ClampAudit bytecode missing from solc output");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const artifactPath = join(outDir, "ClampAudit.json");
writeFileSync(
  artifactPath,
  JSON.stringify(
    {
      contractName: "ClampAudit",
      sourcePath: "contracts/ClampAudit.sol",
      abi: artifact.abi,
      bytecode: `0x${artifact.evm.bytecode.object}`,
    },
    null,
    2,
  ),
);
console.log(`Wrote ${artifactPath}`);
