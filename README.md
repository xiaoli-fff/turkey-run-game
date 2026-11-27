# Gobble & Go! — A Turkey's Great Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/xiaoli-fff/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/xiaoli-fff/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A complete, original turkey escape game for the make.fun bounty
`turkey-run-game-01`. It plays offline in a desktop browser from its own
static files — no network requests, no libraries, no build step.

## The game

Thanksgiving is coming and the farmer is coming faster. You are the turkey.
Sprint 1,500 metres across an autumn farm at sunset to freedom, while the
farmer chases you from behind with his pitchfork.

- **Jump** fences, hay bales, the glowing-hot oven and stabbed-in carving
  knives; **slide** under knives the farmer throws at your head.
- **Grab corn** (+100, pushes the farmer back), **pumpkin slices** (+250 and
  a heart back) and rare **golden feathers** (a shield + speed burst).
- Every stumble costs a heart and lets the farmer close in. Lose all three
  hearts — or let the gap close to zero — and you are caught: Thanksgiving
  dinner is served. Reach 1,500 m and you escape.
- Escalating speed and harder obstacle mixes the further you run; double
  jump, combos, dust, feathers, falling leaves, a parallax farm with a red
  barn, and a synthesized banjo-ish soundtrack (WebAudio, no audio files).

## Controls

- **Space / Arrow Up / W / Click** — jump (press again mid-air for a double jump)
- **Down Arrow / S** — slide under flying knives
- **Enter** — start / restart
- **M** — mute, **P** — pause

## Screens

Title screen, gameplay with HUD (score, distance to freedom, hearts,
farmer-gap meter, speed), and end screens for both outcomes — caught or
escaped — each with a restart and a persistent best score.

## Layout

- `main.ts` — the entrypoint: copies `game/` + `screenshots/` to `/output`
  and writes `/output/dossier.json` via `vendor/makefun-game.ts`.
- `game/index.html` + `game/src/*.js` — the game (config, audio, input,
  world/spawning, turkey, farmer, renderer, shots, main loop).
- `screenshots/` — real renders of the game's own code, taken in headless
  Chrome via `?shot=start|play|end` (see `shots.json`).
- `serve.ts` — tiny static server for local play-testing (`node serve.ts`,
  then open http://localhost:8080).

## Play it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```
