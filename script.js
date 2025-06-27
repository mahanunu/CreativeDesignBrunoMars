// Canvas + animation
const canvas = document.getElementById('pathCanvas');
const ctx = canvas.getContext('2d');

let progress = 0;
let animationId = null;
let isAnimating = false;
let rocketImg = new Image();
let rocketLoaded = false;

// Charger l'image de la fusée
rocketImg.onload = function () {
  rocketLoaded = true;
};
rocketImg.src = 'assets/rocket.svg';

// Audio
const audio = new Audio('assets/sound/loop.mp3');
const vinyl = document.getElementById('vinyl');
const nowPlaying = document.getElementById('nowPlaying'); // <- élément ajouté

let isPlaying = false;

vinyl.addEventListener('click', () => {
  // Effet de pulse au clic
  vinyl.classList.add('vinyl-pulse');
  createVinylParticles();

  if (!isPlaying) {
    audio.loop = true;
    audio.play();
    vinyl.classList.add('vinyl-spin'); // Démarrer la rotation
    nowPlaying.classList.add('active'); // Afficher "Now Playing"

    if (!isAnimating) {
      startAnimation();
    }
  } else {
    audio.pause();
    vinyl.classList.remove('vinyl-spin'); // Arrêter la rotation
    nowPlaying.classList.remove('active'); // Masquer "Now Playing"
  }

  isPlaying = !isPlaying;

  setTimeout(() => {
    vinyl.classList.remove('vinyl-pulse');
  }, 600);
});

function createVinylParticles() {
  const vinylRect = vinyl.getBoundingClientRect();
  const centerX = vinylRect.left + vinylRect.width / 2;
  const centerY = vinylRect.top + vinylRect.height / 2;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'vinyl-particle';

    const angle = (i * 30) * Math.PI / 180;
    const radius = 120 + Math.random() * 40;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.animationDelay = (i * 0.05) + 's';

    document.body.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }

  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'vinyl-wave';
    wave.style.left = centerX + 'px';
    wave.style.top = centerY + 'px';
    wave.style.animationDelay = (i * 0.2) + 's';

    document.body.appendChild(wave);

    setTimeout(() => {
      if (wave.parentNode) {
        wave.parentNode.removeChild(wave);
      }
    }, 1500);
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  clearCanvas();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startAnimation() {
  if (!isAnimating) {
    progress = 0;
    isAnimating = true;
    animatePath();
  }
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isAnimating = false;
}

function getBezierXY(t, p0, p1, p2, p3) {
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const x = ax * t ** 3 + bx * t ** 2 + cx * t + p0.x;
  const y = ay * t ** 3 + by * t ** 2 + cy * t + p0.y;

  return { x, y };
}

function getBezierTangent(t, p0, p1, p2, p3) {
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const dx = 3 * ax * t * t + 2 * bx * t + cx;
  const dy = 3 * ay * t * t + 2 * by * t + cy;

  return { x: dx, y: dy };
}

function animatePath() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const p0 = { x: w * 0.1, y: h };
  const p1 = { x: w * 0.25, y: h * 0.65 };
  const p2 = { x: w * 0.75, y: h * 0.35 };
  const p3 = { x: w * 0.6, y: 0 };

  ctx.strokeStyle = '#fbf0c3';
  ctx.lineWidth = 80;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);

  for (let t = 0; t <= progress; t += 0.01) {
    const pos = getBezierXY(t, p0, p1, p2, p3);
    ctx.lineTo(pos.x, pos.y);
  }
  ctx.stroke();

  if (rocketLoaded && progress <= 1) {
    const pos = getBezierXY(progress, p0, p1, p2, p3);
    const tangent = getBezierTangent(progress, p0, p1, p2, p3);

    if (tangent.x !== 0 || tangent.y !== 0) {
      const length = Math.sqrt(tangent.x ** 2 + tangent.y ** 2);
      const offset = -60;

      const nx = tangent.x / length;
      const ny = tangent.y / length;

      const rocketX = pos.x - nx * offset;
      const rocketY = pos.y - ny * offset;

      const angle = Math.atan2(tangent.y, tangent.x);

      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(angle + Math.PI / 4);
      ctx.drawImage(rocketImg, -25, -25, 50, 50);
      ctx.restore();
    }
  }

  progress += 0.004;
  if (progress <= 1) {
    animationId = requestAnimationFrame(animatePath);
  } else {
    isAnimating = false;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();