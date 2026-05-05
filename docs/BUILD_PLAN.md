# Singlo Build Plan

## North Star

Singlo Pop Star Dojo is a browser-first AI voice coach that turns singing practice into a game.

The product should feel like a fun music game first, with real singing education underneath. It should be easy to open, easy to try, and easy to share. No app store. No heavy download. No required login for the first play.

## Long-Term Vision

The end game is a singing simulator where players grow from beginner to performer.

Players start as white belts, learn fundamentals through voice-controlled games, build practice hours, unlock performance spaces, and eventually qualify for virtual concerts. The highest path is the pro track: a player can host a virtual concert where their singing, pitch, timing, and movement are represented in a digital stage space.

The biggest dream version includes yearly celebrations for top players, standout practice-hour leaders, and possible real-world prizes such as recording a four-song EP, AI music videos, or opening a live show. That is not the first product, but it gives the game a mythic finish line.

## Audience Tracks

Singlo should support three age tracks with the same core engine and different presentation.

| Track | Age | Tone | First Focus |
|---|---:|---|---|
| Kids | 5-12 | playful, colorful, silly, encouraging | voice games, warmups, simple melody matching |
| Teens | 13-18 | social, expressive, competitive | challenges, songs, leaderboards, performance clips |
| Adults | 19+ | practical, polished, skill-focused | singing drills, public speaking, spoken word, confidence |

Build the kids track first because it forces the game to be simple, fun, and instantly understandable.

## Global Language Support

Singlo should be playable anywhere in the world. Multi-language support is a product pillar, not an afterthought.

Early principles:

- Keep the first app copy short so translation is easier.
- Separate interface text from game logic before the codebase grows.
- Start with English, Spanish, Portuguese, French, Hindi, Japanese, Korean, and Mandarin as candidate launch languages.
- Support language selection on the first screen without requiring an account.
- Keep singing games playable even when the child cannot read much text.
- Localize coach prompts, button labels, belt names, parent-facing safety text, and share cards.
- Treat songs, poetry, and spoken-word content as language-specific content packs.
- Be careful with pronunciation feedback: accent and dialect should not be punished as "wrong."

Ship the first version in English, but structure the app so adding languages does not require rewriting every screen.

## Pieter-Style Distribution Model

Use fly.pieter.com as the distribution inspiration:

- Browser-first: a URL is the product.
- Instant play: name or guest entry, then play.
- No app store launch path in the early product.
- No large downloads, no long onboarding, no subscription wall.
- Build in public with visible progress, rough demos, and community feedback.
- Monetize later with light in-world ads, sponsored stages, branded signs, optional cosmetics, or virtual event sponsorships.
- Keep the first loops small enough to ship, film, and improve every week.

Singlo should not copy the flight simulator. It should copy the shape: open URL, enter world, do the fun thing, see other people or public proof, share the moment.

## Core Game Idea

Turn boring singing exercises into voice-controlled mini games.

Examples:

- "Me me me" makes frogs jump between lily pads.
- Sustained notes keep a turtle moving in a race.
- Pitch height controls a character climbing platforms.
- Breath control keeps a kite, balloon, or spotlight steady.
- Rhythm accuracy throws pies, launches confetti, or hits stage lights on beat.
- Scale practice moves a character across stepping stones.
- Call-and-response melodies become short pop-star auditions.

The player earns points for trying, staying in key, holding notes, matching pitch, matching rhythm, and completing practice streaks. The game should reward effort and consistency before perfection.

## Singing Fundamentals To Gamify

Research and refine this list before building each module, but the first curriculum should cover:

- posture and setup
- breathing and breath control
- warmups
- pitch matching
- sustained notes
- scales and intervals
- rhythm and timing
- vocal range exploration
- tone control
- diction and articulation
- performance confidence

Every fundamental needs a game action. If the exercise is boring by itself, the screen should make the sound do something funny, visual, or satisfying.

## Belt Progression

Belts should represent real growth, not only XP totals. The current XP system is a useful placeholder, but the next plan should combine XP with skill gates.

Draft belt criteria:

| Belt | Player Meaning | Example Criteria |
|---|---|---|
| White | first voice control | complete first warmup, detect mic, copy 3 notes |
| Yellow | basic pitch matching | hit target notes within a forgiving range several times |
| Orange | steady voice | hold notes for 3-5 seconds, complete simple melody games |
| Green | range exploration | sing low/mid/high notes, complete easy scale paths |
| Blue | rhythm and control | match pitch plus timing in short call-and-response games |
| Purple | performance practice | complete mini audition shows and save performance cards |
| Red | advanced consistency | maintain stronger accuracy over longer practice sessions |
| Brown | stage readiness | complete show sets, range challenges, and confidence drills |
| Black | mastery path | complete major modules and unlock pro-track performance spaces |

Belts should unlock new worlds and stages, not just badges.

## Practice Hours And Leaderboards

Use the 10,000-hour idea as a legendary long-term leaderboard, not a requirement.

Leaderboards can include:

- total practice hours
- yearly practice hours
- weekly consistency
- pitch accuracy
- longest steady note
- best rhythm score
- most improved
- virtual show wins
- audition wins
- age-track leaderboards
- belt-rank leaderboards

If any player reaches 10,000 tracked hours, the game should celebrate that as a major community milestone.

## Performance Progression

The game should make players feel like they are growing toward real performance.

Suggested stage ladder:

1. Bedroom practice
2. Voice dojo
3. School talent show
4. Farmers market stage
5. Small cafe
6. Ballroom
7. Theater
8. Arena
9. Virtual concert hall
10. Pro virtual concert

Early versions can fake this with 2D screens and simple animations. Later versions can move toward richer 3D spaces.

## Poetry, Spoken Word, And Speaking

Add a dedicated track for poetry, spoken word, public speaking, and debate later.

This should still feel like performance, not therapy. It can teach:

- projection
- pacing
- pauses
- articulation
- emotional tone
- confidence
- stage presence
- speaking with authority

Useful scripts can be filtered into spoken word and poetry modes naturally, especially through rhythm, call-and-response, and performance lines.

## Build Stages

### Stage 0: Project And Plan Cleanup

Goal: make GitHub the source of truth.

- Add this staged build plan.
- Add README with current status and play instructions.
- Keep Obsidian as planning notes.
- Treat Downloads as archive only.
- Decide first public demo framing.

Ship when: the repo explains what Singlo is, what exists, and what comes next.

### Stage 1: Kids First Playable Loop

Goal: one delightful browser game using the current pitch engine.

- Keep one-page instant play.
- Add Kids 5-12 mode as the default test slice.
- Replace tool-like pitch trainer framing with a voice game.
- Build one mini game: sing to move, jump, glow, or score.
- Use forgiving pitch detection and clear visual feedback.
- Add an equalizer-style voice visualizer so the mic feels alive even before scoring is perfect.
- Award belt progress for completion and effort.
- Create a 30-60 second play session.

Ship when: a kid can tap mic, make sound, see the game react, finish one round, and earn progress.

### Stage 2: Pop Star Dojo Identity

Goal: make the product memorable.

- First screen: "Singlo Pop Star Dojo."
- Tagline: "An AI voice coach that turns singing practice into a game."
- First-pass language picker or clear path to language picker.
- Avatar or performer choice.
- Stage/dojo visual wrapper.
- Belt journey visible from the first play.
- Performance card after a run.

Ship when: a screenshot makes the concept clear without explanation.

### Stage 3: Singing Curriculum Games

Goal: map real singing fundamentals to mini games.

- Pitch matching game.
- Sustained note game.
- Breath control game.
- Simple scale game.
- Rhythm call-and-response game.
- First belt criteria based on real tasks.

Ship when: White to Yellow Belt requires several actual singing skills, not just time.

### Stage 4: Build-In-Public Feedback Loop

Goal: use X and TikTok to choose the next build.

- Post two first-page concepts and ask parents/players which one they would try.
- Post weekly 10-30 second demos.
- Ask one clear question per post.
- Keep a public changelog.
- Use comments to pick the next mini game.
- Track what people click, replay, and share.

Ship when: every weekly build ends with a public demo and one feedback question.

### Stage 5: Teens And Adults Tracks

Goal: reuse the same engine with different wrappers.

- Teens: challenges, pop songs, leaderboards, auditions, social proof.
- Adults: singing confidence, public speaking, spoken word, debate, performance practice.
- Language-specific content packs for songs, prompts, poetry, and spoken word.
- Keep guest play.
- Add optional identity only when needed for leaderboards.

Ship when: the same pitch engine supports at least one demo loop per age track.

### Stage 6: Multiplayer And Community

Goal: make Singlo feel alive.

- Lightweight rooms.
- Friendly score battles.
- Teen challenge prototype: Barrel Fire Harmony, a private up-to-4-player room where friends sing around a stylized barrel fire and take roles such as Lead, Low Harmony, High Harmony, and Echo.
- Audition events.
- Ghost performances or replay challenges.
- Leaderboards by belt and age track.
- Parent-safe controls for kids.

Ship when: two players can join the same event or compete asynchronously.

### Stage 7: Virtual Performance Spaces

Goal: grow from practice into performance.

- Unlock stage ladder.
- Add virtual audience reactions.
- Add movement tracking experiments if browser APIs support it well.
- Add show sets and audition formats.
- Add sponsored signs and stage ads carefully.

Ship when: a player can perform a short set in a virtual space and receive a score/card.

### Stage 8: Pro Track

Goal: make the long-term dream visible.

- Pro eligibility based on belt, hours, consistency, and performance wins.
- Virtual concert events.
- Yearly winners.
- Community celebration pages.
- Explore real-world prize partnerships only after traction.

Ship when: Singlo can run a meaningful virtual concert event.

## Monetization Principles

- No subscription wall for the basic game.
- No app store dependence.
- Keep the first play free.
- Consider in-world ads: signs, stage sponsors, branded billboards, venue banners.
- Consider cosmetics: avatars, stages, mic skins, performer outfits.
- Consider sponsored competitions or virtual events.
- Be careful with kids: ads and sponsorships must be parent-safe and age-appropriate.

## Safety And Privacy Principles

- The early kids demo should not require accounts.
- Avoid collecting child names, voice recordings, or personal data unless there is a clear privacy plan.
- Store only local progress at first.
- If leaderboards are added for kids, use anonymous display names or parent-controlled accounts.
- Do not market Singlo as therapy or promise speech outcomes.
- Position it as a singing and performance game.

## Immediate Next Decisions

1. What is the first kids mini game?
2. What should the first screen show: mic, avatar, song, stage, or belt?
3. What exact criteria move a player from White Belt to Yellow Belt?
4. What two landing-page concepts should be posted publicly?
5. What is the first 10-second TikTok/X demo?
6. What are the first three non-English languages to prototype?

## Current Code Baseline

The repo currently has:

- home UI in `web/index.html`
- pitch trainer in `web/pitch.html`
- belt journey in `web/badges.html`
- localStorage XP and belt progress
- Web Audio microphone pitch detection
- first-pass pitch trainer equalizer visual
- piano volume control for reference notes
- pitch trail canvas
- piano key visual feedback and tap-to-play notes

Next code work should convert the pitch trainer from a tool into the first Singlo Pop Star Dojo mini game.
