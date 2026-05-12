# Singlo

Singlo Pop Star Dojo is a browser-first AI voice coach that turns singing practice into a game.

The current prototype is a vanilla HTML/CSS/JavaScript browser app with:

- a home screen in `web/index.html`
- a kids first-play game in `web/kids.html`
- a real-time pitch trainer in `web/pitch.html`
- a belt progress screen in `web/badges.html`

## Direction

The project is moving toward a browser game inspired by the distribution model of `fly.pieter.com`: instant URL-based play, no app store, no required login for the first play, build in public, and lightweight monetization through optional upgrades or in-world sponsorships later.

The first target audience slice is Kids 5-12. The first playable goal is to turn the current pitch trainer into a fun voice-controlled mini game where sound, humming, and singing make something happen on screen and earn belt progress.

Longer term, Singlo should support multiple languages so the game can be played globally. The app should also lean into visual voice feedback, including equalizer-style effects, stage reactions, and other voice-driven visuals.

See [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) for the staged plan.
See [docs/KIDS_BUILD_BRIEF.md](docs/KIDS_BUILD_BRIEF.md) for the Kids 5-12 first build brief.
See [docs/KIDS_BELT_CRITERIA.md](docs/KIDS_BELT_CRITERIA.md) for the Kids 5-12 belt promotion rules.
See [docs/TECH_STACK.md](docs/TECH_STACK.md) for the lightweight build stack.

## Local Play

From the `web/` folder, run a local server:

```sh
python3 -m http.server 5177
```

Then open `http://localhost:5177/index.html`.

Microphone pitch detection requires browser mic permission and works best from `localhost`.
