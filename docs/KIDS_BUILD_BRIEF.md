# Singlo Kids 5-12 Build Brief

This brief turns the Q20 brainstorm into the working direction for the first kids build.

## Best Current Direction

Build **Light Up The Stage with Sound Painting**.

The first version should not split into separate Stage and Garden games yet. The strongest MVP is:

1. A kid taps a big piano key.
2. The stage wakes up.
3. Any voice sound creates color and motion.
4. Humming or singing steers the color trail.
5. Getting closer to the target note creates a bigger burst.
6. The round ends with a tiny stage moment.

This keeps the game instantly understandable, uses the piano hook we observed, supports humming and speaking, and still teaches pitch height through visual art.

## Core Philosophy

Singlo is a voice-first play space where sound is the energy source.

For Kids 5-12:

- Fun first, real skill underneath.
- Every sound should do something.
- There are no harsh failure screens.
- Feedback should feel like levels of magic, not grades.
- Humming, speaking, and vocal exploration count as valid early input.
- Gestalt-friendly phrases and melody shapes matter more than isolated note names in the early game.
- Belt promotion represents mastery, but practice should always feel rewarding.

## Locked Decisions For Stage 1

- First feeling: instant agency. The world should feel like it is waiting for the child's sound.
- First interaction: tap a large piano key, hear a warm note, and wake the stage.
- First voice action: make any sound to activate lights, color, or motion.
- First learning mechanic: sound painting. High sounds draw higher; low sounds draw lower.
- Correct pitch feedback: color burst, brighter lights, stronger motion.
- Off-pitch feedback: soft shimmer or gentle wobble. No red warnings, buzzers, or "wrong" labels.
- Correction style: invisible guidance. The reference note can gently return, but the game should not scold.
- Note display: colors and shapes first, note names later or in parent/advanced view.
- Progress: effort earns XP and Practice Sparks; belt promotion requires Mastery Stars and Show Passes.
- Privacy: Ghost Mode first. No required account, no child name, local storage only.

## Good Ideas To Keep Flexible

These are promising but should not be hard-coded into the first build:

- Lead coach character or mascot.
- Backyard stage as the first world.
- Neon city or fantasy world unlocks.
- Echo Bubble / local playback.
- Call-and-response phrases.
- Parent success snapshot.
- Share or performance cards.

The first build should allow these to be added or swapped later.

## What To Avoid

- 1-100 scores for kids.
- Tick-tock pressure timers.
- Try-again failure screens.
- Silence after the child makes sound.
- Requiring lyrics in the first loop.
- Requiring login before play.
- Uploading raw child audio.
- Locking the game to one mascot, world, or mini-game before testing.

## First MVP Shape

Working name: **Light Up The Stage: Sound Painting MVP**

Core objects:

- one large piano key
- one simple stage scene
- one optional coach/mascot placeholder
- one voice-to-color visualizer
- one stage reaction layer
- one White Belt progress tracker
- optional Yellow Belt target-note tracker behind a flag

First loop:

1. The kid opens the page.
2. The piano key pulses.
3. The kid taps the key.
4. A reference note plays.
5. The stage wakes.
6. The kid makes any sound.
7. Color appears instantly.
8. If the sound has usable pitch, the trail moves by pitch height.
9. If the pitch moves near the target, the stage bursts brighter.
10. The game awards White Belt progress for intentional sound.

Stretch loop:

1. The game offers a short show round.
2. The kid completes 5-10 sound activations.
3. The stage performs a 5-second finale.
4. The game shows a simple progress moment, not a public share card yet.

## Success Benchmark

The first kids build is working if a child who usually avoids vocal performance stays engaged and plays with their voice for 5 consecutive minutes.

Secondary signs:

- The child taps first without needing instructions.
- The child tries sound because the screen responds.
- The child repeats sound to make the visual happen again.
- The child notices that high and low sounds change the visual.
- The child is not upset by missed pitch.

## White To Yellow Focus

White Belt plain language: **I found my voice.**

The child can intentionally make the game react with sound.

Yellow Belt plain language: **I can steer my voice.**

The child can move their voice toward a target sound, using hums or singing.

Stage 1 should fully support White Belt. Yellow Belt can appear as an early prototype only after the White loop feels fun.

## Best Technical Direction

Use native browser technology first:

- HTML/CSS/JavaScript for the current prototype.
- Web Audio API for microphone input, energy, pitch, and playback.
- Canvas for sound painting and visual effects.
- localStorage for local progress.

Do not add Tone.js, Howler.js, a game engine, accounts, or cloud storage until the first loop proves it needs them.

## Swappable Build Rule

The game should be built so the engine survives even if the first wrapper changes.

Keep these pieces separate:

- audio engine: mic, energy, pitch, onset, sustain
- skill rules: belt thresholds, Practice Sparks, Mastery Stars, Show Passes
- mini-game wrapper: Light Up The Stage, Sound Garden, Rhythm Echo, future modes
- visual rewards: lights, paint, bursts, shimmer, finale
- content packs: language, prompts, phrases, songs
- progress storage: local progress now, cloud later

If Light Up The Stage does not work, we should be able to keep the audio engine and belt rules, then swap the wrapper to Sound Garden or another game.
