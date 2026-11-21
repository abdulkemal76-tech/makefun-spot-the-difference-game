// The screenshot scenes behind ?shot=start|play|end. Each one is a real
// game state — the same state a player reaches by playing — staged
// deterministically, so the same query always gives the same frame:
// the title screen, a mid-game frame with three differences already
// found and several still unfound, and a finished level.

import { LEVELS } from './scenes.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE } from './render.js';

/**
 * Put `state` into the named scene and leave it ready to paint.
 * foundAt values are far in the past, so the found rings are fully popped.
 */
export function stageShot(name, state) {
  const now = performance.now();
  if (name !== 'play' && name !== 'end') {
    state.screen = SCREEN_TITLE;
    state.best = 0;
    return;
  }
  const level = LEVELS[0];
  const found = new Set();
  const foundAt = {};
  if (name === 'play') {
    for (const diff of level.diffs.slice(0, 3)) {
      found.add(diff.id);
      foundAt[diff.id] = -10000;
    }
    state.screen = SCREEN_PLAY;
    state.levelIndex = 0;
    state.found = found;
    state.foundAt = foundAt;
    state.score = 300;
    state.levelScore = 300;
    state.timeLeft = 47;
    state.hintsLeft = 2;
    state.message = 'Found it — the sun turned pale gold! 4 to go.';
    state.messageTone = 'good';
    state.messageUntil = now + 60000;
    return;
  }
  for (const diff of level.diffs) {
    found.add(diff.id);
    foundAt[diff.id] = -10000;
  }
  state.screen = SCREEN_LEVEL_DONE;
  state.levelIndex = 0;
  state.found = found;
  state.foundAt = foundAt;
  state.score = 1020;
  state.levelScore = 1020;
  state.timeBonus = 320;
  state.timeLeft = 32;
  state.hintsLeft = 2;
  state.message = 'Level complete! Time bonus +320.';
  state.messageTone = 'good';
  state.messageUntil = now + 60000;
}
