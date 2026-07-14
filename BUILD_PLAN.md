---
tags: [singlo, build-plan, build-in-public]
updated: 2026-07-08
---

# Singlo — AI Vocal Coach Build Plan

## Vision
Browser-first AI vocal coach that teaches singing **and communication** to kids, teens & adults — designed from the ground up to help autistic kids and adults communicate through singing and poetry. Kung fu belt progression. Real-time pitch detection. Multiplayer battles, a worldwide choir bonfire, and a concert ladder you grow into.

**Inspired by:** [fly.pieter.com](https://fly.pieter.com) — browser-first, no friction, viral via social

**Origin note:** Voice Waves (Part 8b) was designed by my 8-year-old daughter, who was fascinated by seeing her voice as a waveform in voice notes. 🌊

---

## Build Parts

### Part 1 — Real Pitch Detection + Piano Keys ✅ SHIPPED
Mic → real-time note detection → piano keys light up. Web Audio + autocorrelation, key selector, cents meter, pitch trail. (`web/pitch.html`)

### Part 2 — Kung Fu Belt System ✅ SHIPPED
9-tier belt ladder (🤍→🖤), XP earning, promotion overlay. Stored in `singlo_progress` localStorage. (`web/pitch.html`, `web/badges.html`)

### Part 3 — Age Group Customization ✅ SHIPPED
Kids 🧸 / Teens 🎮 / Pro 🏆 selector changes actual exercise content. Kids use octave-free (chroma) matching so small voices work. Gentle progress decay — no hard fails. (`web/practice.html`)

### Part 4 — Multiplayer Pitch Battle ✅ SHIPPED
Socket.io server: private rooms by 4-letter code **+ ⚡ Quick Match** (global queue pairs strangers worldwide). 5 rounds, live opponent needle, winner. Verified with simulated clients. (`server/server.js`, `web/battle.html`)
- [ ] TODO: move round scoring server-side before public leaderboards

### Part 5 — AI Vocal Coach Feedback ✅ SHIPPED
After each exercise Claude gives 2-sentence age-appropriate feedback (accuracy, avg cents, longest hold, weak notes). Offline fallback tips included. (`web/js/coach.js` + `server/coach-proxy.js` → deploy at `api/coach.js` on Vercel with `ANTHROPIC_API_KEY`)

### Part 6 — PWA + Mobile ✅ SHIPPED (PWA half)
Manifest + service worker + icons → installable on iPhone/Android home screen.
- [ ] TODO: Capacitor wrap for App Store

### Part 7 — Build in Public Distribution ✅ SHIPPED (tooling)
Canvas 1200×630 belt share card in app colors, download + Share-on-X, wired to promotion overlay. (`web/js/sharecard.js`)

### Part 8 — Voice Painting (Poetry Mode) ✅ SHIPPED
Hum a note → the coloring-book picture fills with color → each finished part reveals a poem line. Octave-free, no failure state, calm mode (no sound/motion), +40 XP. Finish card links to Voice Waves. (`web/voice-painting.html`)

### Part 8b — Voice Waves 🌊 ✅ SHIPPED *(daughter's feature)*
Live neon waveform of your voice. Record a poem reading → play back → the wave dances to YOUR recorded voice. Expression meter ("how far your voice traveled" — gentle prosody practice, framed as a mountain, never a grade). +15 XP. (`web/waves.html`)

### Part 9 — Choir Bonfire 🔥 ✅ SHIPPED
One global room, night sky, campfire. Server cycles a chord (C→Am→F→G) every 25s; sing ANY of the 3 chord tones in any octave. Every real singer = an orb around the fire, lit by their chord tone. **The fire grows as harmony rises.** Live 🌍 online counter on homepage. Verified: 3 singers, 2 on chord tones → 67% harmony. (`web/choir.html`)

### Part 9b — Mastery Gates 🥋 ✅ SHIPPED (White + Yellow)
Belt promotion now needs the XP threshold **and** the belt's skill gate —
7 Practice Sparks (effort, never fails) + 3 Mastery Stars (measured,
age-adaptive) + 1 Show Pass, per `docs/KIDS_BELT_CRITERIA.md`. XP measures
activity; belts measure ability. Poetry modes earn the same ladder (Waves
recordings = sparks, 5+ semitone expression counts double; Voice Painting
= spark + steady-voice star). Existing players grandfathered. Engine in
`singlo-core.js` (`recordSpark/awardStar/awardShow/gateStatus`), gate strip
on badges.html, hooks in practice/pitch/waves/voice-painting.
Test: `node web/js/test-gates.mjs` (16 checks).
- [ ] TODO: wire Orange→Black curricula (currently XP-only) as each belt's
      game tasks land; add cue-based start/stop tasks for White

### Part 9c — Singlo Kids folded in 🧸 ✅ SHIPPED
The May `dev` branch's Kids Sound Painting (`kids.html` + audio engine +
i18n en/es/fr/pt + kids progress module) now lives on main, linked from
the home screen (AGES 5–7 card). Its awards bridge into the shared
mastery-gate ladder: voice activations = sparks (+ `w_sounds` at 10),
3s+ voice play = `w_hold`, the finale = White Show Pass. Verified
headless: one full kids session completes the entire White gate.
`dev` branch is now fully rescued (code + docs) — safe to archive.

### Part 10 — Venues by Belt 🎪 PLANNED
| Belts | Venue | Crowd |
|---|---|---|
| 🤍💛🧡 | State Fair stage | ~50 |
| 💚💙💜 | Small concert hall | ~300 |
| ❤️🤎 | Arena | ~5,000 |
| 🖤 | Stadium headliner | ~60,000 |
Concert = scheduled 3–5 song session in the venue your belt unlocks.

### Part 11 — Audience & Invites 👨‍👩‍👧 PLANNED
Invite link `/watch/{concertId}` — family tunes in live. **Virtual audience guarantees a full house**: simulated crowd fills every empty seat, cheers scale with live accuracy; real spectators appear as named glowing seats. *Nobody ever performs to an empty room.*

### Part 12 — Performing Avatar 🕺 PLANNED
Earned at Green Belt. Sings WITH you live: mouth on voice activity, arms rise with pitch, glow = current note. Belt-tier unlocks (outfits, mic, moves). Appears on concert stages + as your bonfire orb skin.

### Part 13 — Spoken Word Track 🎤 PLANNED
The speaking mirror of the singing ladder — same belts, same venues. Exercises: pacing, expression (reuses Waves meter), volume dynamics. **Spoken word battles**: prompt rounds ("30s on: FIRE") on the battle server. Black Belt = stadium headline poetry set. Pipeline: paint the poem → read it in Waves → perform it on stage.

### PREREQ before Part 10 — Supabase accounts ⚠️
Anonymous sign-in, cloud XP (belts survive device changes), shareable concert IDs, honest server-side scoring → then global leaderboard by belt.

---

## Tech Stack
| Layer | Tool |
|---|---|
| Frontend | Vanilla JS + shared `web/js/singlo-core.js` |
| Pitch Detection | Web Audio API + autocorrelation (ACF2+) |
| Waveform | Canvas + AnalyserNode (`Singlo.attachWaveform`) |
| AI Coach | Claude API via Vercel serverless proxy |
| Multiplayer | Socket.io + Node.js (battles, quick match, choir, presence) |
| Database | Supabase (next milestone) |
| Deploy | Vercel (web) + Fly.io (server) |
| Mobile | PWA now → Capacitor later |

## Files
- `web/index.html` — home (nav wired, online counter, module cards)
- `web/pitch.html` — Part 1+2 · `web/badges.html` — belts
- `web/practice.html` — Part 3+5+7 · `web/battle.html` — Part 4
- `web/voice-painting.html` — Part 8 · `web/waves.html` — Part 8b
- `web/choir.html` — Part 9 · `web/js/` — core, coach, sharecard
- `server/server.js` — battles + quick match + choir + presence
- `server/coach-proxy.js` — Claude proxy (→ Vercel `api/coach.js`)

## GitHub
- Repo: https://github.com/chrisx262/singlo · branch `parts-3-to-8` ready to merge
- `main` = stable, `dev` = active build

## Deploy checklist
- [ ] `web/` → Vercel · move `coach-proxy.js` to `api/coach.js` · set `ANTHROPIC_API_KEY`
- [ ] `server/` → `fly launch` · set `SERVER_URL` in battle.html, choir.html, index.html
- [ ] Real domain (the link is the pitch)

## Build in Public Log
| Date | Part | What shipped | Posted |
|---|---|---|---|
| 2026-04-25 | Setup | Project structure + git init | — |
| 2026-04-25 | Part 1 ✅ | Pitch detection + piano keys + cents meter + trail | 🎯 Post demo |
| 2026-04-25 | Part 2 ✅ | Kung fu belts (9 tiers) + XP + promotion overlay | 🥋 Post belt unlock |
| 2026-07-07 | Part 8 ✅ | Voice Painting — hum to color a picture, poem reveals | 🎨 Post kid demo |
| 2026-07-07 | Parts 3–7 ✅ | Age groups, battles, AI coach, PWA, share cards | ⚔️ Post battle clip |
| 2026-07-08 | Part 9 ✅ | Choir Bonfire + Quick Match + online counter | 🔥 Post bonfire video |
| 2026-07-08 | Part 8b ✅ | Voice Waves — see & hear your own voice (daughter's idea) | 🌊 Post waveform clip |

## Post ideas (Pieter-style: raw demo + one question)
- 🌊 "My 8yo designed this feature" + waveform clip → *"what did YOUR kid teach you to build?"*
- 🔥 Bonfire with 4–5 real humans humming a chord → *"want in? link below"*
- 🎨 Kid humming, picture painting itself → *"should poems rhyme or is that a boomer take?"*
