// Dessin du chemin animé sur la vraie courbe
const canvas = document.getElementById('pathCanvas');
const ctx = canvas.getContext('2d');

let w, h;
let progress = 0;
const speed = 0.005; // vitesse de l'animation

function resizeCanvas() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// interpolation bézier
function getBezierPoint(t, p0, p1, p2, p3) {
  const x = Math.pow(1 - t, 3) * p0.x
    + 3 * Math.pow(1 - t, 2) * t * p1.x
    + 3 * (1 - t) * Math.pow(t, 2) * p2.x
    + Math.pow(t, 3) * p3.x;

  const y = Math.pow(1 - t, 3) * p0.y
    + 3 * Math.pow(1 - t, 2) * t * p1.y
    + 3 * (1 - t) * Math.pow(t, 2) * p2.y
    + Math.pow(t, 3) * p3.y;

  return { x, y };
}

function animatePath() {
  ctx.fillStyle = '#f1b63a';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#fffbe6';
  ctx.lineWidth = 80;
  ctx.lineCap = 'round';

  ctx.beginPath();

  const p0 = { x: w * 0.1, y: h };
  const p1 = { x: w * 0.25, y: h * 0.65 };
  const p2 = { x: w * 0.75, y: h * 0.35 };
  const p3 = { x: w * 0.6, y: 0 };

  ctx.moveTo(p0.x, p0.y);

  const steps = Math.floor(progress * 100);
  for (let i = 1; i <= steps; i++) {
    const t = i / 100;
    const pt = getBezierPoint(t, p0, p1, p2, p3);
    ctx.lineTo(pt.x, pt.y);
  }

  ctx.stroke();

  if (progress < 1) {
    progress += speed;
    requestAnimationFrame(animatePath);
  }
}

animatePath();

// Audio player avec clic sur le vinyle
const audio = new Audio('assets/sound/loop.mp3');
audio.loop = true;

const vinyl = document.getElementById('vinyl');
let isPlaying = false;

vinyl.addEventListener('click', () => {
  if (!isPlaying) {
    audio.play();
    vinyl.classList.add('spinning');
  } else {
    audio.pause();
    vinyl.classList.remove('spinning');
  }
  isPlaying = !isPlaying;
});
