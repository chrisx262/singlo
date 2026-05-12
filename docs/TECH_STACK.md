# Singlo Tech Stack

## Stack Philosophy

Singlo should stay browser-first, lightweight, and safe. The first public builds should prove the fun before adding accounts, databases, AI calls, or complex multiplayer.

Use the simplest stack that lets us ship, test, and post progress publicly.

## Swappable Architecture Principle

Build the first game as interchangeable layers:

- audio engine: normalized voice events such as energy, pitch, onset, sustain, and contour
- skill rules: belt criteria and thresholds that consume voice events
- game wrappers: scenes such as Light Up The Stage, Sound Garden, and Rhythm Echo
- visual rewards: lights, paint, shimmer, bursts, and finale effects
- content packs: language strings, prompts, melodies, and spoken-word lines
- storage adapters: local progress now, cloud profiles later

Game wrappers should not own the belt rules. Belt rules should not own the visuals. This keeps the product easy to tune or swap after real kid testing.

## Recommended Stack By Stage

| Stage | Layer | Choice | Why |
|---|---|---|---|
| Now | Frontend | Vanilla HTML/CSS/JS | Current prototype is small and easy to inspect. |
| Next | Frontend | Vite + TypeScript | Better structure without the weight of a full app framework. |
| Now | Pitch/audio | Web Audio API in browser | Keeps raw voice local by default. |
| Later, if useful | Audio helpers | Tone.js or Howler.js | Only add a small library if native Web Audio becomes painful for playback, effects, or sequencing. |
| Now | Visuals | HTML/CSS/canvas | Fast enough for first mini games and easy to ship. |
| Later | 3D stages | Three.js | Best fit for virtual stages/concert spaces. |
| Now | Storage | localStorage / IndexedDB | No login needed for first play. |
| Later | Database | Supabase | Good for profiles, progress, leaderboards, and row-level security. |
| Now | Hosting | Static hosting on Vercel or Cloudflare Pages | Cheap, simple, browser-first distribution. |
| Later | Game multiplayer | WebSockets | Room codes, scores, pitch events, and group state. |
| Later | Live voice | WebRTC / LiveKit | Needed for real-time teen harmony rooms and virtual concerts. |
| Later | AI coach | Server endpoint | Send derived metrics first, not raw child audio. |

## What To Avoid Early

- Do not move to an app store path.
- Do not require login for the first play.
- Do not store raw child voice by default.
- Do not add Supabase before cloud progress or leaderboards are truly needed.
- Do not add live WebRTC rooms before the solo game loop is fun.
- Do not add Tone.js, Howler.js, or a game engine until the first native browser version shows a real need.
- Do not use Next.js unless the product needs server-rendered pages, accounts, dashboards, or API routes.

## Security And Privacy Defaults

- Pitch detection runs in the browser.
- Short echo/playback experiments stay in temporary browser memory and are cleared after playback or page refresh.
- First play works as a guest.
- Kids mode has no open chat.
- Multiplayer uses room codes first.
- AI feedback should receive metrics such as note accuracy, timing, and completion, not raw recordings by default.
- Parent-controlled accounts come before persistent child profiles.
- Supabase policies must use row-level security when cloud data is introduced.

## Official Development Flow

- `main` is the stable public build.
- `dev` is the active build branch.
- Each meaningful section gets its own commit.
- Push docs, UI, mini games, backend, and deployment changes as separate sections where practical.
- Use the build plan to decide the next section before coding.
- After a section is tested, merge or fast-forward it into `main`.

## Near-Term Build Sections

1. Project kickoff docs and first-page prototype.
2. Pitch trainer improvements: equalizer, volume, clearer feedback.
3. Kids first mini game: Light Up The Stage with Sound Painting.
4. White Belt to Yellow Belt criteria.
5. Shareable performance card.
6. Build-in-public feedback post assets.
7. First lightweight deploy.
