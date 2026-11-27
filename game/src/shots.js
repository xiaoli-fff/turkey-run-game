// Gobble & Go! — screenshot shots: ?shot=start|play|end|escape (&seed=N)
// jumps the game straight into a fixed, deterministic state so the
// screenshots are real renders of the game's own code.
import { CONFIG } from './config.js';

export function parseShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || '1') || 1;
  return { shot, seed };
}

// Put a fresh game into the requested shot state. Returns true when a
// shot was applied.
export function applyShot(game, name, seed) {
  if (name === 'start') {
    game.toTitle();
    return true;
  }
  if (name === 'play') {
    game.startRun(seed);
    // Fast-forward the run so the frame is busy: mid-run, obstacles near.
    // Different seeds land at different distances for varied shots.
    game.debugFastForward(260 + ((seed * 137) % 300), 70);
    return true;
  }
  if (name === 'end') {
    game.startRun(seed);
    game.debugFastForward(260, 6);
    game.debugCaught();
    return true;
  }
  if (name === 'escape') {
    game.startRun(seed);
    // The auto-player must genuinely survive the whole 1,500 m: if it
    // gets caught, this shot shows CAUGHT instead — an honest failure.
    game.debugFastForward(1500, 240);
    return true;
  }
  return false;
}

export { CONFIG };
