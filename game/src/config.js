// One place for the numbers the whole game agrees on: the canvas size,
// the panel layout, the timer, the scoring and the hint rules.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

// The two picture panels. Both panels show the same scene space;
// the right one is drawn with the level's differences applied.
export const PANEL_WIDTH = 580;
export const PANEL_HEIGHT = 520;
export const PANEL_Y = 100;
export const LEFT_PANEL_X = 20;
export const RIGHT_PANEL_X = 680;

export const HUD_HEIGHT = 72;
export const FOOTER_Y = 628;

// A level's clock, in seconds. Finding everything early banks the
// remaining seconds as a bonus.
export const LEVEL_SECONDS = 90;

// Scoring: a find is worth 100, a hint costs 25, a wrong click costs 10
// (never below zero), and a finished level banks 10 points per second left.
export const POINTS_PER_FIND = 100;
export const HINT_COST = 25;
export const WRONG_CLICK_COST = 10;
export const TIME_BONUS_PER_SECOND = 10;

// Hints: at most three per level, five seconds between them.
export const HINTS_PER_LEVEL = 3;
export const HINT_COOLDOWN_MS = 5000;
export const HINT_SHOW_MS = 1800;

// How long a found ring takes to pop in, and how long a wrong-click
// cross stays on the panel.
export const RING_POP_MS = 320;
export const MISS_SHOW_MS = 450;

export const BEST_KEY = 'meridia-spot-best';
