// The game's rules and state, with no drawing and no browser in it: which
// scene is open, which differences are found, score, streak, hints, the
// clock and the strikes. The caller paints the state and reacts to the
// events this file returns.

import {
  FIND_POINTS,
  HINTS_PER_SCENE,
  HINT_COST,
  HINT_PULSE_SECONDS,
  SCENE_ORDER,
  SCENE_TIME,
  STREAK_BONUS,
  TIME_BONUS_PER_SECOND,
  WRONG_COST_SECONDS,
} from './config.js';
import { DIFFS } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_HINT = 4;
export const EVENT_SCENE_DONE = 8;
export const EVENT_TIME_UP = 16;
export const EVENT_GAME_DONE = 32;

export function createWorld() {
  const state = {
    sceneIndex: 0,
    sceneId: SCENE_ORDER[0],
    found: new Set(),
    hinted: null,
    hintLeft: 0,
    wrong: null,
    wrongLeft: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hints: HINTS_PER_SCENE,
    strikes: 0,
    timeLeft: SCENE_TIME,
    paused: false,
    sceneDone: false,
    gameDone: false,
    timeUp: false,
    scenesDone: 0,
  };

  function diffs() {
    return DIFFS[state.sceneId];
  }

  function remaining() {
    return diffs().length - state.found.size;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.sceneId = SCENE_ORDER[index];
    state.found = new Set();
    state.hinted = null;
    state.hintLeft = 0;
    state.wrong = null;
    state.wrongLeft = 0;
    state.streak = 0;
    state.hints = HINTS_PER_SCENE;
    state.timeLeft = SCENE_TIME;
    state.paused = false;
    state.sceneDone = false;
    state.timeUp = false;
  }

  function nearestDiff(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const diff of diffs()) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= diff.r + 10 && dist < bestDist) {
        best = diff;
        bestDist = dist;
      }
      // A moved thing can also be clicked where it sits on the right panel.
      if (diff.x2 !== undefined) {
        const dx2 = x - diff.x2;
        const dy2 = y - diff.y2;
        const dist2 = Math.hypot(dx2, dy2);
        if (dist2 <= diff.r + 10 && dist2 < bestDist) {
          best = diff;
          bestDist = dist2;
        }
      }
    }
    return best;
  }

  /** A click at scene coordinates on either panel. Returns an event flag. */
  function click(x, y, panel) {
    if (state.paused || state.sceneDone || state.gameDone || state.timeUp) return EVENT_NONE;
    const diff = nearestDiff(x, y);
    if (diff === null) {
      state.streak = 0;
      state.strikes += 1;
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_COST_SECONDS);
      state.wrong = { x, y, panel };
      state.wrongLeft = 0.9;
      state.hinted = null;
      state.hintLeft = 0;
      return EVENT_WRONG;
    }
    state.found.add(diff.id);
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.score += FIND_POINTS + STREAK_BONUS * (state.streak - 1);
    state.hinted = null;
    state.hintLeft = 0;
    if (state.found.size === diffs().length) {
      state.sceneDone = true;
      state.scenesDone += 1;
      state.score += Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
      if (state.scenesDone === SCENE_ORDER.length) {
        state.gameDone = true;
        return EVENT_FOUND | EVENT_SCENE_DONE | EVENT_GAME_DONE;
      }
      return EVENT_FOUND | EVENT_SCENE_DONE;
    }
    return EVENT_FOUND;
  }

  /** Spend a hint on one difference still unfound. Returns the diff or null. */
  function hint() {
    if (state.paused || state.sceneDone || state.gameDone || state.timeUp) return null;
    if (state.hints <= 0) return null;
    const left = diffs().filter((diff) => !state.found.has(diff.id));
    if (left.length === 0) return null;
    const pick = left[Math.floor(Math.random() * left.length)];
    state.hints -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    state.hinted = { ...pick, pulse: 0 };
    state.hintLeft = HINT_PULSE_SECONDS;
    return pick;
  }

  /** Advance the clock and the short-lived flashes by dt seconds. */
  function tick(dt) {
    if (state.paused || state.sceneDone || state.gameDone) return EVENT_NONE;
    state.timeLeft -= dt;
    if (state.hintLeft > 0) {
      state.hintLeft -= dt;
      if (state.hinted !== null) state.hinted.pulse += dt;
      if (state.hintLeft <= 0) state.hinted = null;
    }
    if (state.wrongLeft > 0) {
      state.wrongLeft -= dt;
      if (state.wrongLeft <= 0) state.wrong = null;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.timeUp = true;
      return EVENT_TIME_UP;
    }
    return EVENT_NONE;
  }

  function nextScene() {
    if (state.sceneIndex + 1 < SCENE_ORDER.length) {
      startScene(state.sceneIndex + 1);
      return true;
    }
    return false;
  }

  function restart() {
    startScene(state.sceneIndex);
  }

  function restartAll() {
    state.score = 0;
    state.bestStreak = 0;
    state.strikes = 0;
    state.scenesDone = 0;
    state.gameDone = false;
    startScene(0);
  }

  return {
    state,
    diffs,
    remaining,
    startScene,
    click,
    hint,
    tick,
    nextScene,
    restart,
    restartAll,
  };
}
