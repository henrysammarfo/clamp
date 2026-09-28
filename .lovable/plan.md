# CLAMP full demo app plan

## Goal
Build CLAMP as a polished, complete demo product: a delegation control layer where people create temporary spending mandates, agents submit purchase requests, deterministic rules return **Allow**, **Block**, or **Needs human**, and every outcome has a reconstructable audit receipt.

The supplied full-bleed video template will define the visual language. Because this project already runs on TanStack Start, the same design will be implemented in the existing app rather than replacing it with disconnected static files.

## Brand system
- Create a merch-ready **Mandate Seal** identity: circular CLAMP mark, boundary ring, transaction notch, and strong one-color silhouette.
- Use black, white, signal coral `#FF4D3D`, and neutral gray; preserve the exact black video-led landing aesthetic.
- Produce a primary logo, compact app mark, light/dark treatments, and clean favicon treatment suitable for hoodies, avatars, navigation, and receipts.
- Use BubbledotICG-FinePos for major display moments, Inter for interface text, Font Awesome only for enterprise brand marks, and Lucide icons for premium product controls.

## Page and route map

### Public site
- `/` — exact single-viewport landing composition: looping supplied CloudFront video, navigation, trust row, two-line headline, CTA, animated metrics, and mobile menu.
- `/product` — mandate lifecycle, deterministic gate, decision states, audit trail, Kiln parse/explain role, Base testnet receipt model, and efficiency comparison.
- `/case-studies` — full Amazon Allow, BestBuy Block, and borderline Needs-human scenarios with visual receipts.
- `/case-studies/$slug` — shareable detail view reconstructing each scenario step by step.
- `/docs` — overview, architecture, mandate rules, decisions, audit receipts, efficiency thesis, and integration guidance.
- `/contact` — Team 14 identity, collaboration form with client-side confirmation, and relevant links.
- `/sign-in` — polished demo access screen; clearly labels the experience as a demonstration.

### Product workspace
- `/dashboard` — command center with active mandate, recent decisions, pending review, budget state, and CLAMP-vs-all-AI metrics.
- `/mandates` — mandate list with active, expired, and revoked states.
- `/mandates/new` — complete creation flow for purpose, total budget including fees, merchant allowlist, and expiry.
- `/mandates/$id` — mandate detail, remaining budget, rules, activity, revoke action, and submit-agent-request entry point.
- `/requests/new` — natural-language agent request flow that visibly separates Kiln parsing from the zero-inference code gate.
- `/decisions` — filterable decision ledger for Allow, Block, and Needs-human outcomes.
- `/decisions/$id` — complete audit receipt: original request, parsed action, matched rule, decision, reason, payment/stop state, transaction hash, timestamps, and caveats.
- `/reviews` — pending human approvals with approve/block actions and confirmation states.
- `/audit` — handoff-ready tamper-proof audit trail with search, filters, receipt inspection, and copy/export interactions.
- `/metrics` — CLAMP versus all-AI calls, tokens, latency, and stated energy assumptions across the same demo cases.
- `/settings` — demo mode, network/model labels, notification controls, and clear integration status.

## Core demo flows
1. **Create mandate:** prefilled showcase values `$50`, Amazon/Apple/Uber, office supplies, ends tonight; validate every field and show the resulting mandate commitment.
2. **Allow:** submit “Buy $30 of printer paper on Amazon”; show parse → deterministic checks → allowed → labeled Base testnet settlement receipt.
3. **Block:** submit BestBuy request; open directly on the decisive “merchant not allowed / nothing paid” state and record a stop receipt.
4. **Needs human:** submit a near-budget or purpose-ambiguous request; hold payment, place it in Reviews, and let the user approve or block it.
5. **Revoke:** revoke an active mandate, confirm the consequence, and ensure later requests are blocked as revoked.
6. **Audit handoff:** open any decision as a self-contained receipt and copy/export its evidence summary.
7. **Efficiency comparison:** animate and explain calls, token use, and latency against an all-AI baseline without implying live measurements.

All data and interactions will be deterministic in-memory demo fixtures. Testnet hashes, Kiln activity, and payment outcomes will be visibly labeled as demo examples—no fake live usage or payment claims.

## Visual and interaction implementation
- Preserve the exact landing-page proportions, typography, video URL, desktop pills, trust badges, headline treatment, count-up timing, mobile overlay, and reduced-motion behavior from the supplied template.
- Extend that language into an editorial control-room workspace: black canvas, white working surfaces, coral decision accents, compact data tables, firm dividers, and restrained motion.
- Use a shared public header and a separate responsive dashboard shell with sidebar, mobile navigation, status indicators, dialogs, forms, filters, and toasts.
- Keep decision semantics instantly scannable: Allow, Block, and Needs human use distinct icon, label, and tone—not color alone.
- Ensure every control works, all linked destinations exist, long labels fit, and desktop/mobile layouts remain coherent.

## Technical details
- Keep TanStack Start file-based routing and React; do not introduce a second router or edit generated route files.
- Build reusable brand, navigation, dashboard shell, decision badge, receipt timeline, metric comparison, mandate form, and confirmation dialog components.
- Store shared demo fixtures and state in client-safe modules; session-only interactions reset on refresh and will be labeled accordingly.
- Load external fonts and Font Awesome through root document links; retain the provided video as the exact remote source.
- Add unique title, description, Open Graph title/description, `og:type`, and Twitter card metadata to every content route.
- Respect reduced motion, keyboard navigation, focus states, semantic labels, contrast, and mobile touch targets.

## Verification
- Check every route and navigation destination at desktop and mobile sizes.
- Exercise mandate creation, Allow, Block, Needs-human approval, revoke, audit receipt, filters, menu, and contact confirmation end to end.
- Confirm the exact landing video composition, animation timing, no-overlap behavior, and reduced-motion fallback.
- Confirm the current build is clean and no runtime or console errors remain.
