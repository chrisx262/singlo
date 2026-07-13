# Singlo — Parts 3–8 (branch: parts-3-to-8)

Everything integrates with the existing app:
- XP/belts read & write the same `singlo_progress` localStorage JSON as pitch.html/badges.html
- BELTS table is an exact copy of pitch.html's (hearts, colors, thresholds)
- Age groups use kids / teens / adults (matching index.html's selectAge)
- All pages use the dark neon design system (Fredoka One, glass cards, blobs)

## New files
web/js/singlo-core.js    shared pitch detection + belt/XP (singlo_progress schema)
web/js/coach.js          Part 5 client — Claude feedback via /api/coach, offline fallback
web/js/sharecard.js      Part 7 — canvas 1200x630 belt card + Share-on-X
web/practice.html        Part 3+5+7 — age-group exercises, XP, promotion overlay, coach
web/battle.html          Part 4 client — set SERVER_URL to your Fly.io app URL
web/voice-painting.html  Part 8 — poetry mode, calm mode, +40 XP on completion
web/manifest.json, web/sw.js, web/icons/   Part 6 — PWA installable
server/server.js         Part 4 — Socket.io battle server (rooms, 5 rounds, winner)
server/coach-proxy.js    Part 5 — move to api/coach.js on Vercel, set ANTHROPIC_API_KEY

## Edits to index.html (small, surgical)
- Bottom nav: Practice→practice.html, Badges→badges.html, Community→⚔️ Battle→battle.html
- New "Voice Painting 🎨" module card → voice-painting.html
- selectAge() now saves ageGroup into singlo_progress (practice.html reads it)
- manifest link + service worker registration (PWA)

## Run locally
cd web && python3 -m http.server 8000
cd server && npm install && npm start   # battle server on :3001

## Deploy
web/ → Vercel; put server/coach-proxy.js at api/coach.js, set ANTHROPIC_API_KEY
server/ → fly launch, then update SERVER_URL in battle.html

## Known MVP tradeoffs
- Battle scoring is client-reported; move server-side before real leaderboards
- pitch.html still has its own detection code — works fine, but consider
  refactoring it onto js/singlo-core.js so there's one detector

---

## NEW: Live features (this update)
- **Quick Match** (battle.html): "⚡ Battle a stranger" — server-side queue pairs
  any two singers worldwide, no room code needed
- **Online counter**: homepage badge + choir header show live "🌍 N online"
- **Choir Bonfire** (choir.html + server): one global room. Server cycles a chord
  every 25s (C, Am, F, G). Sing ANY of the 3 chord tones, any octave. Every real
  singer appears as an orb around the fire, lit yellow/pink/teal by which chord
  tone they're on. The fire grows with the % of singers in harmony. Calm mode
  included. Verified with 5 simulated clients (quick match + 67% harmony score).

## Roadmap: Concert System (Parts 10–12)

### Part 10 — Venues by Belt (the "grow into it" ladder)
| Belts | Venue | Crowd |
|---|---|---|
| 🤍💛🧡 White–Orange | 🎪 State Fair stage | ~50 |
| 💚💙💜 Green–Purple | 🏛️ Small concert hall | ~300 |
| ❤️🤎 Red–Brown | 🎭 Arena | ~5,000 |
| 🖤 Black | 🏟️ Stadium headliner | ~60,000 |
- A "concert" = a scheduled 3–5 song performance session in a venue scene
- Your belt unlocks the venue; performing well there feeds XP back
- **Ship when:** starting a concert loads the venue matching your belt

### Part 11 — Audience & Invites
- Invite link (`/watch/{concertId}`) — friends & family tune in live as
  spectators (receive the singer's pitch stream + a listen-only audio option later)
- **Virtual audience guarantees a full house**: simulated crowd fills every
  empty seat — animated silhouettes, lighters/phone-lights, cheers scaled to
  live pitch accuracy (great performance = louder crowd). Real spectators
  appear as named glowing seats. Nobody ever performs to an empty room —
  which matters enormously for confidence, especially for autistic performers.
- **Ship when:** a shared link lets a parent watch a live concert with a full crowd

### Part 12 — Performing Avatar
- Earned at Green Belt; customized with belt-tier unlocks (outfits, mic, stage moves)
- Avatar sings WITH you in real time: mouth opens on voice activity, arms rise
  with pitch height, glow color = current note, special animation on sustained
  accuracy streaks (all driven by data already coming from singlo-core)
- Avatar appears on stage in concerts and as your orb skin at the bonfire
- **Ship when:** avatar visibly reacts to your live singing on the concert stage

### Build order note
Supabase accounts should land BEFORE Part 10 (concerts need scheduled events,
invites need shareable IDs, and belts must survive device changes).

---

## NEW: Voice Waves (waves.html) — inspired by an 8-year-old 🌊
- Live neon waveform of your voice (the "voice notes" magic moment)
- Record → play back → the waveform dances to YOUR recorded voice
  (playback is routed through an analyser, so she sees + hears herself at once)
- The Voice Painting poem appears as read-aloud lines (tap to highlight)
- Expression meter: "how far your voice traveled" (p90–p10 pitch range in
  semitones) — framed as a mountain your voice climbed, NEVER a grade.
  This is gentle prosody practice, a real speech-therapy target.
- +15 XP for a recording; calm mode; session clips list
- Voice Painting now has a live waveform strip too, and its finish card
  links to Voice Waves ("record it and hear yourself back")
- index.html "Speaking" module card is now "Voice Waves 🌊"

## Roadmap: Part 13 — Spoken Word Track (battles & performances)
The speaking mirror of the singing ladder — same belts, same venues:
- **Exercises:** pacing (steady vs rushing, via voice-activity rhythm),
  expression (pitch-range meter from Voice Waves), volume dynamics
  (whisper→project), clarity drills
- **Spoken word battles:** reuse the battle server — rounds become prompts
  ("30 seconds on: FIRE"), both performances recorded; MVP scoring =
  expression + pacing metrics; later = audience voting from spectators
- **Performances:** the SAME venue ladder as singers (Part 10) — state fair
  open-mic → poetry café → arena slam → Black Belt stadium headline set,
  with the virtual full-house audience (Part 11) and performing avatar (Part 12)
- Poems written in Voice Painting become material: paint it → read it in
  Waves → perform it on stage. One creative pipeline from humming to headlining.
- **Ship when:** two players complete a prompt battle and see expression scores
