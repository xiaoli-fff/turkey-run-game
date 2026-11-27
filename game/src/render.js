// Gobble & Go! — everything drawn behind and around the action: the
// autumn sunset, parallax farm, HUD, and the title / end screens.
import { CONFIG, COLOURS } from './config.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.scroll = 0;
  }

  drawBackground(dt, speed) {
    const ctx = this.ctx;
    this.scroll += speed * dt;
    const W = CONFIG.width, H = CONFIG.height;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, COLOURS.skyTop);
    sky.addColorStop(0.55, COLOURS.skyMid);
    sky.addColorStop(0.85, COLOURS.skyLow);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // Low autumn sun.
    const sun = ctx.createRadialGradient(1020, 190, 10, 1020, 190, 130);
    sun.addColorStop(0, 'rgba(255, 215, 110, 0.95)');
    sun.addColorStop(1, 'rgba(255, 150, 80, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(880, 50, 280, 280);
    ctx.fillStyle = COLOURS.sun;
    ctx.beginPath(); ctx.arc(1020, 190, 52, 0, Math.PI * 2); ctx.fill();
    // Clouds.
    ctx.fillStyle = 'rgba(255, 220, 200, 0.5)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 340 - this.scroll * 0.08) % 1400 + 1400) % 1400 - 60;
      const cy = 70 + i * 46;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 44, cy + 6, 52, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Far hills.
    ctx.fillStyle = COLOURS.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, 520);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 500 + Math.sin((x + this.scroll * 0.15) / 260) * 26);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // Near hill with a red barn and a bare tree.
    ctx.fillStyle = COLOURS.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, 560);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 548 + Math.sin((x + this.scroll * 0.3) / 300) * 18);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    this.drawBarn(ctx, ((880 - this.scroll * 0.3) % 1600 + 1600) % 1600 - 160, 470);
    this.drawTree(ctx, ((420 - this.scroll * 0.3) % 1600 + 1600) % 1600 - 160, 500);
    // Ground.
    ctx.fillStyle = COLOURS.ground;
    ctx.fillRect(0, CONFIG.groundY, W, H - CONFIG.groundY);
    ctx.fillStyle = COLOURS.grass;
    ctx.fillRect(0, CONFIG.groundY, W, 14);
    ctx.fillStyle = COLOURS.grassDark;
    for (let i = 0; i < 40; i++) {
      const gx = ((i * 97 - this.scroll) % 1400 + 1400) % 1400 - 60;
      ctx.fillRect(gx, CONFIG.groundY + 2, 3, 10);
    }
    // Fence posts whipping past.
    ctx.fillStyle = COLOURS.fence;
    for (let x = -((this.scroll * 1) % 160); x < W; x += 160) {
      ctx.fillRect(x, CONFIG.groundY - 44, 8, 44);
      ctx.fillRect(x + 8, CONFIG.groundY - 40, 152, 6);
      ctx.fillRect(x + 8, CONFIG.groundY - 24, 152, 6);
    }
  }

  drawBarn(ctx, x, y) {
    ctx.fillStyle = COLOURS.barn;
    ctx.fillRect(x, y, 150, 90);
    ctx.fillStyle = COLOURS.barnRoof;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 75, y - 52); ctx.lineTo(x + 160, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2e8d5';
    ctx.fillRect(x + 55, y + 34, 40, 56);
    ctx.strokeStyle = '#5e1f1f';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 55, y + 34, 40, 56);
    ctx.beginPath();
    ctx.moveTo(x + 55, y + 34); ctx.lineTo(x + 95, y + 90);
    ctx.moveTo(x + 95, y + 34); ctx.lineTo(x + 55, y + 90);
    ctx.stroke();
  }

  drawTree(ctx, x, y) {
    ctx.strokeStyle = '#4a3220';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, y + 60); ctx.lineTo(x, y); ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y + 10); ctx.lineTo(x - 34, y - 34); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 6); ctx.lineTo(x + 30, y - 44); ctx.stroke();
    ctx.fillStyle = '#c96a2e';
    ctx.beginPath(); ctx.arc(x - 34, y - 36, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 30, y - 46, 8, 0, Math.PI * 2); ctx.fill();
  }

  drawLeaves(ctx, leaves) {
    for (const l of leaves) {
      ctx.fillStyle = l.s > 1 ? '#e07b39' : '#d9a441';
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.x / 40);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7 * l.s, 4 * l.s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawParticles(ctx, particles) {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 1.6);
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- HUD ------------------------------------------------------------
  drawHud(ctx, state) {
    const W = CONFIG.width;
    ctx.save();
    // Top bar.
    ctx.fillStyle = 'rgba(20, 10, 26, 0.55)';
    ctx.fillRect(0, 0, W, 64);
    ctx.fillStyle = '#ffd76e';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${state.score}`, 20, 42);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${Math.floor(state.distance)} m / ${CONFIG.escapeDistance} m`, 300, 40);
    // Escape progress bar.
    const bx = 300, bw = 420, by = 50;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(bx, by, bw, 8);
    ctx.fillStyle = '#7fae4c';
    ctx.fillRect(bx, by, bw * Math.min(1, state.distance / CONFIG.escapeDistance), 8);
    ctx.fillStyle = '#ffd76e';
    ctx.beginPath(); ctx.arc(bx + bw * Math.min(1, state.distance / CONFIG.escapeDistance), by + 4, 7, 0, Math.PI * 2); ctx.fill();
    // Hearts.
    for (let i = 0; i < CONFIG.maxHearts; i++) {
      const hx = 790 + i * 40, hy = 32;
      ctx.fillStyle = i < state.hearts ? '#ff4d6d' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 8);
      ctx.bezierCurveTo(hx - 12, hy - 6, hx - 2, hy - 14, hx, hy - 4);
      ctx.bezierCurveTo(hx + 2, hy - 14, hx + 12, hy - 6, hx, hy + 8);
      ctx.fill();
    }
    // Farmer gap meter: how close the farmer is.
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FARMER', 940, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(940, 32, 150, 10);
    const gapFrac = Math.max(0, state.farmerGap / CONFIG.farmerGapMax);
    ctx.fillStyle = gapFrac > 0.5 ? '#7fae4c' : gapFrac > 0.25 ? '#ffb02e' : '#ff4d6d';
    ctx.fillRect(940, 32, 150 * gapFrac, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '15px sans-serif';
    ctx.fillText(state.featherTime > 0 ? 'GOLDEN FEATHER!' : `SPEED ${Math.round(state.speed / 10)}`, 1110, 40);
    ctx.restore();
  }

  drawTitle(ctx, best) {
    const ctx2 = ctx;
    ctx2.save();
    ctx2.fillStyle = 'rgba(20, 8, 26, 0.45)';
    ctx2.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx2.textAlign = 'center';
    ctx2.fillStyle = '#ffd76e';
    ctx2.font = 'bold 84px Georgia, serif';
    ctx2.fillText('GOBBLE & GO!', CONFIG.width / 2, 190);
    ctx2.fillStyle = '#fff';
    ctx2.font = 'italic bold 34px Georgia, serif';
    ctx2.fillText("A Turkey's Great Escape", CONFIG.width / 2, 240);
    ctx2.font = '20px sans-serif';
    ctx2.fillStyle = '#ffe9c9';
    ctx2.fillText('Thanksgiving is coming. The farmer is coming faster.', CONFIG.width / 2, 292);
    ctx2.fillText('Run 1,500 m to freedom — jump the fences, hay and ovens,', CONFIG.width / 2, 322);
    ctx2.fillText('slide under the flying carving knives, and grab the corn.', CONFIG.width / 2, 352);
    // Controls card.
    ctx2.fillStyle = 'rgba(0,0,0,0.45)';
    ctx2.fillRect(390, 390, 500, 110);
    ctx2.fillStyle = '#fff';
    ctx2.font = 'bold 21px sans-serif';
    ctx2.fillText('SPACE / CLICK — jump (twice for a double jump)', CONFIG.width / 2, 424);
    ctx2.fillText('DOWN ARROW / S — slide under knives', CONFIG.width / 2, 456);
    ctx2.fillText('M — mute   •   P — pause', CONFIG.width / 2, 484);
    ctx2.fillStyle = '#ffd76e';
    ctx2.font = 'bold 30px sans-serif';
    const pulse = 0.75 + Math.sin(Date.now() / 350) * 0.25;
    ctx2.globalAlpha = pulse;
    ctx2.fillText('PRESS SPACE OR CLICK TO START', CONFIG.width / 2, 570);
    ctx2.globalAlpha = 1;
    if (best > 0) {
      ctx2.fillStyle = '#fff';
      ctx2.font = 'bold 20px sans-serif';
      ctx2.fillText(`Best score: ${best}`, CONFIG.width / 2, 612);
    }
    ctx2.restore();
  }

  drawEnd(ctx, result) {
    ctx.save();
    ctx.fillStyle = result.won ? 'rgba(30, 60, 20, 0.55)' : 'rgba(40, 8, 12, 0.6)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = result.won ? '#b6ff7a' : '#ff6b6b';
    ctx.font = 'bold 76px Georgia, serif';
    ctx.fillText(result.won ? 'ESCAPED!' : 'CAUGHT!', CONFIG.width / 2, 210);
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillText(
      result.won
        ? 'You outran the farmer and Thanksgiving itself. Freedom tastes like corn!'
        : 'The farmer got you... Thanksgiving dinner is served. Gobble gobble — try again!',
      CONFIG.width / 2, 262,
    );
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffd76e';
    ctx.fillText(`SCORE  ${result.score}    •    DISTANCE  ${Math.floor(result.distance)} m    •    CORN  ${result.corn}`, CONFIG.width / 2, 340);
    ctx.fillStyle = '#fff';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Best score: ${result.best}`, CONFIG.width / 2, 382);
    ctx.fillStyle = '#ffd76e';
    ctx.font = 'bold 28px sans-serif';
    const pulse = 0.75 + Math.sin(Date.now() / 350) * 0.25;
    ctx.globalAlpha = pulse;
    ctx.fillText('PRESS SPACE OR CLICK TO RUN AGAIN', CONFIG.width / 2, 470);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawPaused(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CONFIG.width / 2, 360);
    ctx.font = '22px sans-serif';
    ctx.fillText('Press P to keep running', CONFIG.width / 2, 404);
    ctx.restore();
  }
}
