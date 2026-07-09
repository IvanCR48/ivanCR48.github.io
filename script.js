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
