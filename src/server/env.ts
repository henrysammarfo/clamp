import { z } from "zod";

const envSchema = z.object({
  FASTAPI_BASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  BASE_SEPOLIA_RPC_URL: z.string().url().optional(),
  BASE_SEPOLIA_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
  CLAMP_AUDIT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(): AppEnv {
  return envSchema.parse({
    FASTAPI_BASE_URL: process.env["FASTAPI_BASE_URL"],
    SESSION_SECRET: process.env["SESSION_SECRET"],
    BASE_SEPOLIA_RPC_URL: process.env["BASE_SEPOLIA_RPC_URL"],
    BASE_SEPOLIA_PRIVATE_KEY: process.env["BASE_SEPOLIA_PRIVATE_KEY"],
    CLAMP_AUDIT_ADDRESS: process.env["CLAMP_AUDIT_ADDRESS"],
  });
}

export function requireSessionSecret(): string {
  const secret = readEnv().SESSION_SECRET ?? process.env["SESSION_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Set it in .env before using sessions.",
    );
  }
  return secret;
}

export function chainConfig() {
  const env = readEnv();
  return {
    rpcUrl: env.BASE_SEPOLIA_RPC_URL,
    privateKey: env.BASE_SEPOLIA_PRIVATE_KEY as `0x${string}` | undefined,
    contractAddress: env.CLAMP_AUDIT_ADDRESS as `0x${string}` | undefined,
  };
}

export function isChainConfigured(): boolean {
  const c = chainConfig();
  return Boolean(c.rpcUrl && c.privateKey && c.contractAddress);
}
