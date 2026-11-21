// Keyboard and pointer input. One-shot presses (hint, restart, next scene,
// pause, scene jump) are queued as bit flags and taken once by the loop, so
// a press between two frames is never lost and never counted twice. Pointer
// clicks carry their scene coordinates; the loop decides what they hit.

import { SCENE } from './config.js';

export const ACTION_HINT = 1;
export const ACTION_RESTART = 2;
export const ACTION_NEXT = 4;
export const ACTION_PAUSE = 8;
export const ACTION_CONFIRM = 16;
export const ACTION_SCENE_1 = 32;
export const ACTION_SCENE_2 = 64;
export const ACTION_SCENE_3 = 128;

const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);
const NEXT = new Set(['KeyN']);
const PAUSE = new Set(['KeyP', 'Escape']);
const CONFIRM = new Set(['Space', 'Enter']);
const SCENE_KEYS = new Map([
  ['Digit1', ACTION_SCENE_1],
  ['Digit2', ACTION_SCENE_2],
  ['Digit3', ACTION_SCENE_3],
]);

export function createInput(leftCanvas, rightCanvas) {
  let actions = 0;
  let clicks = [];

  function scenePoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SCENE.width,
      y: ((event.clientY - rect.top) / rect.height) * SCENE.height,
    };
  }

  function onPointer(canvas, panel) {
    canvas.addEventListener('pointerdown', (event) => {
      const point = scenePoint(canvas, event);
      clicks.push({ x: point.x, y: point.y, panel });
    });
  }

  onPointer(leftCanvas, 'left');
  onPointer(rightCanvas, 'right');

  window.addEventListener('keydown', (event) => {
    if (HINT.has(event.code)) actions |= ACTION_HINT;
    else if (RESTART.has(event.code)) actions |= ACTION_RESTART;
    else if (NEXT.has(event.code)) actions |= ACTION_NEXT;
    else if (PAUSE.has(event.code)) actions |= ACTION_PAUSE;
    else if (CONFIRM.has(event.code)) actions |= ACTION_CONFIRM;
    else if (SCENE_KEYS.has(event.code)) actions |= SCENE_KEYS.get(event.code);
    else return;
    event.preventDefault();
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The pointer clicks since the last call, in scene coordinates. */
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
  };
}
