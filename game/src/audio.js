// Gobble & Go! — tiny WebAudio synth: no audio files, everything is
// generated with oscillators so the game stays fully offline.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  // Must be called from a user gesture at least once.
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 0.16, when = 0, slideTo = null) {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  jump() { this.tone(320, 0.16, 'square', 0.08, 0, 620); }
  doubleJump() { this.tone(420, 0.14, 'square', 0.08, 0, 840); }
  slide() { this.tone(180, 0.12, 'sawtooth', 0.05, 0, 90); }
  corn() { this.tone(660, 0.09, 'sine', 0.14); this.tone(990, 0.12, 'sine', 0.12, 0.07); }
  pumpkin() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.13, i * 0.07)); }
  feather() { [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.11, i * 0.05)); }
  hit() { this.tone(140, 0.25, 'sawtooth', 0.18, 0, 60); this.tone(70, 0.3, 'square', 0.12, 0.02, 40); }
  caught() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.14, i * 0.16)); }
  escaped() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.13, i * 0.11)); }
  click() { this.tone(520, 0.06, 'sine', 0.1); }

  // A lazy banjo-ish pluck loop: pentatonic walk, quiet, only while playing.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const notes = [262, 294, 330, 392, 440, 392, 330, 294];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const n = notes[this.musicStep % notes.length];
      this.tone(n, 0.22, 'triangle', 0.045);
      if (this.musicStep % 4 === 2) this.tone(n / 2, 0.3, 'sine', 0.04);
      this.musicStep++;
    }, 240);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
