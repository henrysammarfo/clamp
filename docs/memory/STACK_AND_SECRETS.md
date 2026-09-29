# Stack and secrets

## Stack

- Frontend and SSR: TanStack Start, React 19, Vite, Tailwind 4, shadcn
- Package manager: Bun
- Chain: Base Sepolia (chain id 84532), viem, ClampAudit contract
- Sessions: signed httpOnly cookies for the demo workspace
- Product state: FastAPI + SQLite; current backend does not enforce tenant isolation
- Song integrations: typed fail closed contracts under src/server/integrations/song/
- Client RPC entrypoints: src/api/* (createServerFn). Do not import src/server/** from client components.

## Runtime env (app)

Never commit these. Put them in local .env or host secrets only.

| Name | Purpose |
| --- | --- |
| SESSION_SECRET | HMAC secret for session cookies |
| BASE_SEPOLIA_RPC_URL | Base Sepolia JSON RPC |
| BASE_SEPOLIA_PRIVATE_KEY | Funded deployer or sender key |
| CLAMP_AUDIT_ADDRESS | Deployed ClampAudit contract address |

## Live Base Sepolia (2026-09-29)

Public only. Never commit private keys. See [`CHAIN_AUDIT.md`](CHAIN_AUDIT.md).

| Item | Value |
| --- | --- |
| Deployer | `0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0` |
| ClampAudit v2 | `0x4648520fe2b192791c9ae13e46e0cba9544c42d6` |
| Deploy tx | `0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797` |
| Explorer | https://sepolia.basescan.org/address/0x4648520fe2b192791c9ae13e46e0cba9544c42d6 |
| Retired v1 | `0xebf79a18105f43730d6b54fc53144499c8050287` |

## Research env (agents only)

Not required for Allow or Block. Used for fact checks and memory updates.

| Name | Purpose |
| --- | --- |
| TAVILY_API_KEY | Web search fact checks |
| TINYFISH_API_KEY | TinyFish Search or Fetch (header X-API-Key) |

TinyFish hosts:

- Search: https://api.search.tinyfish.ai
- Fetch: https://api.fetch.tinyfish.ai
- Docs: https://docs.tinyfish.ai

Do not use api.tinyfish.ai. That host is wrong.

## Kiln (Song)

- Docs: https://kiln.bricksum.com/docs/en
- Base URL: https://api.bricksum.com/v1
- Keys: sk-bk-…
- Current backend model: `deepseek-v4.1-flash`

## Security notes

- No localStorage or sessionStorage for product state
- Current limitation: FastAPI mandate/decision records are not tenant-isolated; the signed session is a UI/demo boundary, not backend data isolation
- Rotate any key pasted into chat after the hack
