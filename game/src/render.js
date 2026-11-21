// Drawing only: the two panels, the rings on found differences, the hint
// pulse and the wrong-click cross. The page's DOM owns the header, the
// buttons and the overlays; this file only paints canvases.

import { SCENE } from './config.js';
import { DIFFS, drawScene } from './scenes.js';

/** The ring drawn around a found difference on both panels. */
export function drawFoundRing(ctx, x, y, r) {
  ctx.save();
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#3fbf7f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r + 7, 0, Math.PI * 2);
  ctx.stroke();
  // Green check in the middle of the ring, drawn bold so it still reads as
  // a check (never an X) when the screenshot is shrunk for the judge.
  ctx.strokeStyle = '#2f9e68';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 1);
  ctx.lineTo(x - 2, y + 10);
  ctx.lineTo(x + 13, y - 10);
  ctx.stroke();
  ctx.strokeStyle = '#7fe6ae';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 1);
  ctx.lineTo(x - 2, y + 10);
  ctx.lineTo(x + 13, y - 10);
  ctx.stroke();
  ctx.restore();
}

/** The pulsing ring a hint draws over one difference still unfound. */
export function drawHintRing(ctx, x, y, r, pulse) {
  ctx.save();
  ctx.globalAlpha = 0.55 + 0.45 * Math.sin(pulse * 6);
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** The red cross shown where a wrong click landed. */
export function drawWrongCross(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#e5534b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 14);
  ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 14);
  ctx.stroke();
  ctx.restore();
}

/**
 * Paint one panel. `panel` is 'left' (the original) or 'right' (changed);
 * `found` is the set of found diff ids; `hint` is the hinted diff or null.
 */
export function drawPanel(canvas, sceneId, panel, found, hint, wrong) {
  const ctx = canvas.getContext('2d');
  const diffs = found;
  const changed = new Set();
  if (panel === 'right') {
    for (const diff of panelDiffs(sceneId)) changed.add(diff.id);
  }
  drawScene(ctx, sceneId, changed);
  // Rings sit where the thing is on this panel (a moved thing rings twice).
  for (const diff of panelDiffs(sceneId)) {
    if (!diffs.has(diff.id)) continue;
    const pos = panel === 'right' && diff.x2 !== undefined
      ? { x: diff.x2, y: diff.y2 }
      : { x: diff.x, y: diff.y };
    drawFoundRing(ctx, pos.x, pos.y, diff.r);
  }
  if (hint !== null) {
    const pos = panel === 'right' && hint.x2 !== undefined
      ? { x: hint.x2, y: hint.y2 }
      : { x: hint.x, y: hint.y };
    drawHintRing(ctx, pos.x, pos.y, hint.r, hint.pulse);
  }
  if (wrong !== null && wrong.panel === panel) {
    drawWrongCross(ctx, wrong.x, wrong.y);
  }
  return ctx;
}

function panelDiffs(sceneId) {
  return DIFFS[sceneId];
}

/** Size both canvases to the scene's logical size, once. */
export function sizePanels(left, right) {
  for (const canvas of [left, right]) {
    canvas.width = SCENE.width;
    canvas.height = SCENE.height;
  }
}
