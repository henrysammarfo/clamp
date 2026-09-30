# CLAMP submit checklist

Form: https://forms.gle/iiDRR7e3qbaXfetp7  
Deadline: 30 Sep 2026 12:00 noon KST = **03:00 AM Ghana GMT** (not midnight)

## Day of (Song-confirmed)

| Step | KST | Ghana GMT | Who |
| --- | --- | --- | --- |
| Submit everything | 12:00 | 03:00 | Either can submit |
| Booth judging + Q and A | 13:00 | 04:00 | **Henry** (Zoom) |
| Results | 15:00 | 06:00 | — |
| Final pitch if selected | 16:00 | 07:00 | **Song** |

## Package status

| Item | Status | Link / path |
| --- | --- | --- |
| Public GitHub repo | Ready | https://github.com/henrysammarfo/clamp |
| Submission evidence | Ready on main | https://github.com/henrysammarfo/clamp/blob/main/docs/SUBMISSION_EVIDENCE.md |
| Pitch deck PPTX | Ready for Song form | `docs/submit/view/CLAMP_Team14_Pitch.pptx` |
| Pitch deck PDF | Ready | `docs/submit/view/CLAMP_Team14_Pitch.pdf` |
| Demo video ≤ 3 min | **Uploaded (public)** | https://github.com/henrysammarfo/clamp/releases/download/gwdc-2026-submit/CLAMP_Team14_Demo.mp4 |
| Booth Q and A | Ready | `docs/submit/BOOTH_PITCH_QA.md` |
| Form submit | **Song captain** · deploy **not required** | Henry sends: full name, city/country, public video link, final deck |
| Live frontend (Vercel) | Optional (done anyway) | https://clamp-eight.vercel.app |
| Live FastAPI backend (Render) | Optional (done anyway) | https://clamp-api.onrender.com |

## Deploy notes (2026-09-29)

- Vercel project: `teamtitanlink/clamp` → https://clamp-eight.vercel.app (public)
- Render service: `clamp-api` → https://clamp-api.onrender.com (`/health` ok)
- Vercel `FASTAPI_BASE_URL` points at Render; CORS allows the Vercel origin
- **Neon:** Postgres only · not used (backend stays SQLite on Render free disk ephemeral)
- Free Render cold starts after idle (~1 min wake). Fine for demo; hit `/health` once before recording if using the public pair.
- Local stack still good for reliable demo recording

## Local demo stack (this machine)

- Backend health: `http://127.0.0.1:8000/health` (up · Kiln key set locally)
- Frontend: `http://127.0.0.1:3000/` (up)

## Form fields Song needs from Henry (2026-09-29)

Official package: challenge · GitHub · public demo video ≤3 min · pitch deck. **No live app URL.**

| Field | Value |
| --- | --- |
| Full name | Henry Sam Marfo |
| Team location (country + city) | Ghana · _(Henry fill city)_ |
| GitHub | https://github.com/henrysammarfo/clamp |
| Demo video (public YouTube / Drive / Notion) | https://github.com/henrysammarfo/clamp/releases/download/gwdc-2026-submit/CLAMP_Team14_Demo.mp4 |
| Pitch deck | https://github.com/henrysammarfo/clamp/blob/main/docs/submit/view/CLAMP_Team14_Pitch.pdf |
| Pitch PPTX | https://github.com/henrysammarfo/clamp/blob/main/docs/submit/view/CLAMP_Team14_Pitch.pptx |

Video must show workflow + AI decision path. Keep under 3 minutes.

## Key verified txs (paste into form / deck)

- Contract: https://sepolia.basescan.org/address/0x4648520fe2b192791c9ae13e46e0cba9544c42d6
- Original ALLOW: https://sepolia.basescan.org/tx/0xc24d48229e85b34cb77b9410b9debba2d937ba7f076fea777be07baa3573de0b
- Human approved ALLOW: https://sepolia.basescan.org/tx/0xed1a99f1b0ed96fa1f9229321ff0eb388898a63e6584f7e25eb8717ce4da869b
- Merchant BLOCK: https://sepolia.basescan.org/tx/0xea0b454ebac7e5b6b43ad27d5af6ee5b1c6c60fe3b75e962d44635075caa41ef
- Human Reject: https://sepolia.basescan.org/tx/0x810c0bcb3fa199aba35c0fb2194db39de715529c79fca9be9d2bc2a630ec9258
- Mandate Revoke: https://sepolia.basescan.org/tx/0x9f83da2b89d060d42bfb72bffaec0456ef7e3f26dbea9741004d6860549e8d93
- Purpose OFFICE ALLOW: https://sepolia.basescan.org/tx/0xd76a371eb6bbc2a7693ccd14176bddaa7a0f7a338880fa56cd20750066c3e4c1
- Purpose FOOD BLOCK: https://sepolia.basescan.org/tx/0x219a83a5815cea03eaf16874ec1cd10be213fddac4c2ae2f52bf687a58af99b3

## Benchmark (say carefully)

- 30 adversarial cases × 3 reps · same model `deepseek-v4.1-flash`
- Decision accuracy: CLAMP 100% · ALL_AI 100%
- Reason code accuracy: CLAMP 100% · ALL_AI 97.78%
- Tokens: CLAMP 38,420 · ALL_AI 69,053 · **44.4% fewer**
- Do not claim energy savings beyond token/latency proxies. Do not claim unhackable.

## Handoff rule (Song 2026-09-29)

If Henry finishes package and can open the form → submit.  
If Henry stops early → send Song latest files/links + exact stop point.  
If package ready but Henry cannot submit → send Song exact materials + form answers.
