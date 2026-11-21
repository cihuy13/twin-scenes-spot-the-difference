// The screenshot scenes behind ?shot=cover|scene2|scene3|win. Each one puts
// the real world into a fixed state — a mid-play frame with some differences
// found and several still unfound, or a finished scene — so the frame is
// what a real game looks like and the same shot always gives the same frame.

export const SCREEN_PLAY = 'play';
export const SCREEN_DONE = 'done';

/** The staged state for each shot name; any other name stages the cover. */
const SHOTS = {
  cover: {
    scene: 0, found: ['kite-colour', 'bird-gone', 'dog-spot'],
    score: 340, streak: 2, hints: 3, timeLeft: 151, screen: SCREEN_PLAY,
  },
  scene2: {
    scene: 1, found: ['awning-colour', 'cat-gone'],
    score: 210, streak: 1, hints: 2, timeLeft: 125, screen: SCREEN_PLAY,
  },
  scene3: {
    scene: 2, found: ['moon-phase', 'tent-colour', 'fire-big', 'owl-gone'],
    score: 520, streak: 3, hints: 3, timeLeft: 107, screen: SCREEN_PLAY,
  },
  win: {
    scene: 0,
    found: ['kite-colour', 'bird-gone', 'sun-rays', 'flower-gone', 'dog-spot', 'tree-grown', 'basket-apple'],
    score: 940, streak: 7, hints: 3, timeLeft: 96, screen: SCREEN_DONE,
  },
};

export function stageShot(name, world) {
  const shot = SHOTS[name] ?? SHOTS.cover;
  world.startScene(shot.scene);
  const state = world.state;
  state.found = new Set(shot.found);
  state.score = shot.score;
  state.streak = shot.streak;
  state.bestStreak = Math.max(state.bestStreak, shot.streak);
  state.hints = shot.hints;
  state.timeLeft = shot.timeLeft;
  if (shot.screen === SCREEN_DONE) {
    state.sceneDone = true;
    state.scenesDone = 1;
  }
  return { screen: shot.screen };
}
