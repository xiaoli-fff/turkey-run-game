// Gobble & Go! — the farmer: the chaser who closes in whenever the turkey
// stumbles. He is drawn from canvas shapes, pitchfork and all.
import { CONFIG } from './config.js';

export class Farmer {
  constructor() {
    this.runPhase = 0;
    this.x = 60;
  }

  // gap: 0..120 — how far ahead of the farmer the turkey is.
  // Returns the farmer's screen x for the gap.
  xForGap(gap) {
    // Turkey sits at x=300; the farmer trails behind, close enough to see.
    return 300 - 130 - gap * 1.15;
  }

  update(dt, speed) {
    this.runPhase += dt * (7 + speed / 80);
  }

  draw(ctx, gap) {
    const x = this.xForGap(gap);
    if (x < -160) return; // still out of frame, far behind
    const y = CONFIG.groundY;
    const step = Math.sin(this.runPhase * 2);
    ctx.save();
    ctx.translate(x, y);
    // Legs.
    ctx.strokeStyle = '#3a3f5e';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -58); ctx.lineTo(-16 + step * 14, 0); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -58); ctx.lineTo(18 - step * 14, 0); ctx.stroke();
    // Overalls + shirt.
    ctx.fillStyle = '#c94f4f';
    ctx.fillRect(-20, -108, 40, 52);
    ctx.fillStyle = '#33507a';
    ctx.fillRect(-18, -72, 36, 18);
    ctx.fillStyle = '#c94f4f';
    ctx.fillRect(-18, -108, 8, 40);
    ctx.fillRect(10, -108, 8, 40);
    // Arms reaching forward, one gripping the pitchfork.
    ctx.strokeStyle = '#e8b04b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(14, -96); ctx.lineTo(44, -70); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -96); ctx.lineTo(30, -82); ctx.stroke();
    // Pitchfork.
    ctx.strokeStyle = '#8a8f9e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(44, -118); ctx.lineTo(58, -30); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, -118); ctx.lineTo(48, -140); ctx.stroke();
    ctx.moveTo(44, -118); ctx.lineTo(54, -142); ctx.stroke();
    ctx.moveTo(50, -118); ctx.lineTo(60, -138); ctx.stroke();
    // Head + straw hat + beard.
    ctx.fillStyle = '#e8b04b';
    ctx.beginPath();
    ctx.arc(0, -122, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath();
    ctx.ellipse(0, -110, 12, 8, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(0, -134, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, -152, 18, 16);
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(6, -124, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Angry shout.
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('COME BACK HERE!', 24, -158);
    ctx.restore();
  }
}
