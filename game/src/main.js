// Gobble & Go! — A Turkey's Great Escape.
// Main loop, game states, scoring and collisions. The turkey auto-runs
// toward freedom 1,500 m away while the farmer chases from behind.
import { CONFIG } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { World } from './world.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { Renderer } from './render.js';
import { parseShot, applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const sounds = new SoundBank();
const input = new Input(canvas);
const world = new World(1);
const turkey = new Turkey();
const farmer = new Farmer();
const renderer = new Renderer(ctx);

const game = {
  state: 'title', // title | playing | caught | escaped | paused
  prevState: 'title',
  score: 0,
  distance: 0,
  hearts: CONFIG.startHearts,
  farmerGap: CONFIG.farmerGapStart,
  corn: 0,
  combo: 0,
  speed: CONFIG.baseSpeed,
  best: 0,
  time: 0,
  result: null,

  loadBest() {
    try { this.best = Number(window.localStorage.getItem('gobble-go-best') || 0) || 0; } catch { this.best = 0; }
  },
  saveBest() {
    if (this.score > this.best) {
      this.best = Math.floor(this.score);
      try { window.localStorage.setItem('gobble-go-best', String(this.best)); } catch { /* offline-safe */ }
    }
  },
  announce(msg) { if (statusEl) statusEl.textContent = msg; },

  toTitle() {
    this.state = 'title';
    turkey.reset();
    world.reset(1);
    this.score = 0; this.distance = 0; this.corn = 0; this.combo = 0;
    this.hearts = CONFIG.startHearts;
    this.farmerGap = CONFIG.farmerGapStart;
    this.speed = CONFIG.baseSpeed;
    this.result = null;
    sounds.stopMusic();
    this.announce('Gobble and Go. Press Space to start.');
  },

  startRun(seed = 1) {
    world.reset(seed);
    turkey.reset();
    this.state = 'playing';
    this.score = 0; this.distance = 0; this.corn = 0; this.combo = 0;
    this.hearts = CONFIG.startHearts;
    this.farmerGap = CONFIG.farmerGapStart;
    this.speed = CONFIG.baseSpeed;
    this.result = null;
    sounds.unlock();
    sounds.startMusic();
    input.clear();
    this.announce('Run! Jump the fences and ovens, slide under the knives.');
  },

  endRun(won) {
    this.state = won ? 'escaped' : 'caught';
    this.saveBest();
    this.result = {
      won,
      score: Math.floor(this.score),
      distance: this.distance,
      corn: this.corn,
      best: this.best,
    };
    sounds.stopMusic();
    if (won) sounds.escaped(); else sounds.caught();
    this.announce(won ? `Escaped! Score ${this.result.score}.` : `Caught! Score ${this.result.score}. Press Space to run again.`);
  },

  hitObstacle(o) {
    if (turkey.invincible > 0 || turkey.featherTime > 0) return;
    this.hearts -= 1;
    this.combo = 0;
    this.farmerGap = Math.max(0, this.farmerGap - CONFIG.gapLossOnHit);
    turkey.invincible = CONFIG.invincibleAfterHit;
    world.burst(turkey.x, turkey.y - 40, '#ffcf5e', 16, 300);
    world.burst(turkey.x, turkey.y - 40, '#8a5a2b', 10, 200);
    sounds.hit();
    if (this.hearts <= 0 || this.farmerGap <= 0) this.endRun(false);
  },

  collectPickup(p) {
    p.taken = true;
    if (p.kind === 'corn') {
      this.corn += 1;
      this.combo += 1;
      this.score += CONFIG.scoreCorn + Math.min(50, this.combo * 5);
      this.farmerGap = Math.min(CONFIG.farmerGapMax, this.farmerGap + CONFIG.gapGainCorn);
      world.burst(p.x, p.y, '#ffd23e', 8, 140);
      sounds.corn();
    } else if (p.kind === 'pumpkin') {
      this.score += CONFIG.scorePumpkin;
      if (this.hearts < CONFIG.maxHearts) this.hearts += 1;
      this.farmerGap = Math.min(CONFIG.farmerGapMax, this.farmerGap + CONFIG.gapGainCorn);
      world.burst(p.x, p.y, '#ff7b2a', 12, 180);
      sounds.pumpkin();
    } else {
      this.score += CONFIG.scoreFeather;
      turkey.featherTime = CONFIG.featherTime;
      this.farmerGap = Math.min(CONFIG.farmerGapMax, this.farmerGap + CONFIG.gapGainFeather);
      world.burst(p.x, p.y, '#ffd76e', 16, 220);
      sounds.feather();
    }
  },

  // --- debug / screenshot helpers (used by shots.js only) -------------
  // A tiny auto-player so a screenshot fast-forward actually survives:
  // jump for ground obstacles, slide under thrown knives. It scans every
  // obstacle in range, not just the nearest, so a knife hiding behind a
  // fence still gets a slide instead of a jump into the blade.
  debugAutoPlay() {
    let knifeNear = false;
    let groundNear = false;
    let groundVeryNear = false;
    for (const o of world.obstacles) {
      const dist = o.x - turkey.x;
      if (dist < -60 || dist > 320) continue;
      if (o.kind === 'knife') {
        if (dist < 220) knifeNear = true;
      } else {
        if (dist < 260) groundNear = true;
        if (dist < 150) groundVeryNear = true;
      }
    }
    if (knifeNear && turkey.onGround) { turkey.slide(sounds); return; }
    if (groundNear && turkey.onGround) turkey.jump(sounds);
    else if (groundVeryNear && !turkey.onGround && turkey.jumps < 2) turkey.jump(sounds);
  },
  debugFastForward(targetMetres, seconds) {
    const steps = Math.round(seconds * 60);
    for (let i = 0; i < steps && this.distance < targetMetres && this.state === 'playing'; i++) {
      this.debugAutoPlay();
      this.update(1 / 60, true);
    }
  },
  debugCaught() {
    this.hearts = 0;
    this.endRun(false);
  },
  debugEscaped() {
    this.distance = CONFIG.escapeDistance;
    this.endRun(true);
  },

  // --- per-frame update ------------------------------------------------
  update(dt, silent = false) {
    this.time += dt;
    if (this.state !== 'playing') return;
    this.distance += (this.speed * dt) / CONFIG.pxPerMetre;
    this.score += CONFIG.scorePerMetre * (this.speed * dt) / CONFIG.pxPerMetre;
    this.speed = world.speedFor(this.distance);
    turkey.update(dt, this.speed);
    farmer.update(dt, this.speed);
    world.update(dt, this.speed, this.distance, true);
    if (turkey.onGround && Math.floor(this.time * 8) !== Math.floor((this.time - dt) * 8)) {
      world.dust(turkey.x - 20, CONFIG.groundY);
    }

    // Collisions with obstacles.
    for (const o of world.obstacles) {
      if (!o.passed && o.x + o.w < turkey.x - turkey.width / 2) {
        o.passed = true;
        this.score += 25; // cleared it!
      }
      if (world.hitsTurkey(turkey, o)) {
        this.hitObstacle(o);
        // Push the obstacle past so one hit cannot double-count.
        o.x = turkey.x - turkey.width;
        if (this.state !== 'playing') return;
      }
    }
    // Pickups.
    for (const p of world.pickups) {
      if (p.taken) continue;
      const dx = p.x - turkey.x;
      const dy = p.y - (turkey.y - turkey.height / 2);
      if (Math.abs(dx) < 52 && Math.abs(dy) < 56) this.collectPickup(p);
    }
    world.pickups = world.pickups.filter((p) => !p.taken);
    // The farmer slowly gains when the turkey dawdles at low speed... and
    // the turkey pulls away a little while sprinting with a feather.
    if (turkey.featherTime > 0) {
      this.farmerGap = Math.min(CONFIG.farmerGapMax, this.farmerGap + dt * 6);
    }
    if (this.distance >= CONFIG.escapeDistance) this.endRun(true);
  },

  // --- per-frame draw ---------------------------------------------------
  draw(dt) {
    const scrollSpeed = this.state === 'playing' ? this.speed : 26;
    renderer.drawBackground(dt, scrollSpeed);
    renderer.drawLeaves(ctx, world.leaves);
    // Farmer trails behind the turkey.
    if (this.state === 'playing' || this.state === 'paused') {
      farmer.draw(ctx, this.farmerGap);
    }
    for (const o of world.obstacles) world.drawObstacle(ctx, o, this.time);
    for (const p of world.pickups) world.drawPickup(ctx, p);
    renderer.drawParticles(ctx, world.particles);
    turkey.draw(ctx);
    if (this.state === 'playing' || this.state === 'paused') {
      renderer.drawHud(ctx, {
        score: Math.floor(this.score),
        distance: this.distance,
        hearts: this.hearts,
        farmerGap: this.farmerGap,
        featherTime: turkey.featherTime,
        speed: this.speed,
      });
    }
    if (this.state === 'title') renderer.drawTitle(ctx, this.best);
    if (this.state === 'caught' || this.state === 'escaped') renderer.drawEnd(ctx, this.result);
    if (this.state === 'paused') renderer.drawPaused(ctx);
  },
};

// Input wiring.
input.on('mute', () => {
  sounds.unlock();
  const muted = sounds.toggleMute();
  game.announce(muted ? 'Sound off.' : 'Sound on.');
});
input.on('pause', () => {
  if (game.state === 'playing') { game.prevState = 'playing'; game.state = 'paused'; sounds.stopMusic(); }
  else if (game.state === 'paused') { game.state = 'playing'; sounds.startMusic(); }
});

function handleAction() {
  sounds.unlock();
  if (game.state === 'title') { sounds.click(); game.startRun(Date.now() % 100000); }
  else if (game.state === 'caught' || game.state === 'escaped') { sounds.click(); game.startRun(Date.now() % 100000); }
}

// Main loop.
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (input.consumeAction()) handleAction();
  if (game.state === 'playing') {
    if (input.consumeJump()) turkey.jump(sounds);
    if (input.consumeSlide() || input.slideHeld) turkey.slide(sounds);
  } else {
    input.consumeJump();
    input.consumeSlide();
  }
  game.update(dt);
  game.draw(dt);
  requestAnimationFrame(frame);
}

// Boot.
game.loadBest();
game.toTitle();
// Debug/testing hook: lets automated checks read the live game state.
window.__game = game;
const shot = parseShot();
if (shot) {
  const ok = applyShot(game, shot.shot, shot.seed);
  if (ok) game.announce(`Screenshot shot: ${shot.shot}.`);
}
requestAnimationFrame(frame);
