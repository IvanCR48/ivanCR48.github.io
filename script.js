/* ============================================
   Study Portal — Minimal Interactivity
   ============================================ */

// --- System Clock ---
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${h}:${m}:${s}`;
}

setInterval(updateClock, 1000);
updateClock();

// --- Dynamic Year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Titlebar Button Hover Feedback ---
document.querySelectorAll('.window__titlebar-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.background = '#e0e0e0';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = '';
  });
});

// --- Argentina vs Spain Countdown Timer ---
function updateCountdown() {
  const targetDate = new Date("2026-07-19T16:00:00-03:00");
  const now = new Date();
  const diff = targetDate - now;

  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-minutes');
  const secsEl = document.getElementById('timer-seconds');
  const matchStatusEl = document.getElementById('match-status');

  if (diff <= 0) {
    if (daysEl) daysEl.textContent = '00';
    if (hoursEl) hoursEl.textContent = '00';
    if (minsEl) minsEl.textContent = '00';
    if (secsEl) secsEl.textContent = '00';
    if (matchStatusEl) matchStatusEl.textContent = '¡PARTIDO EN VIVO!';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
  if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  if (matchStatusEl) matchStatusEl.textContent = 'Mundial 2026 - Semifinal';
}

setInterval(updateCountdown, 1000);
updateCountdown();

