// Boot and the game loop. The game moves between five screens — title,
// play, level done, time up and all done — and the loop paints the current
// one every frame while the clock runs only during play.
//
// ?shot=start|play|end (with &seed=N) stages that scene instead of running
// the game, paints it twice and sets window.__shotReady for a screenshot.
// ?time=N starts a level with N seconds on the clock, for testing the timer.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, LEVEL_SECONDS, POINTS_PER_FIND,
  HINT_COST, WRONG_CLICK_COST, TIME_BONUS_PER_SECOND, HINTS_PER_LEVEL,
  HINT_COOLDOWN_MS, HINT_SHOW_MS, BEST_KEY,
} from './config.js';
import { LEVELS } from './scenes.js';
import {
  draw, SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_DONE, SCREEN_TIME_UP,
  SCREEN_ALL_DONE,
} from './render.js';
import { createInput } from './input.js';
import { playFind, playMiss, playHint, playWin, playTick } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const timeParam = Number.parseInt(params.get('time') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : (Date.now() % 2147483647);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

/** Tiny seeded random, so a hint pick can be reproduced from ?seed=N. */
function mulberry32(a) {
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(seed);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts one visit.
  }
}

function freshState() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    foundAt: {},
    score: 0,
    best: readBest(),
    levelSeconds: Number.isInteger(timeParam) && timeParam > 0 ? timeParam : LEVEL_SECONDS,
    timeLeft: Number.isInteger(timeParam) && timeParam > 0 ? timeParam : LEVEL_SECONDS,
    hintsLeft: HINTS_PER_LEVEL,
    hint: null,
    hintReadyAt: 0,
    miss: null,
    message: '',
    messageUntil: 0,
    messageTone: '',
    levelScore: 0,
    timeBonus: 0,
    lastTickSecond: -1,
  };
}

const state = freshState();

function say(message, tone = '') {
  state.message = message;
  state.messageTone = tone;
  state.messageUntil = performance.now() + 4000;
  status.textContent = message;
}

function startLevel(index, keepScore) {
  const keep = keepScore ? state.score : 0;
  const best = state.best;
  const next = freshState();
  next.screen = SCREEN_PLAY;
  next.levelIndex = index;
  next.score = keep;
  next.best = best;
  Object.assign(state, next);
  say(`Level ${index + 1}: ${LEVELS[index].name} — ${LEVELS[index].diffs.length} differences to find.`);
}

function startGame() {
  startLevel(0, false);
}

function toLevelDone(now) {
  const bonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.timeBonus = bonus;
  state.levelScore += bonus;
  state.score += bonus;
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
  state.screen = SCREEN_LEVEL_DONE;
  playWin();
  say(`Level complete! Time bonus +${bonus}.`, 'good');
}

function toTimeUp() {
  state.screen = SCREEN_TIME_UP;
  say(`Time's up — ${state.found.size} of ${LEVELS[state.levelIndex].diffs.length} found.`, 'bad');
}

function useHint(now) {
  if (state.hintsLeft <= 0) {
    say('No hints left in this level.', 'bad');
    return;
  }
  if (now < state.hintReadyAt) {
    say('The hint is still recharging…', 'bad');
    return;
  }
  const level = LEVELS[state.levelIndex];
  const remaining = level.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(random() * remaining.length)];
  state.hint = { diffId: pick.id, until: now + HINT_SHOW_MS };
  state.hintReadyAt = now + HINT_COOLDOWN_MS;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_COST);
  playHint();
  say('A hint glimmers somewhere on the pictures…', 'good');
}

function onPanelClick(panel, x, y) {
  const now = performance.now();
  const level = LEVELS[state.levelIndex];
  let hit = null;
  let hitDist = Infinity;
  for (const diff of level.diffs) {
    if (state.found.has(diff.id)) continue;
    const dist = Math.hypot(diff.x - x, diff.y - y);
    if (dist <= diff.r + 6 && dist < hitDist) {
      hit = diff;
      hitDist = dist;
    }
  }
  if (hit) {
    state.found.add(hit.id);
    state.foundAt[hit.id] = now;
    state.score += POINTS_PER_FIND;
    state.levelScore += POINTS_PER_FIND;
    state.hint = null;
    playFind();
    if (state.found.size === level.diffs.length) {
      say(`Found it — ${hit.note}!`, 'good');
      toLevelDone(now);
    } else {
      const left = level.diffs.length - state.found.size;
      say(`Found it — ${hit.note}! ${left} to go.`, 'good');
    }
    return;
  }
  state.miss = { panel, x, y, until: now + 450 };
  state.score = Math.max(0, state.score - WRONG_CLICK_COST);
  playMiss();
  say('Not quite — look closer.', 'bad');
}

function onButton(id) {
  const now = performance.now();
  if (id === 'play') startGame();
  else if (id === 'hint') useHint(now);
  else if (id === 'restart') {
    if (state.screen === SCREEN_ALL_DONE) startGame();
    else startLevel(state.levelIndex, false);
  } else if (id === 'next') {
    if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1, true);
    else state.screen = SCREEN_ALL_DONE;
  } else if (id === 'again') startGame();
  else if (id === 'menu') {
    const best = state.best;
    Object.assign(state, freshState());
    state.best = best;
  }
}

createInput(canvas, {
  getScreen: () => state.screen,
  getState: () => state,
  onButton,
  onPanelClick,
});

// Exposed for automated play-testing only; the game never reads it.
window.__meridia = state;

function runShot(name) {
  stageShot(name, state);
  let painted = 0;
  function paint() {
    draw(ctx, state, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

if (shot) {
  runShot(shot);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      const whole = Math.ceil(state.timeLeft);
      if (whole <= 5 && whole > 0 && whole !== state.lastTickSecond) {
        state.lastTickSecond = whole;
        playTick();
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        toTimeUp();
      }
    }
    draw(ctx, state, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
