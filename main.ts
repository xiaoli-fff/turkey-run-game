// Gobble & Go! — A Turkey's Great Escape (turkey-run-game-01).
//
// The entrypoint for this make.fun entry (Node 22, standard library only).
// The game itself is plain static files under game/ — a desktop browser
// loads game/index.html offline and plays with keyboard and mouse — and
// this program hands it in: it copies game/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Copy the deliverables into the output dir, then write the dossier the
// judge reads from exactly those files.
function handIn(sourceDir, outDir) {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(sourceDir, 'game'), join(outDir, 'game'), { recursive: true });
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(join(sourceDir, 'screenshots'))) {
    cpSync(join(sourceDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  }
  writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_CAPS));
}

handIn(here, out);
