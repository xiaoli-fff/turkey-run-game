// Gobble & Go! — the turkey: physics, animation and all of its drawing.
// The turkey is drawn from canvas shapes only (no image assets).
import { CONFIG } from './config.js';

export class Turkey {
  constructor() {
    this.x = 300;
    this.y = CONFIG.groundY;
    this.vy = 0;
    this.jumps = 0;
    this.sliding = false;
    this.slideLeft = 0;
    this.runPhase = 0;
    this.invincible = 0;
    this.featherTime = 0;
    this.dead = false;
  }

  get width() { return this.sliding ? 92 : 62; }
  get height() { return this.sliding ? 46 : 86; }
  get onGround() { return this.y >= CONFIG.groundY; }

  reset() {
    this.y = CONFIG.groundY;
    this.vy = 0; this.jumps = 0; this.sliding = false;
    this.slideLeft = 0; this.invincible = 0; this.featherTime = 0; this.dead = false;
  }

  jump(sounds) {
    if (this.dead) return false;
    if (this.onGround) {
      this.vy = CONFIG.jumpVelocity;
      this.jumps = 1;
      this.sliding = false;
      sounds.jump();
      return true;
    }
    if (this.jumps < 2) {
      this.vy = CONFIG.doubleJumpVelocity;
      this.jumps = 2;
      sounds.doubleJump();
      return true;
    }
    return false;
  }

  slide(sounds) {
    if (this.dead || !this.onGround || this.sliding) return false;
    this.sliding = true;
    this.slideLeft = CONFIG.slideTime;
    sounds.slide();
    return true;
  }

  update(dt, speed) {
    if (this.dead) return;
    this.runPhase += dt * (6 + speed / 90);
    this.vy += CONFIG.gravity * dt;
    this.y += this.vy * dt;
    if (this.y >= CONFIG.groundY) { this.y = CONFIG.groundY; this.vy = 0; this.jumps = 0; }
    if (this.sliding) {
      this.slideLeft -= dt;
      if (this.slideLeft <= 0) this.sliding = false;
    }
    if (this.invincible > 0) this.invincible -= dt;
    if (this.featherTime > 0) this.featherTime -= dt;
  }

  draw(ctx) {
    if (this.dead) return;
    // Blink while invincible after a hit.
    if (this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 0) return;
    const bob = this.onGround ? Math.sin(this.runPhase * 2) * 3 : 0;
    const top = this.y - this.height + bob;
    ctx.save();
    ctx.translate(this.x, top);
    if (this.featherTime > 0) {
      ctx.shadowColor = '#ffd76e'; ctx.shadowBlur = 22;
    }

    // Tail feathers, fanned.
    ctx.fillStyle = '#7a4a21';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(4, 26);
      ctx.rotate(i * 0.42 - 0.5);
      ctx.beginPath();
      ctx.ellipse(-16, -26, 9, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c98a3d';
      ctx.beginPath();
      ctx.ellipse(-16, -40, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a4a21';
      ctx.restore();
    }
    // Body.
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(6, 46, 34, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a9743c';
    ctx.beginPath();
    ctx.ellipse(12, 52, 24, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wing, flapping with the run.
    const flap = Math.sin(this.runPhase * 2) * 0.5;
    ctx.save();
    ctx.translate(4, 42);
    ctx.rotate(-0.3 + flap * 0.4);
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.ellipse(-6, 4, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Neck + head.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(28, 2, 14, 30);
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath();
    ctx.arc(36, 2, 15, 0, Math.PI * 2);
    ctx.fill();
    // Beak, wattle, eye.
    ctx.fillStyle = '#e07b39';
    ctx.beginPath();
    ctx.moveTo(48, -2); ctx.lineTo(62, 3); ctx.lineTo(48, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d23b3b';
    ctx.beginPath();
    ctx.ellipse(44, 12, 4, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(40, -2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(41, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Legs, running.
    const step = Math.sin(this.runPhase * 2);
    ctx.strokeStyle = '#e07b39';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 76); ctx.lineTo(-8 + step * 10, 88); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, 76); ctx.lineTo(22 - step * 10, 88); ctx.stroke();
    ctx.restore();
  }
}
