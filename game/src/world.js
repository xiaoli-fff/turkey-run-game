// Gobble & Go! — the world: obstacle + pickup spawning, collisions,
// particles, and the scrolling farm scenery data.
import { CONFIG, makeRng } from './config.js';

export const OBSTACLE_KINDS = {
  fence: { w: 46, h: 52, score: 0 },
  hay: { w: 84, h: 56, score: 0 },
  oven: { w: 74, h: 118, score: 0 },
  blade: { w: 40, h: 96, score: 0 },
  knife: { w: 120, h: 34, score: 0, flies: true }, // thrown knife: slide under it
};

export class World {
  constructor(seed = 1) {
    this.rng = makeRng(seed);
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.leaves = [];
    this.distancePx = 0;
    for (let i = 0; i < 26; i++) {
      this.leaves.push({ x: this.rng() * 1280, y: this.rng() * 420, s: 0.5 + this.rng(), drift: 20 + this.rng() * 40 });
    }
  }

  reset(seed = 1) {
    this.rng = makeRng(seed);
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.distancePx = 0;
  }

  speedFor(distanceM) {
    return Math.min(CONFIG.maxSpeed, CONFIG.baseSpeed + distanceM * CONFIG.speedPerMetre * CONFIG.pxPerMetre / 10);
  }

  // Place one obstacle at screen x, with a pickup trailing it.
  // Returns the obstacle's width so the caller can space the next one.
  spawnAt(x, distanceM) {
    // Difficulty ramps: ovens and thrown knives only appear further in.
    const pool = ['fence', 'fence', 'hay', 'hay', 'blade'];
    if (distanceM > 150) pool.push('oven', 'blade');
    if (distanceM > 350) pool.push('knife', 'oven');
    if (distanceM > 600) pool.push('knife', 'oven', 'blade');
    const kind = pool[Math.floor(this.rng() * pool.length)];
    const def = OBSTACLE_KINDS[kind];
    const y = kind === 'knife' ? CONFIG.groundY - 56 : CONFIG.groundY;
    this.obstacles.push({ kind, x, y, w: def.w, h: def.h, passed: false, wobble: this.rng() * Math.PI * 2 });
    // Often trail a pickup after an obstacle, sometimes above it.
    const roll = this.rng();
    if (roll < 0.55) {
      const pKind = this.rng() < 0.72 ? 'corn' : (this.rng() < 0.6 ? 'pumpkin' : 'feather');
      const py = kind === 'oven' || kind === 'blade' ? CONFIG.groundY - 190 : CONFIG.groundY - 90 - this.rng() * 90;
      this.pickups.push({ kind: pKind, x: x + def.w + 90 + this.rng() * 120, y: py, taken: false, bob: this.rng() * 6 });
    } else if (roll < 0.8) {
      // A little corn trail on the ground.
      for (let i = 0; i < 3; i++) {
        this.pickups.push({ kind: 'corn', x: x + def.w + 70 + i * 56, y: CONFIG.groundY - 46, taken: false, bob: i });
      }
    }
    return def.w;
  }

  // Keep obstacles coming: whenever the rightmost one is close enough to
  // the right edge, append more ahead of it.
  ensureSpawns(distanceM) {
    let right = 1280;
    for (const o of this.obstacles) right = Math.max(right, o.x + o.w);
    while (right < 1780) {
      const gap = CONFIG.spawnGapMin + this.rng() * (CONFIG.spawnGapMax - CONFIG.spawnGapMin);
      right += gap;
      right += this.spawnAt(right, distanceM);
    }
  }

  update(dt, speed, distanceM, running) {
    this.distancePx += speed * dt;
    if (running) this.ensureSpawns(distanceM);
    const move = speed * dt;
    for (const o of this.obstacles) o.x -= move;
    for (const p of this.pickups) { p.x -= move; p.bob += dt * 3; }
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -80);
    this.pickups = this.pickups.filter((p) => p.x > -60);
    for (const l of this.leaves) {
      l.x -= (30 + l.drift) * dt;
      l.y += Math.sin(l.x / 90) * 12 * dt + 8 * dt;
      if (l.x < -20) { l.x = 1300; l.y = this.rng() * 380; }
      if (l.y > 430) l.y = 0;
    }
    for (const pt of this.particles) {
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 900 * dt; pt.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  burst(x, y, colour, n = 14, power = 260) {
    for (let i = 0; i < n; i++) {
      const a = this.rng() * Math.PI * 2;
      const v = power * (0.4 + this.rng() * 0.8);
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.5 + this.rng() * 0.5, colour, size: 3 + this.rng() * 5 });
    }
  }

  dust(x, y) {
    this.particles.push({ x, y: y - 4, vx: -40 - this.rng() * 60, vy: -30 - this.rng() * 40, life: 0.4, colour: '#c9a06a', size: 4 });
  }

  // AABB overlap between the turkey and an obstacle.
  hitsTurkey(turkey, o) {
    const tx = turkey.x - turkey.width / 2;
    const ty = turkey.y - turkey.height;
    const ox = o.x;
    const oy = o.y - o.h;
    // Shave the boxes a little so near-misses feel fair.
    return tx + 10 < ox + o.w - 6 && tx + turkey.width - 10 > ox + 6 &&
      ty + 8 < oy + o.h && ty + turkey.height > oy + 10;
  }

  // --- drawing -------------------------------------------------------
  drawObstacle(ctx, o, t) {
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.kind === 'fence') {
      ctx.fillStyle = '#8a6a45';
      ctx.fillRect(0, -52, 8, 52); ctx.fillRect(38, -52, 8, 52);
      ctx.fillRect(-4, -46, 54, 8); ctx.fillRect(-4, -28, 54, 8);
      ctx.fillStyle = '#a5825a';
      ctx.fillRect(-4, -46, 54, 3);
    } else if (o.kind === 'hay') {
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.ellipse(42, -28, 42, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a87c22';
      ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(42, -28, 30 + Math.abs(i) * 4, 18 + Math.abs(i) * 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (o.kind === 'oven') {
      // The dreaded oven, glowing hot and waiting.
      ctx.fillStyle = '#3a3f4a';
      ctx.fillRect(0, -118, 74, 118);
      ctx.fillStyle = '#ff5a2a';
      ctx.fillRect(6, -112, 62, 10);
      ctx.fillStyle = '#1c1c22';
      ctx.beginPath();
      ctx.arc(37, -58, 24, 0, Math.PI * 2);
      ctx.fill();
      const flick = 0.7 + Math.sin(t * 9 + o.wobble) * 0.3;
      ctx.fillStyle = `rgba(255, ${Math.floor(120 + 80 * flick)}, 40, ${0.75 * flick})`;
      ctx.beginPath();
      ctx.moveTo(22, -44); ctx.lineTo(37, -76); ctx.lineTo(52, -44);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a8f9e';
      ctx.fillRect(14, -14, 46, 6);
      ctx.fillStyle = '#ffd76e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('HOT!', 22, -96);
    } else if (o.kind === 'blade') {
      // A giant carving knife stabbed into the ground.
      ctx.save();
      ctx.translate(20, -48);
      ctx.rotate(0.5 + Math.sin(t * 2 + o.wobble) * 0.04);
      ctx.fillStyle = '#cfd6e4';
      ctx.beginPath();
      ctx.moveTo(-8, -52); ctx.lineTo(10, -52); ctx.lineTo(14, 34); ctx.lineTo(-14, 44); ctx.lineTo(-12, 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a8f9e';
      ctx.fillRect(-12, -52, 26, 8);
      ctx.fillStyle = '#5e3a1a';
      ctx.fillRect(-8, -78, 18, 28);
      ctx.restore();
    } else if (o.kind === 'knife') {
      // A knife thrown spinning through the air — slide under it!
      const spin = t * 10 + o.wobble;
      ctx.save();
      ctx.translate(60, -o.h / 2);
      ctx.rotate(spin);
      ctx.fillStyle = '#cfd6e4';
      ctx.beginPath();
      ctx.moveTo(-46, -8); ctx.lineTo(34, -8); ctx.lineTo(52, 0); ctx.lineTo(34, 8); ctx.lineTo(-46, 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5e3a1a';
      ctx.fillRect(-60, -8, 18, 16);
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(60, 56, 46, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPickup(ctx, p) {
    const bobY = Math.sin(p.bob) * 5;
    ctx.save();
    ctx.translate(p.x, p.y + bobY);
    if (p.kind === 'corn') {
      ctx.fillStyle = '#ffd23e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 20, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * 6 - 4, -14); ctx.lineTo(i * 6 - 2, 14); ctx.stroke();
      }
      ctx.fillStyle = '#5d8a38';
      ctx.beginPath();
      ctx.ellipse(-8, 12, 8, 5, -0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'pumpkin') {
      ctx.fillStyle = '#ff7b2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d95d12';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, 10, 16, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#5d8a38';
      ctx.fillRect(-2, -22, 4, 8);
    } else {
      // Golden feather: rare, grants a shield + speed.
      ctx.shadowColor = '#ffd76e'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 22, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.ellipse(2, -8, 4, 12, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
