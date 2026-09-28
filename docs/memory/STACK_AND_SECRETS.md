# Stack and secrets

## Stack

- Frontend and SSR: TanStack Start, React 19, Vite, Tailwind 4, shadcn
- Package manager: Bun
- Chain: Base Sepolia (chain id 84532), viem, ClampAudit contract
- Sessions: signed httpOnly cookies, tenant scoped server store
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
- Prefer model qwen3-32b after checking the live catalog

## Security notes

- No localStorage or sessionStorage for product state
- Multi tenant: every store read or write is scoped by tenantId from session
- Rotate any key pasted into chat after the hack
