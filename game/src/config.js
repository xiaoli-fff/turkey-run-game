// Gobble & Go! — central tuning for the turkey escape runner.
// Every number that shapes difficulty lives here so the game can be
// balanced in one place.
export const CONFIG = {
  width: 1280,
  height: 720,
  groundY: 600,
  gravity: 2600,
  jumpVelocity: -980,
  doubleJumpVelocity: -880,
  slideTime: 0.55,
  baseSpeed: 340,
  maxSpeed: 740,
  speedPerMetre: 0.28,
  pxPerMetre: 50,
  escapeDistance: 1500,
  startHearts: 3,
  maxHearts: 3,
  farmerGapStart: 100,
  farmerGapMax: 120,
  gapLossOnHit: 24,
  gapGainCorn: 9,
  gapGainFeather: 16,
  invincibleAfterHit: 1.6,
  featherTime: 4,
  spawnGapMin: 430,
  spawnGapMax: 700,
  scorePerMetre: 2,
  scoreCorn: 100,
  scorePumpkin: 250,
  scoreFeather: 150,
};

export const COLOURS = {
  skyTop: '#2b1b4d',
  skyMid: '#b83a5e',
  skyLow: '#ff9a4d',
  sun: '#ffd76e',
  hillFar: '#5d3a6e',
  hillNear: '#7a4a52',
  ground: '#6b4a2f',
  grass: '#7fae4c',
  grassDark: '#5d8a38',
  barn: '#8e2f2f',
  barnRoof: '#5e1f1f',
  fence: '#8a6a45',
};

// Deterministic RNG (mulberry32) so screenshot shots are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
