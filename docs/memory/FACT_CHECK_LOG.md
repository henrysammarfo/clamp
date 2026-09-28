# Fact check log

## 2026-09-28

### GWDC Challenge B

Source: https://www.gwdc.net/hackathon.html  
Result: Challenge B is Build the Controls and Records for an AI Agent That Spends. FuriosaAI x Bricksum. Submit deadline 30 Sep 12:00 KST.

### Kiln

Source: https://kiln.bricksum.com/docs/en  
Result: OpenAI compatible SDK. base_url https://api.bricksum.com/v1. Keys sk-bk-…. Runtime config taasBaseUrl matches. Docs examples still show gpt-oss-120b. Bible prefers qwen3-32b. Song must verify live models page before hardcoding.

### Base Sepolia

Source: Tavily search + Base docs  
Result: Chain id 84532 (0x14a34). Explorer sepolia.basescan.org. Native ETH test.

### TinyFish

Source: https://docs.tinyfish.ai  
Result: Auth header X-API-Key. Search api.search.tinyfish.ai. Fetch api.fetch.tinyfish.ai. api.tinyfish.ai does not resolve.

### Tavily

Source: live POST /search with rotated key  
Result: Key works after prior quota failure.

### AgentRouter

Source: docs.agentrouter.org  
Result: Claude or OpenAI coding proxy. Not needed inside CLAMP spend path.
