// All sound is synthesized with WebAudio — no audio files, no network.
// The context is created lazily on the first sound, so the browser's
// autoplay rules are never in the way. Every call is guarded: a game
// that cannot make sound still plays.

let ctx = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, startIn, duration, type = 'sine', volume = 0.16) {
  const ac = audio();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + startIn;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    // Sound is garnish; a failure here must never break the game.
  }
}

/** Two-note chime when a difference is found. */
export function playFind() {
  tone(880, 0, 0.18);
  tone(1318, 0.09, 0.28);
}

/** Low thud for a wrong click. */
export function playMiss() {
  tone(150, 0, 0.16, 'triangle', 0.2);
}

/** Soft blip when a hint is spent. */
export function playHint() {
  tone(660, 0, 0.12, 'sine', 0.1);
}

/** Little arpeggio for a finished level. */
export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3));
}

/** Short tick for the last five seconds of a level. */
export function playTick() {
  tone(980, 0, 0.07, 'square', 0.06);
}
