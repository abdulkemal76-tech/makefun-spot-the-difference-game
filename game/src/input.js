// Mouse, touch and keyboard, translated into game actions. The canvas is
// scaled by CSS to fit the window, so a pointer position is first mapped
// back into the game's own 1280 x 800 space, then checked against the
// buttons of the current screen and against the two picture panels.

import { CANVAS_WIDTH, CANVAS_HEIGHT, PANEL_WIDTH, PANEL_HEIGHT, PANEL_Y, LEFT_PANEL_X, RIGHT_PANEL_X } from './config.js';
import { buttonsFor } from './render.js';

/** Canvas coordinates of a pointer event, in the game's own space. */
function toCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

/** Which panel, if any, a canvas point is on; with scene coordinates. */
function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_HEIGHT) return null;
  if (x >= LEFT_PANEL_X && x <= LEFT_PANEL_X + PANEL_WIDTH) {
    return { panel: 'left', x: x - LEFT_PANEL_X, y: y - PANEL_Y };
  }
  if (x >= RIGHT_PANEL_X && x <= RIGHT_PANEL_X + PANEL_WIDTH) {
    return { panel: 'right', x: x - RIGHT_PANEL_X, y: y - PANEL_Y };
  }
  return null;
}

/**
 * Wire the canvas and the keyboard to the game. `handlers` names what each
 * gesture does; `getScreen` and `getState` are read live, so the wiring
 * never goes stale when the screen changes.
 */
export function createInput(canvas, handlers) {
  function clickAt(x, y) {
    const screen = handlers.getScreen();
    const state = handlers.getState();
    const buttons = buttonsFor(screen, state);
    for (const b of buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        handlers.onButton(b.id);
        return;
      }
    }
    if (screen !== 'play') return;
    const hit = panelAt(x, y);
    if (hit) handlers.onPanelClick(hit.panel, hit.x, hit.y);
  }

  canvas.addEventListener('pointerdown', (event) => {
    const p = toCanvas(canvas, event);
    clickAt(p.x, p.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const screen = handlers.getScreen();
    if (key === 'enter' && (screen === 'title' || screen === 'levelDone')) {
      handlers.onButton(screen === 'title' ? 'play' : 'next');
    } else if (key === 'h' && screen === 'play') {
      handlers.onButton('hint');
    } else if (key === 'r') {
      handlers.onButton('restart');
    } else if (key === 'n' && screen === 'levelDone') {
      handlers.onButton('next');
    } else if (key === 't' && (screen === 'timeUp' || screen === 'allDone')) {
      handlers.onButton('menu');
    }
  });
}
