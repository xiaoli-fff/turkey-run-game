// Gobble & Go! — keyboard + mouse input. The game reads a small queue of
// intents so the main loop never touches DOM events directly.
export class Input {
  constructor(canvas) {
    this.jumpQueued = false;
    this.slideQueued = false;
    this.actionQueued = false; // start / restart / confirm
    this.slideHeld = false;
    this.handlers = {};
    this._keys = new Set();

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key;
      if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') {
        e.preventDefault();
        this.jumpQueued = true;
        this.actionQueued = true;
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        e.preventDefault();
        this.slideQueued = true;
        this.slideHeld = true;
      } else if (k === 'Enter') {
        this.actionQueued = true;
      } else if (k === 'm' || k === 'M') {
        this.handlers.mute?.();
      } else if (k === 'p' || k === 'P') {
        this.handlers.pause?.();
      }
      this._keys.add(k);
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.slideHeld = false;
      this._keys.delete(e.key);
    });
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.jumpQueued = true;
      this.actionQueued = true;
      this.handlers.pointer?.(e);
    });
    // Keep the canvas focused so Space never scrolls the page.
    canvas.addEventListener('click', () => canvas.focus());
  }

  on(name, fn) { this.handlers[name] = fn; }

  consumeJump() { const j = this.jumpQueued; this.jumpQueued = false; return j; }
  consumeSlide() { const s = this.slideQueued; this.slideQueued = false; return s; }
  consumeAction() { const a = this.actionQueued; this.actionQueued = false; return a; }
  clear() { this.jumpQueued = false; this.slideQueued = false; this.actionQueued = false; }
}
