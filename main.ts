// Meridia Spot the Difference — the hand-in program (Node 22, standard
// library only). The game itself is this directory's game/ folder: plain
// static files a desktop browser loads offline, no library and no network
// request. Three canvas-painted scenes of Meridia — Harbour at Dusk, Night
// Market, Lighthouse Library — with 7, 9 and 12 differences to find.
// This program copies game/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json, the summary the judge reads,
// with the vendored make.fun library.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a readable message when the game folder is missing,
// instead of a cryptic copy error halfway through the hand-in.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error(`game/index.html not found beside ${here}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files in game/ or
// 48 MiB of game files in all, or a path under game/ over 1000 bytes.
// Our entry is far inside every cap: 3 screenshots and 9 game files.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
