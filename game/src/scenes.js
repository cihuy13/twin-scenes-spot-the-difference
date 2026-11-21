// The three scenes: original flat-vector art, drawn twice — once plain and
// once with a set of changes applied. Every difference is fair: a thing
// removed, recoloured, moved, resized, flipped or added, never a trick of
// the light. A diff lists where to ring it on each panel (x2/y2 only when
// the thing itself moves).

export const DIFFS = {
  'kite-field': [
    { id: 'kite-colour', label: 'Kite colour', x: 380, y: 150, r: 30 },
    { id: 'bird-gone', label: 'Missing bird', x: 210, y: 100, r: 24 },
    { id: 'sun-rays', label: 'Sun rays', x: 470, y: 80, r: 40 },
    { id: 'flower-gone', label: 'Missing flower', x: 160, y: 410, r: 22 },
    { id: 'dog-spot', label: 'Dog spot', x: 470, y: 370, r: 30 },
    { id: 'tree-grown', label: 'Taller pine', x: 60, y: 280, r: 34 },
    { id: 'basket-apple', label: 'Extra apple', x: 300, y: 355, r: 26 },
  ],
  'bookshop-lane': [
    { id: 'awning-colour', label: 'Awning colour', x: 150, y: 205, r: 36 },
    { id: 'cat-gone', label: 'Missing cat', x: 430, y: 295, r: 26 },
    { id: 'umbrella-flip', label: 'Umbrella tilt', x: 262, y: 338, r: 28 },
    { id: 'book-stack', label: 'Book stack', x: 120, y: 300, r: 26 },
    { id: 'lamp-lit', label: 'Lamp glow', x: 300, y: 175, r: 30 },
    { id: 'puddle-big', label: 'Bigger puddle', x: 430, y: 400, r: 34 },
    { id: 'sign-letter', label: 'Shop sign', x: 150, y: 140, r: 30 },
  ],
  'starlight-camp': [
    { id: 'moon-phase', label: 'Moon phase', x: 110, y: 80, r: 36 },
    { id: 'star-gone', label: 'Missing star', x: 500, y: 70, r: 24 },
    { id: 'tent-colour', label: 'Tent colour', x: 170, y: 300, r: 36 },
    { id: 'fire-big', label: 'Bigger fire', x: 300, y: 355, r: 34 },
    { id: 'owl-gone', label: 'Missing owl', x: 520, y: 150, r: 26 },
    { id: 'guitar-side', label: 'Guitar moved', x: 140, y: 375, r: 28, x2: 470, y2: 375 },
    { id: 'mug-added', label: 'Extra mug', x: 275, y: 395, r: 22 },
  ],
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 16 * s); ctx.fill();
  circle(ctx, x + 18 * s, y - 6 * s, 20 * s); ctx.fill();
  circle(ctx, x + 40 * s, y, 15 * s); ctx.fill();
  ctx.fillRect(x - 14 * s, y, 68 * s, 14 * s);
}

function bird(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.quadraticCurveTo(x - 4, y - 8, x, y);
  ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
  ctx.stroke();
}

function pine(ctx, x, baseY, h, color) {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x - 4, baseY - 14, 8, 14);
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i += 1) {
    const w = 44 - i * 11;
    const y = baseY - 14 - i * (h / 3.4);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h / 3.4);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w / 2, y + h / 3.4);
    ctx.closePath();
    ctx.fill();
  }
}

function flower(ctx, x, y, petal, centre) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5);
    ctx.fill();
  }
  ctx.fillStyle = centre;
  circle(ctx, x, y, 5); ctx.fill();
  ctx.strokeStyle = '#3e7d32';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 16); ctx.stroke();
}

// --- Scene 1: Kite Field at Dawn -------------------------------------------

function drawKiteField(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.55, '#ffb877');
  sky.addColorStop(1, '#ffe9c4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);

  // Sun, with rays in the original only.
  ctx.fillStyle = '#f7b733';
  circle(ctx, 470, 80, 34); ctx.fill();
  if (!changed.has('sun-rays')) {
    ctx.strokeStyle = '#f7b733';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(470 + Math.cos(a) * 42, 80 + Math.sin(a) * 42);
      ctx.lineTo(470 + Math.cos(a) * 54, 80 + Math.sin(a) * 54);
      ctx.stroke();
    }
  }

  cloud(ctx, 60, 70, 1, '#fff7e8');
  cloud(ctx, 250, 45, 0.8, '#fff7e8');
  cloud(ctx, 400, 140, 0.7, '#ffe9c4');
  bird(ctx, 150, 120, '#5a4632');
  if (!changed.has('bird-gone')) bird(ctx, 210, 100, '#5a4632');
  bird(ctx, 330, 130, '#5a4632');

  // Butterflies, the same on both panels: small life that makes the field
  // worth a second look without hiding any difference.
  for (const [bx, by, wing] of [[250, 225, '#ff7b9c'], [525, 235, '#b388ff']]) {
    ctx.fillStyle = wing;
    circle(ctx, bx - 6, by, 6); ctx.fill();
    circle(ctx, bx + 6, by, 6); ctx.fill();
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(bx - 1, by - 5, 2, 10);
  }

  // Rolling hills and grass.
  ctx.fillStyle = '#8fce6e';
  ctx.beginPath(); ctx.ellipse(140, 470, 260, 150, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7cbf5e';
  ctx.beginPath(); ctx.ellipse(480, 480, 280, 160, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8fce6e';
  ctx.fillRect(0, 330, 600, 110);

  // Pine trees; the left one grows taller in the changed picture.
  pine(ctx, 60, 340, changed.has('tree-grown') ? 118 : 88, '#2e7d4f');
  pine(ctx, 545, 345, 92, '#2e7d4f');
  ctx.fillStyle = '#5da24a';
  circle(ctx, 520, 340, 22); ctx.fill();
  circle(ctx, 500, 348, 16); ctx.fill();

  // Kite: red in the original, teal in the changed picture.
  ctx.fillStyle = changed.has('kite-colour') ? '#2a9d8f' : '#e63946';
  ctx.beginPath();
  ctx.moveTo(380, 118); ctx.lineTo(408, 150); ctx.lineTo(380, 182); ctx.lineTo(352, 150);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(352, 150); ctx.lineTo(408, 150); ctx.stroke();
  ctx.strokeStyle = '#5a4632';
  ctx.beginPath(); ctx.moveTo(380, 182); ctx.quadraticCurveTo(372, 210, 386, 228); ctx.stroke();
  ctx.fillStyle = '#f2c94c';
  circle(ctx, 378, 200, 5); ctx.fill();
  circle(ctx, 384, 218, 5); ctx.fill();

  // Picnic blanket, basket and apples; one apple is added in the change.
  ctx.fillStyle = '#fff';
  rr(ctx, 230, 350, 120, 48, 6); ctx.fill();
  ctx.fillStyle = '#e63946';
  ctx.fillRect(230, 350, 30, 24); ctx.fillRect(290, 350, 30, 24);
  ctx.fillRect(260, 374, 30, 24); ctx.fillRect(320, 374, 30, 24);
  ctx.fillStyle = '#8b5a2b';
  rr(ctx, 245, 330, 44, 24, 5); ctx.fill();
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(267, 330, 12, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#e63946';
  circle(ctx, 258, 326, 6); ctx.fill();
  circle(ctx, 276, 326, 6); ctx.fill();
  if (changed.has('basket-apple')) {
    circle(ctx, 300, 356, 7); ctx.fill();
    ctx.fillStyle = '#3e7d32';
    ctx.fillRect(298, 346, 3, 6);
  }

  // Dog with a spot in the original, plain in the changed picture.
  ctx.fillStyle = '#c98f4e';
  rr(ctx, 440, 358, 58, 26, 12); ctx.fill();
  circle(ctx, 492, 360, 13); ctx.fill();
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath(); ctx.moveTo(502, 350); ctx.lineTo(508, 338); ctx.lineTo(512, 352); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(486, 348); ctx.lineTo(490, 336); ctx.lineTo(494, 350); ctx.closePath(); ctx.fill();
  if (!changed.has('dog-spot')) {
    ctx.fillStyle = '#8b5a2b';
    circle(ctx, 462, 368, 8); ctx.fill();
  }
  ctx.fillStyle = '#231a04';
  circle(ctx, 497, 357, 2); ctx.fill();

  // Flowers; the middle one is gone in the changed picture.
  flower(ctx, 120, 400, '#ff7b9c', '#f2c94c');
  if (!changed.has('flower-gone')) flower(ctx, 160, 410, '#ffffff', '#f2c94c');
  flower(ctx, 520, 400, '#ff7b9c', '#f2c94c');
  flower(ctx, 200, 418, '#b388ff', '#f2c94c');
}

// --- Scene 2: Bookshop Lane in the Rain ------------------------------------

function drawBookshopLane(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#8fa3b8');
  sky.addColorStop(1, '#c8d3de');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);
  cloud(ctx, 70, 55, 1, '#e8edf1');
  cloud(ctx, 380, 40, 0.9, '#e8edf1');

  // Bookshop (left) and neighbour house (right).
  ctx.fillStyle = '#f3e5c3';
  ctx.fillRect(40, 120, 220, 200);
  ctx.fillStyle = '#c96f4a';
  ctx.fillRect(340, 140, 200, 180);
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(40, 100, 220, 20);
  ctx.fillRect(340, 120, 200, 20);

  // Shop sign: BOOKS in the original, BOOK in the changed picture.
  ctx.fillStyle = '#2b3a4a';
  rr(ctx, 90, 128, 120, 34, 6); ctx.fill();
  ctx.fillStyle = '#f4f1e6';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(changed.has('sign-letter') ? 'BOOK' : 'BOOKS', 150, 146);

  // Awning: red stripes in the original, blue in the changed picture.
  const stripe = changed.has('awning-colour') ? '#3a6ea5' : '#c0392b';
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? stripe : '#fff';
    ctx.fillRect(60 + i * 33, 185, 33, 34);
  }
  ctx.fillStyle = '#2b3a4a';
  ctx.fillRect(60, 185, 198, 4);

  // Bookshop window with a stack of books: three in the original, two after.
  ctx.fillStyle = '#bfe3ec';
  ctx.fillRect(80, 240, 90, 80);
  ctx.strokeStyle = '#2b3a4a';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 240, 90, 80);
  const bookColors = ['#e63946', '#2a9d8f', '#f2c94c'];
  const bookCount = changed.has('book-stack') ? 2 : 3;
  for (let i = 0; i < bookCount; i += 1) {
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(88, 296 - i * 10, 54, 9);
  }
  // Door with a round window.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(200, 250, 44, 70);
  ctx.fillStyle = '#f2c94c';
  circle(ctx, 222, 272, 8); ctx.fill();

  // Neighbour window; a cat sits on its sill in the original only.
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(380, 200, 70, 70);
  ctx.strokeStyle = '#2b3a4a';
  ctx.lineWidth = 3;
  ctx.strokeRect(380, 200, 70, 70);
  ctx.beginPath(); ctx.moveTo(415, 200); ctx.lineTo(415, 270); ctx.stroke();
  if (!changed.has('cat-gone')) {
    ctx.fillStyle = '#3d3d3d';
    rr(ctx, 405, 252, 34, 18, 8); ctx.fill();
    circle(ctx, 432, 248, 9); ctx.fill();
    ctx.beginPath(); ctx.moveTo(428, 240); ctx.lineTo(430, 232); ctx.lineTo(434, 240); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(436, 240); ctx.lineTo(439, 232); ctx.lineTo(441, 241); ctx.closePath(); ctx.fill();
  }

  // Street lamp between the buildings; its glow is the difference.
  ctx.fillStyle = '#2b3a4a';
  ctx.fillRect(297, 200, 6, 120);
  ctx.fillStyle = '#2b3a4a';
  circle(ctx, 300, 172, 10); ctx.fill();
  if (!changed.has('lamp-lit')) {
    ctx.fillStyle = 'rgba(242, 201, 76, 0.35)';
    circle(ctx, 300, 175, 26); ctx.fill();
    ctx.fillStyle = '#f2c94c';
    circle(ctx, 300, 175, 8); ctx.fill();
  }

  // Umbrella by the door, leaning left in the original, right after.
  const tilt = changed.has('umbrella-flip') ? 1 : -1;
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(262, 320); ctx.lineTo(262 + tilt * 14, 372); ctx.stroke();
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(262 + tilt * 7, 322, 26, Math.PI, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.moveTo(262 + tilt * 7, 296); ctx.lineTo(262 + tilt * 7, 322); ctx.stroke();

  // Cobblestones, puddles and rain.
  ctx.fillStyle = '#9aa5ad';
  ctx.fillRect(0, 320, 600, 120);
  ctx.strokeStyle = '#7e8b94';
  ctx.lineWidth = 2;
  for (let y = 340; y < 440; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
  }
  ctx.fillStyle = '#7fb3d5';
  ctx.beginPath();
  ctx.ellipse(430, 400, changed.has('puddle-big') ? 62 : 40, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8c8dc';
  ctx.beginPath(); ctx.ellipse(120, 415, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i += 1) {
    const x = 30 + i * 42;
    const y = 60 + ((i * 53) % 220);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 14); ctx.stroke();
  }
}

// --- Scene 3: Starlight Campsite -------------------------------------------

function drawStarlightCamp(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#0d1330');
  sky.addColorStop(0.6, '#1d2b53');
  sky.addColorStop(1, '#2c3a67');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);

  // Stars; one bright star is gone in the changed picture.
  ctx.fillStyle = '#fff';
  const stars = [[60, 60], [180, 40], [260, 90], [340, 50], [420, 110], [560, 40], [300, 130], [150, 130], [460, 160]];
  for (const [x, y] of stars) {
    circle(ctx, x, y, 2.5); ctx.fill();
  }
  if (!changed.has('star-gone')) {
    ctx.fillStyle = '#ffe9a8';
    circle(ctx, 500, 70, 5); ctx.fill();
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(500, 58); ctx.lineTo(500, 82); ctx.moveTo(488, 70); ctx.lineTo(512, 70);
    ctx.stroke();
  }

  // Moon: full in the original, crescent in the changed picture.
  ctx.fillStyle = '#fdf6d8';
  circle(ctx, 110, 80, 30); ctx.fill();
  if (changed.has('moon-phase')) {
    ctx.fillStyle = '#1d2b53';
    circle(ctx, 122, 74, 26); ctx.fill();
  }

  // Mountains and pines.
  ctx.fillStyle = '#16213e';
  ctx.beginPath();
  ctx.moveTo(0, 300); ctx.lineTo(120, 200); ctx.lineTo(240, 300);
  ctx.lineTo(360, 190); ctx.lineTo(480, 300); ctx.lineTo(600, 220); ctx.lineTo(600, 440); ctx.lineTo(0, 440);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0f2a1e';
  ctx.fillRect(0, 300, 600, 140);
  pine(ctx, 40, 330, 80, '#1d4d33');
  pine(ctx, 565, 335, 88, '#1d4d33');
  pine(ctx, 510, 320, 60, '#1d4d33');

  // Owl on a branch; gone in the changed picture.
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(480, 165); ctx.lineTo(560, 150); ctx.stroke();
  if (!changed.has('owl-gone')) {
    ctx.fillStyle = '#8b5a2b';
    circle(ctx, 520, 140, 14); ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, 515, 136, 4); ctx.fill();
    circle(ctx, 525, 136, 4); ctx.fill();
    ctx.fillStyle = '#231a04';
    circle(ctx, 515, 136, 2); ctx.fill();
    circle(ctx, 525, 136, 2); ctx.fill();
  }

  // Tents: the left one is orange in the original, green after.
  ctx.fillStyle = changed.has('tent-colour') ? '#2e7d4f' : '#e67e22';
  ctx.beginPath();
  ctx.moveTo(110, 360); ctx.lineTo(170, 280); ctx.lineTo(230, 360);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3d2b1f';
  ctx.beginPath();
  ctx.moveTo(158, 360); ctx.lineTo(170, 330); ctx.lineTo(182, 360);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.moveTo(380, 360); ctx.lineTo(440, 285); ctx.lineTo(500, 360);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3d2b1f';
  ctx.beginPath();
  ctx.moveTo(428, 360); ctx.lineTo(440, 332); ctx.lineTo(452, 360);
  ctx.closePath(); ctx.fill();

  // Campfire: a bigger flame and an extra log in the changed picture.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(270, 368, 60, 10);
  ctx.save();
  ctx.translate(300, 372);
  ctx.rotate(0.5);
  ctx.fillRect(-30, -5, 60, 10);
  ctx.restore();
  if (changed.has('fire-big')) {
    ctx.save();
    ctx.translate(300, 372);
    ctx.rotate(-0.5);
    ctx.fillRect(-30, -5, 60, 10);
    ctx.restore();
  }
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(300, 330);
  ctx.quadraticCurveTo(282, 356, 288, 372);
  ctx.quadraticCurveTo(300, 362, 312, 372);
  ctx.quadraticCurveTo(318, 356, 300, 330);
  ctx.fill();
  if (changed.has('fire-big')) {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(300, 318);
    ctx.quadraticCurveTo(290, 348, 294, 366);
    ctx.quadraticCurveTo(300, 358, 306, 366);
    ctx.quadraticCurveTo(310, 348, 300, 318);
    ctx.fill();
  }

  // Guitar leaning on the left log in the original, the right log after.
  const gx = changed.has('guitar-side') ? 470 : 140;
  ctx.fillStyle = '#c98f4e';
  circle(ctx, gx, 388, 14); ctx.fill();
  ctx.fillRect(gx - 4, 356, 8, 26);
  ctx.fillStyle = '#6b4a2f';
  circle(ctx, gx, 388, 6); ctx.fill();

  // Backpack and, in the changed picture, an extra mug beside it.
  ctx.fillStyle = '#7d5ba6';
  rr(ctx, 240, 372, 34, 30, 8); ctx.fill();
  ctx.fillStyle = '#5b3f7d';
  rr(ctx, 250, 360, 14, 12, 5); ctx.fill();
  if (changed.has('mug-added')) {
    ctx.fillStyle = '#e63946';
    rr(ctx, 282, 384, 14, 16, 3); ctx.fill();
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(298, 392, 5, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }
}

/** Draw one scene. `changed` is the set of diff ids applied to this panel. */
export function drawScene(ctx, sceneId, changed) {
  ctx.save();
  ctx.clearRect(0, 0, 600, 440);
  if (sceneId === 'kite-field') drawKiteField(ctx, changed);
  else if (sceneId === 'bookshop-lane') drawBookshopLane(ctx, changed);
  else drawStarlightCamp(ctx, changed);
  ctx.restore();
}
