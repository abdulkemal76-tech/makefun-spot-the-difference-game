// Everything the player sees: the title screen, the two picture panels with
// their markers, the HUD with its timer bar, and the end-of-level screens.
// Drawing only reads the state; it never changes it.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, PANEL_WIDTH, PANEL_HEIGHT, PANEL_Y,
  LEFT_PANEL_X, RIGHT_PANEL_X, HUD_HEIGHT, FOOTER_Y, RING_POP_MS,
  MISS_SHOW_MS, HINT_SHOW_MS,
} from './config.js';
import { LEVELS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_DONE = 'levelDone';
export const SCREEN_TIME_UP = 'timeUp';
export const SCREEN_ALL_DONE = 'allDone';

const NAVY = '#0e1420';
const PANEL_BG = '#101826';
const GOLD = '#f5c542';
const GOLD_DARK = '#c89a2e';
const INK = '#f2ead8';
const MUTED = '#9aa7bd';
const GREEN = '#7fd9a8';
const RED = '#ff6a5a';
const AMBER = '#ffb347';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Buttons for a screen, in canvas coordinates. input.js uses these. */
export function buttonsFor(screen, state) {
  const list = [];
  if (screen === SCREEN_TITLE) {
    list.push({ id: 'play', x: CANVAS_WIDTH / 2 - 110, y: 560, w: 220, h: 56, label: 'PLAY  —  Enter' });
  }
  if (screen === SCREEN_PLAY) {
    list.push({ id: 'hint', x: 24, y: 656, w: 200, h: 48, label: `HINT (H) · ${state.hintsLeft} left` });
    list.push({ id: 'restart', x: 244, y: 656, w: 200, h: 48, label: 'RESTART (R)' });
  }
  if (screen === SCREEN_LEVEL_DONE) {
    list.push({ id: 'next', x: CANVAS_WIDTH / 2 - 110, y: 520, w: 220, h: 56, label: 'NEXT LEVEL  —  N' });
  }
  if (screen === SCREEN_TIME_UP || screen === SCREEN_ALL_DONE) {
    list.push({ id: 'again', x: CANVAS_WIDTH / 2 - 110, y: 540, w: 220, h: 56, label: 'PLAY AGAIN  —  R' });
    list.push({ id: 'menu', x: CANVAS_WIDTH / 2 - 110, y: 612, w: 220, h: 44, label: 'TITLE SCREEN  —  T' });
  }
  return list;
}

function drawButton(ctx, b, now) {
  const hover = b.hover ? 1 : 0;
  ctx.fillStyle = b.primary ? GOLD : '#1d2a3a';
  rr(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = b.primary ? GOLD_DARK : '#3a4a63';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (hover) {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    rr(ctx, b.x, b.y, b.w, b.h, 10);
    ctx.fill();
  }
  text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 7, 'bold 17px system-ui, sans-serif', b.primary ? '#231a05' : INK, 'center');
}

function drawPanelFrame(ctx, x, caption) {
  ctx.fillStyle = PANEL_BG;
  ctx.fillRect(x - 6, PANEL_Y - 6, PANEL_WIDTH + 12, PANEL_HEIGHT + 12);
  ctx.strokeStyle = '#3a4a63';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, PANEL_Y - 6, PANEL_WIDTH + 12, PANEL_HEIGHT + 12);
  text(ctx, caption, x + PANEL_WIDTH / 2, PANEL_Y - 14, 'bold 13px system-ui, sans-serif', MUTED, 'center');
}

function drawRing(ctx, x, y, r, progress) {
  const scale = 1.35 - 0.35 * Math.min(1, progress);
  const alpha = 0.55 + 0.45 * Math.min(1, progress);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, (r - 5) * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, r, now) {
  const pulse = 0.5 + 0.5 * Math.sin(now / 160);
  ctx.save();
  ctx.globalAlpha = 0.45 + 0.4 * pulse;
  ctx.strokeStyle = GOLD;
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r + 6 + 4 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMiss(ctx, x, y, remain) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, remain);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  const s = 11;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, state) {
  const level = LEVELS[state.levelIndex];
  ctx.fillStyle = '#141d2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, HUD_HEIGHT - 3, CANVAS_WIDTH, 3);
  text(ctx, 'MERIDIA', 24, 30, 'bold 24px Georgia, serif', GOLD);
  text(ctx, 'SPOT THE DIFFERENCE', 24, 52, '12px system-ui, sans-serif', MUTED);
  text(ctx, `LEVEL ${state.levelIndex + 1} / ${LEVELS.length} — ${level.name}`, 330, 30, 'bold 19px system-ui, sans-serif', INK);
  text(ctx, level.tagline, 330, 52, '13px system-ui, sans-serif', MUTED);
  // Found counter: dots plus a number.
  const total = level.diffs.length;
  const found = state.found.size;
  text(ctx, `FOUND ${found} / ${total}`, 660, 30, 'bold 19px system-ui, sans-serif', found === total ? GREEN : INK);
  for (let i = 0; i < total; i += 1) {
    ctx.fillStyle = i < found ? GOLD : '#2c3a52';
    ctx.beginPath();
    ctx.arc(668 + i * 18, 48, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Timer bar.
  const frac = Math.max(0, state.timeLeft / state.levelSeconds);
  const timerColor = frac > 0.5 ? GREEN : frac > 0.25 ? AMBER : RED;
  text(ctx, formatTime(state.timeLeft), 1060, 30, 'bold 22px system-ui, sans-serif', timerColor, 'right');
  ctx.fillStyle = '#2c3a52';
  rr(ctx, 900, 40, 150, 10, 5);
  ctx.fill();
  ctx.fillStyle = timerColor;
  if (frac > 0) {
    rr(ctx, 900, 40, Math.max(10, 150 * frac), 10, 5);
    ctx.fill();
  }
  text(ctx, `SCORE ${state.score}`, 1240, 52, 'bold 16px system-ui, sans-serif', INK, 'right');
  text(ctx, `BEST ${state.best}`, 1240, 30, '13px system-ui, sans-serif', MUTED, 'right');
}

function drawPanels(ctx, state, now) {
  const level = LEVELS[state.levelIndex];
  drawPanelFrame(ctx, LEFT_PANEL_X, 'PICTURE A');
  drawPanelFrame(ctx, RIGHT_PANEL_X, 'PICTURE B');
  ctx.save();
  ctx.beginPath();
  ctx.rect(LEFT_PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.clip();
  ctx.translate(LEFT_PANEL_X, PANEL_Y);
  level.paint(ctx, PANEL_WIDTH, PANEL_HEIGHT, new Set());
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(RIGHT_PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.clip();
  ctx.translate(RIGHT_PANEL_X, PANEL_Y);
  const applied = new Set(level.diffs.map((d) => d.id));
  level.paint(ctx, PANEL_WIDTH, PANEL_HEIGHT, applied);
  ctx.restore();
  // Found rings on both panels, popping in.
  for (const diff of level.diffs) {
    if (!state.found.has(diff.id)) continue;
    const at = state.foundAt[diff.id] ?? 0;
    const progress = Math.min(1, (now - at) / RING_POP_MS);
    drawRing(ctx, LEFT_PANEL_X + diff.x, PANEL_Y + diff.y, diff.r, progress);
    drawRing(ctx, RIGHT_PANEL_X + diff.x, PANEL_Y + diff.y, diff.r, progress);
  }
  // A hint pulses around one unfound difference on both panels.
  if (state.hint && now < state.hint.until) {
    const diff = level.diffs.find((d) => d.id === state.hint.diffId);
    if (diff) {
      drawHintPulse(ctx, LEFT_PANEL_X + diff.x, PANEL_Y + diff.y, diff.r, now);
      drawHintPulse(ctx, RIGHT_PANEL_X + diff.x, PANEL_Y + diff.y, diff.r, now);
    }
  }
  // A wrong click leaves a fading cross where it landed.
  if (state.miss && now < state.miss.until) {
    const remain = (state.miss.until - now) / MISS_SHOW_MS;
    const baseX = state.miss.panel === 'left' ? LEFT_PANEL_X : RIGHT_PANEL_X;
    drawMiss(ctx, baseX + state.miss.x, PANEL_Y + state.miss.y, remain);
  }
}

function drawFooter(ctx, state, now) {
  const buttons = buttonsFor(SCREEN_PLAY, state).filter((b) => b.id === 'hint' || b.id === 'restart');
  ctx.fillStyle = '#141d2e';
  ctx.fillRect(0, FOOTER_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FOOTER_Y);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, FOOTER_Y, CANVAS_WIDTH, 2);
  for (const b of buttons) drawButton(ctx, b, now);
  const msg = state.message && now < state.messageUntil ? state.message : 'Click a difference on either picture. H for a hint, R to restart.';
  text(ctx, msg, 480, FOOTER_Y + 46, '16px system-ui, sans-serif', state.messageTone === 'bad' ? RED : state.messageTone === 'good' ? GREEN : MUTED);
  text(ctx, 'Click or tap a difference  •  H hint  •  R restart', 480, FOOTER_Y + 76, '13px system-ui, sans-serif', MUTED);
}

function drawTitle(ctx, state, now) {
  void now;
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // A dim harbour behind the title, painted from the real level art.
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.translate(0, 60);
  ctx.scale(CANVAS_WIDTH / PANEL_WIDTH, (CANVAS_HEIGHT - 120) / PANEL_HEIGHT);
  LEVELS[0].paint(ctx, PANEL_WIDTH, PANEL_HEIGHT, new Set());
  ctx.restore();
  ctx.fillStyle = 'rgba(14, 20, 32, 0.62)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'MERIDIA', CANVAS_WIDTH / 2, 170, 'bold 84px Georgia, serif', GOLD, 'center');
  text(ctx, 'S P O T   T H E   D I F F E R E N C E', CANVAS_WIDTH / 2, 214, 'bold 24px system-ui, sans-serif', INK, 'center');
  text(ctx, 'Two pictures. One is lying. Find what changed.', CANVAS_WIDTH / 2, 252, '18px system-ui, sans-serif', MUTED, 'center');
  // The three levels, with their counts.
  const cardW = 300;
  const gap = 30;
  const totalW = cardW * 3 + gap * 2;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  LEVELS.forEach((level, i) => {
    const x = startX + i * (cardW + gap);
    ctx.fillStyle = '#1d2a3a';
    rr(ctx, x, 300, cardW, 150, 14);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, `LEVEL ${i + 1}`, x + cardW / 2, 336, 'bold 15px system-ui, sans-serif', GOLD, 'center');
    text(ctx, level.name, x + cardW / 2, 372, 'bold 21px Georgia, serif', INK, 'center');
    text(ctx, `${level.diffs.length} differences`, x + cardW / 2, 404, '16px system-ui, sans-serif', MUTED, 'center');
    text(ctx, level.tagline, x + cardW / 2, 430, '13px system-ui, sans-serif', MUTED, 'center');
  });
  for (const b of buttonsFor(SCREEN_TITLE, state)) drawButton(ctx, { ...b, primary: true }, now);
  text(ctx, 'Click a difference on either picture. 90 seconds a level. Hints cost points.', CANVAS_WIDTH / 2, 660, '15px system-ui, sans-serif', MUTED, 'center');
  if (state.best > 0) text(ctx, `BEST SCORE  ${state.best}`, CANVAS_WIDTH / 2, 692, 'bold 16px system-ui, sans-serif', GOLD, 'center');
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#1d2a3a';
  rr(ctx, CANVAS_WIDTH / 2 - 330, 170, 660, 330, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, CANVAS_WIDTH / 2, 250, 'bold 44px Georgia, serif', accent, 'center');
  lines.forEach(([s, color], i) => {
    text(ctx, s, CANVAS_WIDTH / 2, 300 + i * 36, '19px system-ui, sans-serif', color, 'center');
  });
}

function drawLevelDone(ctx, state, now) {
  drawPanels(ctx, state, now);
  drawHud(ctx, state);
  drawOverlay(ctx, 'LEVEL COMPLETE!', [
    [`You found all ${LEVELS[state.levelIndex].diffs.length} differences.`, INK],
    [`Time bonus  +${state.timeBonus}   •   Level score  ${state.levelScore}`, GOLD],
    [`Total score  ${state.score}`, MUTED],
  ], GREEN);
  for (const b of buttonsFor(SCREEN_LEVEL_DONE, state)) drawButton(ctx, { ...b, primary: true }, now);
}

function drawTimeUp(ctx, state, now) {
  drawPanels(ctx, state, now);
  drawHud(ctx, state);
  const level = LEVELS[state.levelIndex];
  drawOverlay(ctx, "TIME'S UP!", [
    [`You found ${state.found.size} of ${level.diffs.length} differences in ${level.name}.`, INK],
    ['The harbour keeps its secrets — for now.', MUTED],
    [`Score  ${state.score}`, GOLD],
  ], RED);
  for (const b of buttonsFor(SCREEN_TIME_UP, state)) drawButton(ctx, { ...b, primary: b.id === 'again' }, now);
}

function drawAllDone(ctx, state, now) {
  void now;
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.translate(0, 60);
  ctx.scale(CANVAS_WIDTH / PANEL_WIDTH, (CANVAS_HEIGHT - 120) / PANEL_HEIGHT);
  LEVELS[2].paint(ctx, PANEL_WIDTH, PANEL_HEIGHT, new Set());
  ctx.restore();
  ctx.fillStyle = 'rgba(14, 20, 32, 0.62)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawOverlay(ctx, 'YOU FOUND THEM ALL!', [
    ['All three scenes of Meridia, every difference found.', INK],
    [`Final score  ${state.score}`, GOLD],
    [`Best score  ${state.best}`, MUTED],
  ], GOLD);
  for (const b of buttonsFor(SCREEN_ALL_DONE, state)) drawButton(ctx, { ...b, primary: b.id === 'again' }, now);
}

/** Paint the whole frame for the current screen. */
export function draw(ctx, state, now) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state, now);
    return;
  }
  if (state.screen === SCREEN_LEVEL_DONE) {
    drawLevelDone(ctx, state, now);
    return;
  }
  if (state.screen === SCREEN_TIME_UP) {
    drawTimeUp(ctx, state, now);
    return;
  }
  if (state.screen === SCREEN_ALL_DONE) {
    drawAllDone(ctx, state, now);
    return;
  }
  drawHud(ctx, state);
  drawPanels(ctx, state, now);
  drawFooter(ctx, state, now);
}
