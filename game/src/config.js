// Every tuning number and colour in one place. A scene is drawn on a fixed
// 600x440 canvas; the page scales the two panels to fit the window, so no
// rule below depends on the screen size.

export const SCENE = { width: 600, height: 440 };

/** Seconds on the clock when a scene starts. */
export const SCENE_TIME = 180;

/** Hints handed out at the start of each scene. */
export const HINTS_PER_SCENE = 3;

/** Points for a find, plus a streak bonus of STREAK_BONUS per find in a row. */
export const FIND_POINTS = 100;
export const STREAK_BONUS = 20;

/** What a hint costs, and how many seconds a wrong click costs. */
export const HINT_COST = 50;
export const WRONG_COST_SECONDS = 5;

/** Time bonus per second left when a scene is finished. */
export const TIME_BONUS_PER_SECOND = 2;

/** How long a hint pulse and a wrong-click cross stay visible, in seconds. */
export const HINT_PULSE_SECONDS = 3;
export const WRONG_FLASH_SECONDS = 0.9;

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  page: '#141a26',
  panel: '#1d2536',
  panelEdge: '#33405c',
  text: '#f4f1e6',
  muted: '#9aa5bd',
  gold: '#f2c94c',
  goldDeep: '#d9a521',
  green: '#3fbf7f',
  greenDeep: '#1f7a4d',
  red: '#e5534b',
  hint: '#f2c94c',
  button: '#f2c94c',
  buttonText: '#231a04',
};

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-scenes.best';

/** The three scenes, in play order. Names and art are original to this game. */
export const SCENE_ORDER = ['kite-field', 'bookshop-lane', 'starlight-camp'];

export const SCENE_META = {
  'kite-field': { index: 0, name: 'Kite Field at Dawn', short: 'Kite Field', par: '3:00' },
  'bookshop-lane': { index: 1, name: 'Bookshop Lane in the Rain', short: 'Bookshop Lane', par: '3:00' },
  'starlight-camp': { index: 2, name: 'Starlight Campsite', short: 'Starlight Camp', par: '3:00' },
};
