// The three scenes of Meridia, painted in code. Every scene is drawn twice:
// once as it is (left panel) and once with its differences applied (right
// panel). A difference is data — an id, a spot on the scene, a radius for
// clicking, a kind, and the line the game shows when it is found — and the
// painter checks the applied set to decide how each element looks.
//
// Scene space is 580 x 520. All coordinates below are in that space.
//
// The painters here are deliberately rich: layered gradients, glows,
// highlights and texture instead of big flat fills, so each scene rewards
// a second look — which is the whole point of a spot-the-difference game.

import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A soft radial halo around a light source. */
function glow(ctx, x, y, r, color, alpha = 0.35) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function star(ctx, x, y, r, color = '#ffe9a8') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 2.2, y);
  ctx.lineTo(x + r * 2.2, y);
  ctx.moveTo(x, y - r * 2.2);
  ctx.lineTo(x, y + r * 2.2);
  ctx.stroke();
  ctx.restore();
}

function gull(ctx, x, y, s, color = '#2c2438') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 7 * s, x + 10 * s, y);
  ctx.stroke();
}

function wave(ctx, y, color, amp = 5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= PANEL_WIDTH; x += 8) {
    const yy = y + Math.sin(x / 46 + y) * amp;
    if (x === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

/** A soft drifting cloud: a cluster of translucent ellipses. */
function cloud(ctx, x, y, s, color, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const blobs = [[0, 0, 46, 12], [-34, 6, 32, 10], [36, 6, 34, 10], [-12, -8, 30, 9], [16, -7, 28, 9]];
  for (const [dx, dy, rx, ry] of blobs) {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, y + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A wooden plank with a grain line and a darker edge. */
function plank(ctx, x, y, w, h, base, dark) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = dark;
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + h / 2);
  ctx.quadraticCurveTo(x + w / 2, y + h / 2 - 2, x + w - 3, y + h / 2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 1 — Meridian Harbour at Dusk. Seven differences.
// ---------------------------------------------------------------------------

function paintHarbour(ctx, w, h, applied) {
  // Layered sunset sky: deep indigo up top, violet and magenta in the
  // middle, warm orange at the horizon.
  sky(ctx, w, h, [[0, '#1d1745'], [0.35, '#5a2f63'], [0.62, '#a84a63'], [0.82, '#e0704f'], [1, '#f59a55']]);
  // Stars, fading in as the sky darkens upward.
  star(ctx, 60, 48, 2.5);
  star(ctx, 180, 32, 2);
  star(ctx, 330, 52, 2.5);
  star(ctx, 500, 40, 2);
  star(ctx, 250, 78, 1.6, '#ffd9a0');
  star(ctx, 40, 110, 1.6, '#ffe9a8');
  star(ctx, 380, 26, 1.8);
  if (applied.has('star')) {
    glow(ctx, 120, 62, 26, '#fff3c4', 0.5);
    star(ctx, 120, 62, 3.5, '#fff3c4');
  }
  // Warm clouds catching the last light.
  cloud(ctx, 120, 96, 1, '#e88a7a', 0.35);
  cloud(ctx, 320, 70, 0.8, '#d97a8a', 0.3);
  cloud(ctx, 520, 110, 0.9, '#f0a070', 0.3);
  // The low sun, with a wide halo and a bright core.
  glow(ctx, 430, 132, 78, '#ff9a50', 0.32);
  glow(ctx, 430, 132, 48, '#ffb060', 0.45);
  const sunG = ctx.createRadialGradient(424, 126, 4, 430, 132, 36);
  if (applied.has('sun')) {
    sunG.addColorStop(0, '#fff3c4');
    sunG.addColorStop(1, '#f7c95a');
  } else {
    sunG.addColorStop(0, '#ffd98a');
    sunG.addColorStop(1, '#ff7a3c');
  }
  ctx.fillStyle = sunG;
  ctx.beginPath();
  ctx.arc(430, 132, 34, 0, Math.PI * 2);
  ctx.fill();
  // The sea: a deep gradient, darker towards the bottom.
  const seaG = ctx.createLinearGradient(0, 300, 0, h);
  seaG.addColorStop(0, '#2f6084');
  seaG.addColorStop(0.5, '#22486a');
  seaG.addColorStop(1, '#142c44');
  ctx.fillStyle = seaG;
  ctx.fillRect(0, 300, w, h - 300);
  // Horizon glow where the sun meets the water.
  glow(ctx, 430, 302, 150, '#ff9a50', 0.18);
  wave(ctx, 330, 'rgba(127,178,217,0.85)');
  wave(ctx, 380, 'rgba(93,148,189,0.8)');
  wave(ctx, 440, 'rgba(127,178,217,0.7)');
  wave(ctx, 490, 'rgba(74,123,166,0.75)');
  // Sun path on the water: broken shimmering streaks.
  for (let i = 0; i < 8; i += 1) {
    const yy = 310 + i * 26;
    const sw = 64 - i * 6;
    const off = (i % 2 === 0 ? 6 : -6);
    ctx.fillStyle = `rgba(255, 178, 100, ${0.34 - i * 0.03})`;
    ctx.fillRect(430 - sw / 2 + off, yy, sw, 7);
  }
  // The lighthouse, left, on its rocky base.
  // Rocks with foam at the waterline.
  ctx.fillStyle = '#4a3f55';
  ctx.beginPath();
  ctx.moveTo(36, 300);
  ctx.lineTo(132, 300);
  ctx.lineTo(120, 266);
  ctx.lineTo(100, 272);
  ctx.lineTo(84, 258);
  ctx.lineTo(64, 270);
  ctx.lineTo(50, 264);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b5a78';
  ctx.beginPath();
  ctx.moveTo(50, 264);
  ctx.lineTo(84, 258);
  ctx.lineTo(100, 272);
  ctx.lineTo(120, 266);
  ctx.lineTo(118, 276);
  ctx.lineTo(52, 276);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,235,245,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 300);
  ctx.quadraticCurveTo(84, 292, 128, 300);
  ctx.stroke();
  // Tower: cream brick with a highlight on the left and shade on the right.
  const towerG = ctx.createLinearGradient(58, 0, 110, 0);
  towerG.addColorStop(0, '#f9efdb');
  towerG.addColorStop(0.5, '#f2e6cf');
  towerG.addColorStop(1, '#cbb184');
  ctx.fillStyle = towerG;
  ctx.fillRect(58, 150, 52, 150);
  // Brick courses.
  ctx.strokeStyle = 'rgba(120,90,50,0.28)';
  ctx.lineWidth = 1;
  for (let y = 162; y < 300; y += 12) {
    ctx.beginPath();
    ctx.moveTo(58, y);
    ctx.lineTo(110, y);
    ctx.stroke();
  }
  // Red bands, shaded.
  for (const by of [190, 240]) {
    const bandG = ctx.createLinearGradient(58, 0, 110, 0);
    bandG.addColorStop(0, '#dd5a40');
    bandG.addColorStop(0.5, '#c8442c');
    bandG.addColorStop(1, '#96301f');
    ctx.fillStyle = bandG;
    ctx.fillRect(58, by, 52, 18);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(58, by + 16, 52, 2);
  }
  // Gallery and lamp room.
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(56, 148, 56, 6);
  ctx.fillRect(70, 126, 28, 24);
  // Lamp: glowing when lit, dark glass when the difference is applied.
  if (!applied.has('lamp')) {
    glow(ctx, 84, 138, 44, '#ffd76a', 0.55);
    const beamG = ctx.createLinearGradient(84, 138, 214, 138);
    beamG.addColorStop(0, 'rgba(255, 215, 106, 0.5)');
    beamG.addColorStop(1, 'rgba(255, 215, 106, 0)');
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(84, 130);
    ctx.lineTo(214, 104);
    ctx.lineTo(214, 172);
    ctx.lineTo(84, 146);
    ctx.closePath();
    ctx.fill();
    const lampG = ctx.createRadialGradient(82, 136, 1, 84, 138, 10);
    lampG.addColorStop(0, '#fff3c4');
    lampG.addColorStop(1, '#ffbf3c');
    ctx.fillStyle = lampG;
    ctx.beginPath();
    ctx.arc(84, 138, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a3348';
    ctx.beginPath();
    ctx.arc(84, 138, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a5270';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(84, 138, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Conical roof over the lamp room.
  const roofG = ctx.createLinearGradient(58, 0, 110, 0);
  roofG.addColorStop(0, '#3a3049');
  roofG.addColorStop(1, '#1c1626');
  ctx.fillStyle = roofG;
  ctx.beginPath();
  ctx.moveTo(56, 128);
  ctx.lineTo(112, 128);
  ctx.lineTo(84, 108);
  ctx.closePath();
  ctx.fill();
  // Houses on the right shore, with shingled roofs and a smoking chimney.
  const houseG = ctx.createLinearGradient(478, 0, 536, 0);
  houseG.addColorStop(0, '#8a5560');
  houseG.addColorStop(1, '#5f3946');
  ctx.fillStyle = houseG;
  ctx.fillRect(478, 238, 58, 62);
  ctx.fillStyle = '#4a2f3a';
  ctx.beginPath();
  ctx.moveTo(470, 240);
  ctx.lineTo(507, 210);
  ctx.lineTo(544, 240);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const y = 240 - i * 8;
    ctx.beginPath();
    ctx.moveTo(507 - (240 - y) * 1.2, y);
    ctx.lineTo(507 + (240 - y) * 1.2, y);
    ctx.stroke();
  }
  // Chimney with a curl of smoke.
  ctx.fillStyle = '#4a2f3a';
  ctx.fillRect(524, 214, 8, 18);
  ctx.strokeStyle = 'rgba(242,234,216,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(528, 212);
  ctx.quadraticCurveTo(534, 200, 526, 192);
  ctx.quadraticCurveTo(520, 184, 528, 176);
  ctx.stroke();
  // Lit windows — or dark when the difference is applied.
  const winLit = !applied.has('window');
  for (const wx of [496, 518]) {
    if (winLit) glow(ctx, wx + 7, 265, 16, '#ffd76a', 0.5);
    const winG = ctx.createLinearGradient(wx, 256, wx, 274);
    if (winLit) {
      winG.addColorStop(0, '#ffe9a0');
      winG.addColorStop(1, '#ffb347');
    } else {
      winG.addColorStop(0, '#4a3a28');
      winG.addColorStop(1, '#2e2418');
    }
    ctx.fillStyle = winG;
    ctx.fillRect(wx, 256, 14, 18);
    ctx.strokeStyle = '#2c2438';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx, 256, 14, 18);
    ctx.beginPath();
    ctx.moveTo(wx + 7, 256);
    ctx.lineTo(wx + 7, 274);
    ctx.stroke();
  }
  // A second, smaller cottage peeking in at the far right edge.
  ctx.fillStyle = '#6b4450';
  ctx.fillRect(556, 258, 24, 42);
  ctx.fillStyle = '#3a2430';
  ctx.beginPath();
  ctx.moveTo(552, 260);
  ctx.lineTo(568, 244);
  ctx.lineTo(584, 260);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(564, 270, 9, 12);
  // Boat A, with a flag that flips. Wooden hull, rigging, and a reflection.
  const hullG = ctx.createLinearGradient(180, 344, 300, 368);
  hullG.addColorStop(0, '#8a4a38');
  hullG.addColorStop(1, '#4a241c');
  ctx.fillStyle = hullG;
  ctx.beginPath();
  ctx.moveTo(180, 344);
  ctx.lineTo(300, 344);
  ctx.lineTo(278, 368);
  ctx.lineTo(202, 368);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(196, 352);
  ctx.lineTo(284, 352);
  ctx.moveTo(202, 360);
  ctx.lineTo(278, 360);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,160,0.25)';
  ctx.fillRect(184, 344, 112, 3);
  ctx.fillStyle = '#3a2020';
  ctx.fillRect(238, 292, 5, 54);
  ctx.strokeStyle = 'rgba(40,20,16,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(240, 294);
  ctx.lineTo(288, 344);
  ctx.moveTo(240, 294);
  ctx.lineTo(192, 344);
  ctx.stroke();
  ctx.fillStyle = '#e8b13c';
  ctx.beginPath();
  if (applied.has('flag')) {
    ctx.moveTo(238, 292);
    ctx.lineTo(214, 300);
    ctx.lineTo(238, 308);
  } else {
    ctx.moveTo(243, 292);
    ctx.lineTo(267, 300);
    ctx.lineTo(243, 308);
  }
  ctx.closePath();
  ctx.fill();
  // Reflection of boat A in the water.
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#5d2f28';
  ctx.beginPath();
  ctx.moveTo(186, 372);
  ctx.lineTo(294, 372);
  ctx.lineTo(276, 388);
  ctx.lineTo(206, 388);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Boat B, further out, with a white sail.
  const hull2G = ctx.createLinearGradient(388, 392, 500, 414);
  hull2G.addColorStop(0, '#46608a');
  hull2G.addColorStop(1, '#24344a');
  ctx.fillStyle = hull2G;
  ctx.beginPath();
  ctx.moveTo(388, 392);
  ctx.lineTo(500, 392);
  ctx.lineTo(480, 414);
  ctx.lineTo(406, 414);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1d2a3a';
  ctx.fillRect(440, 352, 5, 42);
  const sailG = ctx.createLinearGradient(445, 352, 470, 382);
  sailG.addColorStop(0, '#ffffff');
  sailG.addColorStop(1, '#d9cdb2');
  ctx.fillStyle = sailG;
  ctx.beginPath();
  ctx.moveTo(445, 352);
  ctx.lineTo(445, 382);
  ctx.lineTo(470, 367);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(446, 356);
  ctx.lineTo(466, 368);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(220,235,245,0.5)';
  ctx.beginPath();
  ctx.moveTo(392, 420);
  ctx.quadraticCurveTo(444, 426, 496, 420);
  ctx.stroke();
  // The pier: planked deck, posts, and a crate that grows when changed.
  for (let i = 0; i < 7; i += 1) {
    plank(ctx, i * 30, 428, 28, 16, i % 2 === 0 ? '#7a5636' : '#6b4a2f', '#4a3220');
  }
  for (const px of [24, 96, 178]) {
    const postG = ctx.createLinearGradient(px, 0, px + 10, 0);
    postG.addColorStop(0, '#5d3f24');
    postG.addColorStop(1, '#3a2812');
    ctx.fillStyle = postG;
    ctx.fillRect(px, 444, 10, 76);
  }
  // A coiled rope on the deck.
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(48, 424, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(48, 424, 5, 0, Math.PI * 2);
  ctx.stroke();
  // The crate.
  const crate = applied.has('crate') ? 1.55 : 1;
  const cw = 30 * crate;
  const ch = 26 * crate;
  const cx = 128;
  const cy = 428 - ch;
  const crateG = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  crateG.addColorStop(0, '#c08a4a');
  crateG.addColorStop(1, '#8a5f2c');
  ctx.fillStyle = crateG;
  ctx.fillRect(cx, cy, cw, ch);
  ctx.strokeStyle = '#6b4a20';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx, cy, cw, ch);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + cw, cy + ch);
  ctx.moveTo(cx + cw, cy);
  ctx.lineTo(cx, cy + ch);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,230,170,0.3)';
  ctx.fillRect(cx, cy, cw, 3);
  // Gulls over the water.
  gull(ctx, 210, 96, 1);
  gull(ctx, 330, 70, 0.8);
  gull(ctx, 160, 58, 0.7, '#3a3049');
  gull(ctx, 384, 108, 0.9, '#3a3049');
  if (applied.has('gull')) gull(ctx, 300, 118, 1.1, '#1c1626');
}

const HARBOUR_DIFFS = [
  { id: 'sun', x: 430, y: 132, r: 36, kind: 'colour', note: 'the sun turned pale gold' },
  { id: 'lamp', x: 84, y: 140, r: 24, kind: 'missing', note: 'the lighthouse lamp went dark' },
  { id: 'gull', x: 300, y: 118, r: 22, kind: 'extra', note: 'an extra gull over the water' },
  { id: 'flag', x: 240, y: 300, r: 20, kind: 'flipped', note: 'the boat flag points the other way' },
  { id: 'crate', x: 143, y: 402, r: 28, kind: 'size', note: 'the pier crate grew bigger' },
  { id: 'window', x: 510, y: 265, r: 18, kind: 'colour', note: 'the house window went dark' },
  { id: 'star', x: 120, y: 62, r: 16, kind: 'extra', note: 'a new star in the dusk sky' },
];

// ---------------------------------------------------------------------------
// Level 2 — Night Market. Nine differences.
// ---------------------------------------------------------------------------

function stall(ctx, x, y, w, awningA, awningB, counter) {
  // Wooden posts with grain, a planked counter, and a striped awning
  // with a scalloped edge and a soft shadow underneath.
  for (const px of [x, x + w - 10]) {
    const postG = ctx.createLinearGradient(px, 0, px + 10, 0);
    postG.addColorStop(0, '#5d4229');
    postG.addColorStop(1, '#332312');
    ctx.fillStyle = postG;
    ctx.fillRect(px, y + 90, 10, 90);
  }
  const counterG = ctx.createLinearGradient(x, y + 150, x, y + 170);
  counterG.addColorStop(0, counter);
  counterG.addColorStop(1, '#3a2a1c');
  ctx.fillStyle = counterG;
  ctx.fillRect(x - 6, y + 150, w + 12, 20);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 6 + (i * (w + 12)) / 5, y + 150);
    ctx.lineTo(x - 6 + (i * (w + 12)) / 5, y + 170);
    ctx.stroke();
  }
  // Scalloped striped awning: each stripe keeps its own colour, shaded
  // towards its bottom edge with a dark overlay.
  for (let i = 0; i < 6; i += 1) {
    const stripe = i % 2 === 0 ? awningA : awningB;
    ctx.fillStyle = stripe;
    ctx.fillRect(x + (i * w) / 6, y + 52, w / 6, 40);
    ctx.beginPath();
    ctx.arc(x + (i * w) / 6 + w / 12, y + 92, w / 12, 0, Math.PI);
    ctx.fill();
    const shade = ctx.createLinearGradient(0, y + 52, 0, y + 104);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = shade;
    ctx.fillRect(x + (i * w) / 6, y + 52, w / 6, 40);
    ctx.beginPath();
    ctx.arc(x + (i * w) / 6 + w / 12, y + 92, w / 12, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = awningA;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 52);
  ctx.lineTo(x + w + 6, y + 52);
  ctx.lineTo(x + w, y + 40);
  ctx.lineTo(x, y + 40);
  ctx.closePath();
  ctx.fill();
  // Shadow under the awning.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y + 92, w, 10);
}

function lantern(ctx, x, y, color, glowOn = true) {
  if (glowOn) glow(ctx, x, y, 34, color, 0.35);
  const lg = ctx.createRadialGradient(x - 4, y - 6, 2, x, y, 17);
  lg.addColorStop(0, '#ffffff');
  lg.addColorStop(0.25, color);
  lg.addColorStop(1, '#7a1f14');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.ellipse(x, y, 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Paper ribs.
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (const dx of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.ellipse(x + dx, y, 4, 15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(x - 4, y - 20, 8, 5);
  ctx.fillRect(x - 4, y + 15, 8, 5);
  // Tassel.
  ctx.strokeStyle = '#e8b13c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x, y + 28);
  ctx.stroke();
}

function paintMarket(ctx, w, h, applied) {
  sky(ctx, w, h, [[0, '#100d24'], [0.5, '#2c1e4a'], [1, '#4a2a4a']]);
  star(ctx, 90, 46, 2);
  star(ctx, 250, 30, 2.5);
  star(ctx, 380, 58, 2);
  star(ctx, 40, 90, 1.6);
  star(ctx, 180, 70, 1.5);
  star(ctx, 440, 30, 1.8);
  // The moon, glowing, plain or cratered.
  glow(ctx, 508, 66, 60, '#f2ead8', 0.3);
  const moonG = ctx.createRadialGradient(502, 60, 4, 508, 66, 28);
  moonG.addColorStop(0, '#fffbe8');
  moonG.addColorStop(1, '#d9cba8');
  ctx.fillStyle = moonG;
  ctx.beginPath();
  ctx.arc(508, 66, 26, 0, Math.PI * 2);
  ctx.fill();
  if (applied.has('moon')) {
    ctx.fillStyle = 'rgba(160,145,105,0.8)';
    ctx.beginPath();
    ctx.arc(500, 58, 6, 0, Math.PI * 2);
    ctx.arc(516, 74, 4, 0, Math.PI * 2);
    ctx.arc(514, 54, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Distant rooftops, dark against the night.
  ctx.fillStyle = '#1c1533';
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.lineTo(60, 150);
  ctx.lineTo(120, 180);
  ctx.lineTo(180, 158);
  ctx.lineTo(240, 180);
  ctx.lineTo(300, 152);
  ctx.lineTo(360, 180);
  ctx.lineTo(420, 160);
  ctx.lineTo(480, 180);
  ctx.lineTo(540, 156);
  ctx.lineTo(580, 180);
  ctx.lineTo(580, 200);
  ctx.lineTo(0, 200);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,215,106,0.75)';
  for (const [wx, wy] of [[88, 168], [210, 170], [330, 166], [452, 168]]) {
    ctx.fillRect(wx, wy, 5, 7);
  }
  // Festoon lights across the top, two sagging strings with glowing bulbs.
  for (const [y0, sag] of [[96, 26], [118, 20]]) {
    ctx.strokeStyle = '#6b5a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.quadraticCurveTo(290, y0 + sag * 2, 580, y0);
    ctx.stroke();
    for (let i = 0; i < 9; i += 1) {
      const x = 34 + i * 62;
      const y = y0 + Math.sin((x / 580) * Math.PI) * sag;
      const c = ['#ff5a5a', '#ffd76a', '#7fd9a8', '#7fb2ff'][i % 4];
      glow(ctx, x, y + 8, 14, c, 0.5);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(x - 2, y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Cobblestones: rows of rounded stones with varied shades and a warm
  // pool of light under each stall.
  const groundG = ctx.createLinearGradient(0, 400, 0, h);
  groundG.addColorStop(0, '#453e55');
  groundG.addColorStop(1, '#2a2438');
  ctx.fillStyle = groundG;
  ctx.fillRect(0, 400, w, h - 400);
  const stoneShades = ['#4a4360', '#3f3852', '#524b68', '#38324a'];
  for (let row = 0; row < 5; row += 1) {
    const y = 412 + row * 24;
    const off = row % 2 === 0 ? 0 : 22;
    for (let col = -1; col < 14; col += 1) {
      const x = off + col * 46;
      ctx.fillStyle = stoneShades[(row + col + 8) % 4];
      ctx.beginPath();
      ctx.roundRect(x + 2, y, 42, 20, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(x + 2, y, 42, 6, 3);
      ctx.fill();
    }
  }
  glow(ctx, 115, 430, 110, '#ffb347', 0.12);
  glow(ctx, 290, 430, 110, '#ffb347', 0.12);
  glow(ctx, 465, 430, 110, '#ffb347', 0.12);
  // Stall 1: fruit, with a little sign board on its counter.
  stall(ctx, 40, 180, 150, '#c8442c', '#f2ead8', '#8a5a2e');
  // A small sign plaque mounted on the awning.
  ctx.fillStyle = '#1d2a3a';
  ctx.beginPath();
  ctx.roundRect(85, 222, 60, 18, 4);
  ctx.fill();
  ctx.strokeStyle = '#c89a2e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRUIT', 115, 235);
  ctx.textAlign = 'left';
  const appleG = (ax, ay) => {
    const g = ctx.createRadialGradient(ax - 3, ay - 3, 1, ax, ay, 11);
    g.addColorStop(0, '#ff8a6a');
    g.addColorStop(1, '#c22a1a');
    return g;
  };
  const apples = [[70, 330], [92, 322], [114, 330], [82, 306], [104, 306]];
  apples.forEach(([ax, ay], i) => {
    if (applied.has('apple') && i === 2) return;
    ctx.fillStyle = appleG(ax, ay);
    ctx.beginPath();
    ctx.arc(ax, ay, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d2a12';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 10);
    ctx.lineTo(ax + 2, ay - 14);
    ctx.stroke();
  });
  // Green apples and oranges beside them.
  for (const [gx, gy, c1, c2] of [[150, 330, '#b8e6a0', '#4a9a4a'], [168, 322, '#ffe9a0', '#e8a13c']]) {
    const g = ctx.createRadialGradient(gx - 3, gy - 3, 1, gx, gy, 11);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gx, gy, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // A honey jar appears on the counter when the difference is applied.
  if (applied.has('jar')) {
    const jarG = ctx.createLinearGradient(196, 310, 210, 338);
    jarG.addColorStop(0, '#f0c070');
    jarG.addColorStop(1, '#b87a28');
    ctx.fillStyle = jarG;
    ctx.beginPath();
    ctx.roundRect(196, 316, 14, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(198, 310, 10, 6);
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(198, 324, 10, 8);
  }
  // Stall 2: fish on ice, its awning changing colour when applied.
  stall(ctx, 215, 180, 150, applied.has('awning') ? '#7a4a9a' : '#2e7d6b', '#f2ead8', '#5a7d8a');
  ctx.fillStyle = '#1d2a3a';
  ctx.beginPath();
  ctx.roundRect(260, 222, 60, 18, 4);
  ctx.fill();
  ctx.strokeStyle = '#c89a2e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FISH', 290, 235);
  ctx.textAlign = 'left';
  const iceG = ctx.createRadialGradient(290, 348, 4, 290, 352, 70);
  iceG.addColorStop(0, '#eaf6fb');
  iceG.addColorStop(1, '#a8c8d9');
  ctx.fillStyle = iceG;
  ctx.beginPath();
  ctx.ellipse(290, 352, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  const fishS = applied.has('fish') ? 1.5 : 1;
  const fishG = ctx.createLinearGradient(264, 334, 316, 354);
  fishG.addColorStop(0, '#a8d4ea');
  fishG.addColorStop(1, '#4a8ab0');
  ctx.fillStyle = fishG;
  ctx.beginPath();
  ctx.ellipse(290, 344, 26 * fishS, 9 * fishS, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(290 + 22 * fishS, 344);
  ctx.lineTo(290 + 40 * fishS, 334);
  ctx.lineTo(290 + 40 * fishS, 354);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(290, 344, 12 * fishS, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#1c2a38';
  ctx.beginPath();
  ctx.arc(276, 341, 2, 0, Math.PI * 2);
  ctx.fill();
  // Stall 3: flowers, with a gold banner that can vanish.
  stall(ctx, 390, 180, 150, '#7a4a9a', '#f2ead8', '#6b4a2f');
  ctx.fillStyle = '#1d2a3a';
  ctx.beginPath();
  ctx.roundRect(435, 222, 60, 18, 4);
  ctx.fill();
  ctx.strokeStyle = '#c89a2e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FLOWERS', 465, 235);
  ctx.textAlign = 'left';
  const blooms = [[420, 326, '#ff7fa8'], [448, 318, '#ffd76a'], [476, 326, '#c98aff'], [504, 318, '#ff7fa8']];
  for (const [bx, by, bc] of blooms) {
    // Stems first, then five petals and a golden centre.
    ctx.strokeStyle = '#2e7d4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 8);
    ctx.lineTo(bx, by + 22);
    ctx.stroke();
    ctx.fillStyle = bc;
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(bx + Math.cos(a) * 7, by + Math.sin(a) * 7, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // The cat by the middle stall, tail up — or down when changed.
  ctx.fillStyle = '#5a4f78';
  ctx.beginPath();
  ctx.ellipse(336, 428, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(316, 410, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(306, 402);
  ctx.lineTo(310, 388);
  ctx.lineTo(316, 400);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(320, 400);
  ctx.lineTo(326, 388);
  ctx.lineTo(330, 402);
  ctx.closePath();
  ctx.fill();
  // Rim light along the cat's back so it reads against the cobbles.
  ctx.strokeStyle = 'rgba(220,200,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(336, 428, 26, 16, Math.PI, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = '#5a4f78';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (applied.has('cat')) {
    ctx.moveTo(360, 428);
    ctx.quadraticCurveTo(372, 448, 360, 458);
  } else {
    ctx.moveTo(360, 428);
    ctx.quadraticCurveTo(374, 412, 362, 398);
  }
  ctx.stroke();
  // Hanging paper lanterns.
  lantern(ctx, 140, 150, applied.has('lantern') ? '#4caf6d' : '#e84a3c');
  lantern(ctx, 300, 138, '#e8a13c');
  lantern(ctx, 470, 150, '#e84a3c');
  if (applied.has('lantern2')) lantern(ctx, 530, 138, '#4caf6d');
  // The small banner under the third stall: there, or gone.
  if (!applied.has('banner')) {
    const banG = ctx.createLinearGradient(430, 252, 500, 274);
    banG.addColorStop(0, '#f0c860');
    banG.addColorStop(1, '#c89a2e');
    ctx.fillStyle = banG;
    ctx.beginPath();
    ctx.roundRect(430, 252, 70, 22, 4);
    ctx.fill();
    ctx.strokeStyle = '#2c2438';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#2c2438';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLOWERS', 465, 267);
    ctx.textAlign = 'left';
  }
  // Shop sign with a warm glow.
  ctx.save();
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('NIGHT MARKET', 290, 30);
  ctx.restore();
  ctx.textAlign = 'left';
}

const MARKET_DIFFS = [
  { id: 'lantern', x: 140, y: 150, r: 20, kind: 'colour', note: 'a lantern turned green' },
  { id: 'apple', x: 114, y: 330, r: 18, kind: 'missing', note: 'an apple vanished from the pile' },
  { id: 'lantern2', x: 530, y: 138, r: 18, kind: 'extra', note: 'an extra lantern appeared' },
  { id: 'awning', x: 290, y: 226, r: 24, kind: 'colour', note: 'the fish stall awning changed colour' },
  { id: 'cat', x: 340, y: 424, r: 26, kind: 'flipped', note: 'the market cat lowered its tail' },
  { id: 'fish', x: 290, y: 344, r: 22, kind: 'size', note: 'the fish on the ice grew bigger' },
  { id: 'banner', x: 465, y: 263, r: 20, kind: 'missing', note: 'the FLOWERS banner is gone' },
  { id: 'moon', x: 508, y: 66, r: 28, kind: 'colour', note: 'craters appeared on the moon' },
  { id: 'jar', x: 203, y: 327, r: 18, kind: 'extra', note: 'an extra jar on the fruit counter' },
];

// ---------------------------------------------------------------------------
// Level 3 — Lighthouse Library. Twelve differences.
// ---------------------------------------------------------------------------

function bookRow(ctx, x, y, w, colors, missingId, applied, startId) {
  const bw = w / colors.length;
  colors.forEach((c, i) => {
    if (missingId && applied.has(missingId) && i === startId) return;
    // Varied heights and a slight lean on one spine per row.
    const tall = i % 3 === 0 ? 3 : 0;
    const lean = i === 3 ? -0.06 : 0;
    ctx.save();
    ctx.translate(x + i * bw + bw / 2, y + 44);
    ctx.rotate(lean);
    const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    g.addColorStop(0, c);
    g.addColorStop(0.5, c);
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(-bw / 2 + 1, -44 - tall, bw - 2, 44 + tall);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(-bw / 2 + 1, -44 - tall, bw - 2, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-bw / 2 + 1, -16, bw - 2, 3);
    ctx.fillStyle = 'rgba(255,235,180,0.55)';
    ctx.fillRect(-bw / 2 + 4, -36 - tall, bw - 10, 2);
    ctx.restore();
  });
}

function paintLibrary(ctx, w, h, applied) {
  // Warm wooden room: gradient walls, a plank floor, a soft pool of
  // moonlight falling from the round window onto the rug.
  const wallG = ctx.createLinearGradient(0, 0, 0, 420);
  wallG.addColorStop(0, '#5d4229');
  wallG.addColorStop(0.6, '#4a3423');
  wallG.addColorStop(1, '#3a2817');
  ctx.fillStyle = wallG;
  ctx.fillRect(0, 0, w, 420);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 58, w, 4);
  // Floor planks.
  for (let i = 0; i < 6; i += 1) {
    const y = 420 + i * 17;
    ctx.fillStyle = i % 2 === 0 ? '#4a3220' : '#42301e';
    ctx.fillRect(0, y, w, 17);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // The round window with the moon, and its frame.
  const winG = ctx.createRadialGradient(290, 96, 8, 290, 96, 62);
  winG.addColorStop(0, '#232052');
  winG.addColorStop(1, '#0e0c22');
  ctx.fillStyle = winG;
  ctx.beginPath();
  ctx.arc(290, 96, 62, 0, Math.PI * 2);
  ctx.fill();
  glow(ctx, 290, 96, 40, '#f2ead8', 0.35);
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.arc(290, 96, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,190,160,0.7)';
  ctx.beginPath();
  ctx.arc(282, 88, 5, 0, Math.PI * 2);
  ctx.arc(298, 104, 3, 0, Math.PI * 2);
  ctx.fill();
  star(ctx, 258, 66, 2);
  star(ctx, 322, 70, 2);
  star(ctx, 246, 108, 1.6);
  if (applied.has('star')) {
    glow(ctx, 306, 52, 18, '#fff3c4', 0.5);
    star(ctx, 306, 52, 2.5, '#fff3c4');
  }
  const frameG = ctx.createLinearGradient(228, 34, 352, 158);
  frameG.addColorStop(0, '#a87f45');
  frameG.addColorStop(1, '#6b4a20');
  ctx.strokeStyle = frameG;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(290, 96, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(228, 96);
  ctx.lineTo(352, 96);
  ctx.moveTo(290, 34);
  ctx.lineTo(290, 158);
  ctx.stroke();
  // Moonlight spilling onto the floor.
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = '#c8dcff';
  ctx.beginPath();
  ctx.moveTo(258, 150);
  ctx.lineTo(322, 150);
  ctx.lineTo(370, 420);
  ctx.lineTo(210, 420);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // A framed map on the wall, left of the window.
  ctx.fillStyle = '#8a6a3e';
  ctx.fillRect(150, 66, 62, 46);
  ctx.fillStyle = '#d9c9a0';
  ctx.fillRect(154, 70, 54, 38);
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(160, 100);
  ctx.quadraticCurveTo(180, 78, 202, 96);
  ctx.moveTo(170, 82);
  ctx.lineTo(196, 102);
  ctx.stroke();
  ctx.fillStyle = '#c8442c';
  ctx.beginPath();
  ctx.arc(181, 88, 3, 0, Math.PI * 2);
  ctx.fill();
  // Wall clock: hands at ten past ten, or half past four when changed.
  const clockG = ctx.createRadialGradient(86, 86, 2, 90, 90, 27);
  clockG.addColorStop(0, '#fffbe8');
  clockG.addColorStop(1, '#d9cba8');
  ctx.fillStyle = clockG;
  ctx.beginPath();
  ctx.arc(90, 90, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6a3e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(90, 90, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2c2438';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(90 + Math.cos(a) * 21, 90 + Math.sin(a) * 21);
    ctx.lineTo(90 + Math.cos(a) * 24, 90 + Math.sin(a) * 24);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 90);
  if (applied.has('clock')) {
    ctx.lineTo(90, 108);
    ctx.moveTo(90, 90);
    ctx.lineTo(104, 100);
  } else {
    ctx.lineTo(90, 72);
    ctx.moveTo(90, 90);
    ctx.lineTo(76, 80);
  }
  ctx.stroke();
  ctx.fillStyle = '#2c2438';
  ctx.beginPath();
  ctx.arc(90, 90, 3, 0, Math.PI * 2);
  ctx.fill();
  // Bookshelves with grain, shadows and varied spines.
  for (const [sx] of [[20], [340]]) {
    const shelfG = ctx.createLinearGradient(sx, 0, sx + 220, 0);
    shelfG.addColorStop(0, '#4a3520');
    shelfG.addColorStop(0.5, '#3a2a1c');
    shelfG.addColorStop(1, '#2c1e12');
    ctx.fillStyle = shelfG;
    ctx.fillRect(sx, 170, 220, 240);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (let gy = 176; gy < 410; gy += 14) {
      ctx.beginPath();
      ctx.moveTo(sx + 4, gy);
      ctx.lineTo(sx + 216, gy + 6);
      ctx.stroke();
    }
  }
  // Shelf boards and their shadows.
  for (const sy of [226, 280, 334]) {
    ctx.fillStyle = '#2c1e12';
    ctx.fillRect(20, sy, 220, 6);
    ctx.fillRect(340, sy, 220, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(20, sy + 6, 220, 4);
    ctx.fillRect(340, sy + 6, 220, 4);
  }
  bookRow(ctx, 30, 182, 200, ['#c8442c', '#2e7d6b', '#e8b13c', '#7a4a9a', '#4a7ba6'], null, applied, 0);
  // One spine in the top row changes colour.
  ctx.fillStyle = applied.has('book') ? '#4a7ba6' : '#c8442c';
  ctx.fillRect(31, 179, 38, 47);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(31, 179, 38, 5);
  ctx.fillStyle = 'rgba(255,235,180,0.55)';
  ctx.fillRect(35, 188, 30, 2);
  bookRow(ctx, 30, 236, 200, ['#7a4a9a', '#e8b13c', '#2e7d6b', '#c8442c', '#4a7ba6'], null, applied, 0);
  bookRow(ctx, 30, 290, 200, ['#4a7ba6', '#c8442c', '#7a4a9a', '#e8b13c', '#2e7d6b'], 'book2', applied, 2);
  bookRow(ctx, 350, 182, 200, ['#2e7d6b', '#e8b13c', '#c8442c', '#7a4a9a', '#4a7ba6'], null, applied, 0);
  bookRow(ctx, 350, 236, 200, ['#e8b13c', '#4a7ba6', '#7a4a9a', '#2e7d6b', '#c8442c'], null, applied, 0);
  bookRow(ctx, 350, 290, 200, ['#c8442c', '#7a4a9a', '#e8b13c', '#4a7ba6', '#2e7d6b'], null, applied, 0);
  // A candle on the left shelf: lit, or gone.
  if (!applied.has('candle')) {
    glow(ctx, 151, 284, 26, '#ff9a3c', 0.5);
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.roundRect(146, 292, 10, 26, 3);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(146, 292, 10, 4);
    const flameG = ctx.createRadialGradient(151, 286, 1, 151, 284, 8);
    flameG.addColorStop(0, '#fff3c4');
    flameG.addColorStop(0.6, '#ff9a3c');
    flameG.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = flameG;
    ctx.beginPath();
    ctx.ellipse(151, 284, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The rug, with a patterned border and a centre diamond.
  const rugG = ctx.createLinearGradient(180, 420, 400, 496);
  rugG.addColorStop(0, '#8a3540');
  rugG.addColorStop(1, '#5f222c');
  ctx.fillStyle = rugG;
  ctx.fillRect(180, 420, 220, 76);
  ctx.strokeStyle = '#e8b13c';
  ctx.lineWidth = 2;
  ctx.strokeRect(190, 428, 200, 60);
  ctx.strokeStyle = 'rgba(232,177,60,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(196, 434, 188, 48);
  for (const [dx, dy] of [[196, 434], [384, 434], [196, 482], [384, 482]]) {
    ctx.fillStyle = '#e8b13c';
    ctx.beginPath();
    ctx.moveTo(dx, dy - 5);
    ctx.lineTo(dx + 5, dy);
    ctx.lineTo(dx, dy + 5);
    ctx.lineTo(dx - 5, dy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = applied.has('rug') ? '#2e7d6b' : '#e8b13c';
  ctx.beginPath();
  ctx.moveTo(290, 436);
  ctx.lineTo(316, 458);
  ctx.lineTo(290, 480);
  ctx.lineTo(264, 458);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.moveTo(290, 446);
  ctx.lineTo(304, 458);
  ctx.lineTo(290, 470);
  ctx.lineTo(276, 458);
  ctx.closePath();
  ctx.fill();
  // The desk with lamp, globe, books, and papers.
  const deskG = ctx.createLinearGradient(150, 392, 430, 408);
  deskG.addColorStop(0, '#6b4f30');
  deskG.addColorStop(1, '#4a3420');
  ctx.fillStyle = deskG;
  ctx.fillRect(150, 392, 280, 16);
  ctx.fillStyle = 'rgba(255,230,170,0.2)';
  ctx.fillRect(150, 392, 280, 3);
  ctx.fillStyle = '#3a2812';
  ctx.fillRect(168, 408, 12, 60);
  ctx.fillRect(400, 408, 12, 60);
  // Scattered papers on the desk.
  ctx.save();
  ctx.translate(330, 384);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#efe6cc';
  ctx.fillRect(0, 0, 34, 12);
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.lineTo(30, 4);
  ctx.moveTo(4, 8);
  ctx.lineTo(24, 8);
  ctx.stroke();
  ctx.restore();
  // Lamp: warm glow, or cold and dark when changed.
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(216, 348, 6, 46);
  ctx.fillStyle = '#8a6a3e';
  ctx.beginPath();
  ctx.ellipse(219, 394, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  const shadeG = ctx.createLinearGradient(200, 322, 238, 350);
  if (applied.has('lamp')) {
    shadeG.addColorStop(0, '#5a5a6a');
    shadeG.addColorStop(1, '#3a3a4a');
  } else {
    shadeG.addColorStop(0, '#ffd76a');
    shadeG.addColorStop(1, '#c89a2e');
  }
  ctx.fillStyle = shadeG;
  ctx.beginPath();
  ctx.moveTo(200, 350);
  ctx.lineTo(238, 350);
  ctx.lineTo(230, 322);
  ctx.lineTo(208, 322);
  ctx.closePath();
  ctx.fill();
  if (!applied.has('lamp')) {
    glow(ctx, 219, 336, 40, '#ffd76a', 0.5);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.moveTo(200, 350);
    ctx.lineTo(238, 350);
    ctx.lineTo(268, 392);
    ctx.lineTo(170, 392);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Book stack on the desk, one extra book when changed.
  const stack = ['#c8442c', '#2e7d6b', '#7a4a9a'];
  stack.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(276, 378 - i * 12, 56, 10);
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(276, 378 - i * 12, 56, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(276, 386 - i * 12, 56, 2);
  });
  if (applied.has('book3')) {
    ctx.fillStyle = '#e8b13c';
    ctx.fillRect(280, 342, 48, 10);
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(280, 342, 48, 2);
  }
  // A scroll beside the books: only in the changed picture.
  if (applied.has('scroll')) {
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.roundRect(344, 366, 34, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#8a7a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(350, 374);
    ctx.lineTo(372, 374);
    ctx.moveTo(350, 380);
    ctx.lineTo(368, 380);
    ctx.stroke();
    ctx.fillStyle = '#c9b896';
    ctx.fillRect(340, 364, 6, 26);
    ctx.fillRect(374, 364, 6, 26);
  }
  // The globe: tilted one way, or the other when changed.
  ctx.save();
  ctx.translate(400, 372);
  ctx.rotate(applied.has('globe') ? -0.35 : 0.35);
  const globeG = ctx.createRadialGradient(-6, -6, 2, 0, 0, 22);
  globeG.addColorStop(0, '#7fb2d9');
  globeG.addColorStop(1, '#2c5a80');
  ctx.fillStyle = globeG;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a9a5a';
  ctx.beginPath();
  ctx.arc(-6, -4, 8, 0, Math.PI * 2);
  ctx.arc(8, 8, 6, 0, Math.PI * 2);
  ctx.arc(10, -8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#8a6a3e';
  ctx.fillRect(392, 392, 16, 6);
  ctx.beginPath();
  ctx.ellipse(400, 398, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // The plant in the corner: one leaf fewer when changed.
  const potG = ctx.createLinearGradient(508, 430, 542, 460);
  potG.addColorStop(0, '#a86a3a');
  potG.addColorStop(1, '#6b4423');
  ctx.fillStyle = potG;
  ctx.beginPath();
  ctx.moveTo(508, 430);
  ctx.lineTo(542, 430);
  ctx.lineTo(538, 460);
  ctx.lineTo(512, 460);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(506, 426, 38, 6);
  const leaves = [[514, 428], [526, 418], [538, 428], [520, 408], [532, 410]];
  leaves.forEach(([lx, ly], i) => {
    if (applied.has('leaf') && i === 4) return;
    const leafG = ctx.createLinearGradient(lx - 6, ly - 14, lx + 6, ly + 14);
    leafG.addColorStop(0, '#4a9a5a');
    leafG.addColorStop(1, '#1f5a30');
    ctx.fillStyle = leafG;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 7, 16, (i - 2) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, ly - 12);
    ctx.lineTo(lx, ly + 12);
    ctx.stroke();
  });
  // The sleeping cat on the rug: smaller when changed.
  const catS = applied.has('cat') ? 0.7 : 1;
  ctx.save();
  ctx.translate(440, 470);
  ctx.scale(catS, catS);
  ctx.fillStyle = '#241d31';
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-26, -8, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-34, -16);
  ctx.lineTo(-32, -26);
  ctx.lineTo(-26, -17);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22, -18);
  ctx.lineTo(-20, -27);
  ctx.lineTo(-14, -18);
  ctx.closePath();
  ctx.fill();
  // Back highlight and a curled tail.
  ctx.strokeStyle = 'rgba(180,160,220,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -2, 28, 12, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#241d31';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(28, 2);
  ctx.quadraticCurveTo(38, 8, 30, 12);
  ctx.stroke();
  ctx.restore();
  // Telescope by the window, on its tripod.
  ctx.strokeStyle = '#8a6a3e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(430, 200);
  ctx.lineTo(480, 160);
  ctx.stroke();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(436, 195);
  ctx.lineTo(474, 165);
  ctx.stroke();
  ctx.fillStyle = '#2c2438';
  ctx.fillRect(476, 152, 14, 12);
  ctx.fillStyle = '#c9a86a';
  ctx.fillRect(430, 196, 10, 8);
  ctx.strokeStyle = '#5d4229';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(455, 200);
  ctx.lineTo(455, 240);
  ctx.moveTo(455, 200);
  ctx.lineTo(430, 240);
  ctx.moveTo(455, 200);
  ctx.lineTo(480, 240);
  ctx.stroke();
  // A leaning ladder against the right shelf.
  ctx.strokeStyle = '#7a5a30';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(330, 420);
  ctx.lineTo(352, 180);
  ctx.moveTo(352, 420);
  ctx.lineTo(370, 180);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = 400 - i * 46;
    const t = (420 - y) / 240;
    ctx.beginPath();
    ctx.moveTo(330 + 22 * t - 8, y);
    ctx.lineTo(352 + 18 * t + 2, y);
    ctx.stroke();
  }
}

const LIBRARY_DIFFS = [
  { id: 'book', x: 50, y: 204, r: 16, kind: 'colour', note: 'a book spine changed colour' },
  { id: 'book2', x: 130, y: 312, r: 16, kind: 'missing', note: 'a book vanished from the shelf' },
  { id: 'book3', x: 304, y: 347, r: 16, kind: 'extra', note: 'an extra book on the desk stack' },
  { id: 'clock', x: 90, y: 90, r: 26, kind: 'flipped', note: 'the clock shows a different time' },
  { id: 'globe', x: 400, y: 372, r: 22, kind: 'flipped', note: 'the globe leans the other way' },
  { id: 'lamp', x: 219, y: 336, r: 22, kind: 'colour', note: 'the desk lamp went cold and dark' },
  { id: 'leaf', x: 532, y: 410, r: 16, kind: 'missing', note: 'a leaf fell from the plant' },
  { id: 'rug', x: 290, y: 458, r: 22, kind: 'colour', note: 'the rug diamond changed colour' },
  { id: 'scroll', x: 360, y: 377, r: 16, kind: 'extra', note: 'an extra scroll on the desk' },
  { id: 'star', x: 306, y: 52, r: 14, kind: 'extra', note: 'a new star in the window' },
  { id: 'cat', x: 440, y: 470, r: 28, kind: 'size', note: 'the sleeping cat shrank' },
  { id: 'candle', x: 151, y: 299, r: 16, kind: 'missing', note: 'the shelf candle is gone' },
];

// ---------------------------------------------------------------------------
// The levels, in order. Each one carries its painter and its differences.
// ---------------------------------------------------------------------------

export const LEVELS = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    tagline: 'Seven changes hide in the harbour light.',
    diffs: HARBOUR_DIFFS,
    paint: paintHarbour,
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Nine changes among the lanterns.',
    diffs: MARKET_DIFFS,
    paint: paintMarket,
  },
  {
    id: 'library',
    name: 'Lighthouse Library',
    tagline: 'Twelve changes between the books.',
    diffs: LIBRARY_DIFFS,
    paint: paintLibrary,
  },
];

export { PANEL_WIDTH, PANEL_HEIGHT };
