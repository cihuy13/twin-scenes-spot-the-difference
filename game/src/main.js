// Boot and the one loop: input is read every frame, the clock advances in
// real time, and the renderer paints both panels plus the DOM header. The
// game moves between four states: playing, paused, a scene done, and the
// game done. ?shot=cover|scene2|scene3|win stages one fixed frame instead
// of running the loop, paints it twice and sets window.__shotReady.

import { BEST_KEY, SCENE_ORDER, SCENE_META, SCENE_TIME } from './config.js';
import { DIFFS } from './scenes.js';
import { createWorld, EVENT_FOUND, EVENT_GAME_DONE, EVENT_SCENE_DONE, EVENT_TIME_UP, EVENT_WRONG } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_NEXT,
  ACTION_PAUSE,
  ACTION_RESTART,
  ACTION_SCENE_1,
  ACTION_SCENE_2,
  ACTION_SCENE_3,
  createInput,
} from './input.js';
import { drawPanel, sizePanels } from './render.js';
import { stageShot, SCREEN_DONE } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const leftCanvas = document.getElementById('leftCanvas');
const rightCanvas = document.getElementById('rightCanvas');
const status = document.getElementById('status');
const world = createWorld();
sizePanels(leftCanvas, rightCanvas);

const el = (id) => document.getElementById(id);
const header = {
  sceneName: el('sceneName'),
  sceneIndex: el('sceneIndex'),
  toFind: el('toFind'),
  timer: el('timer'),
  timerBar: el('timerBar'),
  score: el('score'),
  streak: el('streak'),
  hintBtn: el('hintBtn'),
  dots: el('dots'),
  foundList: el('foundList'),
  overlay: el('overlay'),
  overlayTitle: el('overlayTitle'),
  overlayText: el('overlayText'),
  overlayBtn: el('overlayBtn'),
};

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
    // Storage can be off (private windows): the best then lasts this visit only.
  }
}

let best = readBest();
let overlayKind = null;

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function announce(message) {
  status.textContent = message;
}

function syncHud() {
  const state = world.state;
  const meta = SCENE_META[state.sceneId];
  header.sceneName.textContent = meta.name;
  header.sceneIndex.textContent = `Scene ${state.sceneIndex + 1} of 3 · Par ${meta.par}`;
  const left = world.remaining();
  header.toFind.textContent = left === 0 ? 'All found!' : `${left} to find`;
  header.timer.textContent = formatTime(state.timeLeft);
  header.timerBar.style.width = `${(state.timeLeft / SCENE_TIME) * 100}%`;
  header.timerBar.classList.toggle('low', state.timeLeft <= 30);
  header.score.textContent = `Score ${state.score}`;
  header.streak.textContent = state.streak > 1 ? `Streak ×${state.streak}` : 'Streak ×1';
  header.streak.classList.toggle('hot', state.streak >= 3);
  header.hintBtn.textContent = `Hint (${state.hints})`;
  header.hintBtn.disabled = state.hints === 0 || state.sceneDone || state.gameDone;

  const diffs = DIFFS[state.sceneId];
  header.dots.innerHTML = '';
  for (const diff of diffs) {
    const dot = document.createElement('span');
    dot.className = `dot${state.found.has(diff.id) ? ' found' : ''}`;
    dot.textContent = state.found.has(diff.id) ? '✓' : '';
    dot.title = diff.label;
    header.dots.appendChild(dot);
  }
  const foundLabels = diffs.filter((diff) => state.found.has(diff.id)).map((diff) => diff.label);
  header.foundList.textContent = foundLabels.length === 0
    ? 'Nothing found yet — look close, the differences are fair but shy.'
    : `Found: ${foundLabels.join(' · ')}`;

  for (const button of document.querySelectorAll('.scene-btn')) {
    button.classList.toggle('active', Number(button.dataset.scene) === state.sceneIndex);
  }
}

function showOverlay(kind, title, text, buttonLabel) {
  overlayKind = kind;
  header.overlayTitle.textContent = title;
  header.overlayText.textContent = text;
  header.overlayBtn.textContent = buttonLabel;
  header.overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlayKind = null;
  header.overlay.classList.add('hidden');
}

function paint() {
  const state = world.state;
  const hint = state.hinted;
  drawPanel(leftCanvas, state.sceneId, 'left', state.found, hint, state.wrong);
  drawPanel(rightCanvas, state.sceneId, 'right', state.found, hint, state.wrong);
}

function onSceneDone() {
  if (world.state.gameDone) {
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    showOverlay(
      'gameDone',
      'All scenes complete!',
      `Total score ${world.state.score} · Best ${best} · Best streak ×${world.state.bestStreak}.`,
      'Play again',
    );
    announce(`All scenes complete. Total score ${world.state.score}.`);
  } else {
    showOverlay(
      'sceneDone',
      'Scene complete!',
      `All 7 differences found in ${SCENE_META[world.state.sceneId].name}. Time bonus banked.`,
      'Next scene',
    );
    announce('Scene complete. All 7 differences found.');
  }
}

function onTimeUp() {
  showOverlay(
    'timeUp',
    "Time's up",
    `${world.remaining()} difference${world.remaining() === 1 ? ' was' : 's were'} still hiding in ${SCENE_META[world.state.sceneId].name}.`,
    'Retry scene',
  );
  announce(`Time's up. ${world.remaining()} differences left.`);
}

function overlayAction() {
  if (overlayKind === 'paused') {
    world.state.paused = false;
    hideOverlay();
    announce('Playing.');
  } else if (overlayKind === 'sceneDone') {
    hideOverlay();
    world.nextScene();
    announce(`Scene ${world.state.sceneIndex + 1}: ${SCENE_META[world.state.sceneId].name}.`);
  } else if (overlayKind === 'timeUp') {
    hideOverlay();
    world.restart();
    announce('Scene restarted.');
  } else if (overlayKind === 'gameDone') {
    hideOverlay();
    world.restartAll();
    announce('New game. Find the differences.');
  }
}

function runShot(name) {
  const staged = stageShot(name, world);
  syncHud();
  if (staged.screen === SCREEN_DONE) onSceneDone();
  let painted = 0;
  function paintOnce() {
    paint();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paintOnce);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paintOnce);
}

function runGame() {
  const input = createInput(leftCanvas, rightCanvas);

  header.hintBtn.addEventListener('click', () => {
    const picked = world.hint();
    if (picked !== null) announce(`Hint: look near ${picked.label}.`);
  });
  el('pauseBtn').addEventListener('click', () => {
    if (!world.state.sceneDone && !world.state.gameDone && !world.state.timeUp) {
      world.state.paused = true;
      showOverlay('paused', 'Paused', 'Take a breath — the clock is stopped.', 'Resume');
      announce('Paused.');
    }
  });
  el('restartBtn').addEventListener('click', () => {
    hideOverlay();
    world.restart();
    announce('Scene restarted.');
  });
  header.overlayBtn.addEventListener('click', overlayAction);
  for (const button of document.querySelectorAll('.scene-btn')) {
    button.addEventListener('click', () => {
      hideOverlay();
      world.startScene(Number(button.dataset.scene));
      announce(`Scene ${world.state.sceneIndex + 1}: ${SCENE_META[world.state.sceneId].name}.`);
    });
  }

  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;

    const actions = input.takeActions();
    const state = world.state;

    if (actions & ACTION_PAUSE) {
      if (overlayKind === 'paused') overlayAction();
      else if (!state.sceneDone && !state.gameDone && !state.timeUp) {
        state.paused = true;
        showOverlay('paused', 'Paused', 'Take a breath — the clock is stopped.', 'Resume');
        announce('Paused.');
      }
    }
    if (actions & ACTION_CONFIRM && overlayKind !== null) overlayAction();
    if (actions & ACTION_HINT) {
      const picked = world.hint();
      if (picked !== null) announce(`Hint: look near ${picked.label}.`);
    }
    if (actions & ACTION_RESTART && !state.gameDone) {
      hideOverlay();
      world.restart();
      announce('Scene restarted.');
    }
    if (actions & ACTION_NEXT && state.sceneDone && !state.gameDone) overlayAction();
    if (actions & ACTION_SCENE_1) { hideOverlay(); world.startScene(0); }
    if (actions & ACTION_SCENE_2) { hideOverlay(); world.startScene(1); }
    if (actions & ACTION_SCENE_3) { hideOverlay(); world.startScene(2); }

    for (const click of input.takeClicks()) {
      const events = world.click(click.x, click.y, click.panel);
      if (events & EVENT_FOUND) {
        const left = world.remaining();
        announce(left === 0 ? 'Found them all!' : `Found one. ${left} to find.`);
      } else if (events & EVENT_WRONG) {
        announce(`Not that one. Five seconds lost. ${world.remaining()} to find.`);
      }
      if (events & EVENT_SCENE_DONE) onSceneDone();
    }

    const tickEvents = world.tick(dt);
    if (tickEvents & EVENT_TIME_UP) onTimeUp();

    paint();
    syncHud();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !world.state.sceneDone && !world.state.gameDone && !world.state.timeUp && overlayKind === null) {
      world.state.paused = true;
      showOverlay('paused', 'Paused', 'Take a breath — the clock is stopped.', 'Resume');
      announce('Paused.');
    }
  });

  announce('Twin Scenes. Click a difference on either picture. H hints, R restarts, P pauses.');
  syncHud();
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
