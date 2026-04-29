const deck    = document.getElementById('deck');
const bar     = document.getElementById('progress-bar');
const counter = document.getElementById('slide-counter');
const hint    = document.getElementById('nav-hint');
const slides  = Array.from(document.querySelectorAll('.slide'));
const total   = slides.length;

let current = 0;
let locked  = false;

function update() {
  counter.textContent = `${current + 1} / ${total}`;
  bar.style.width     = `${((current + 1) / total) * 100}%`;
}

function goTo(n) {
  if (n >= total) n = 0;
  if (n < 0) n = total - 1;
  if (n === current || locked) return;
  locked  = true;
  current = n;
  deck.scrollTo({ top: current * window.innerHeight, behavior: 'smooth' });
  update();
  setTimeout(() => { locked = false; }, 700);
}

// Keyboard: Space / ArrowRight / ArrowDown → next; ArrowLeft / ArrowUp → prev
document.addEventListener('keydown', e => {
  if (['Space', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
    e.preventDefault();
    goTo(current + 1);
  } else if (['ArrowLeft', 'ArrowUp'].includes(e.code)) {
    e.preventDefault();
    goTo(current - 1);
  }
});

// Click: right half → next, left half → prev (skip link clicks)
document.addEventListener('click', e => {
  if (e.target.closest('a')) return;
  goTo(e.clientX > window.innerWidth / 2 ? current + 1 : current - 1);
});

// Keep counter in sync when user scrolls manually
deck.addEventListener('scroll', () => {
  if (locked) return;
  const idx = Math.round(deck.scrollTop / window.innerHeight);
  if (idx !== current) {
    current = idx;
    update();
  }
}, { passive: true });

// Fade nav hint after 4 s
setTimeout(() => { hint.style.opacity = '0'; }, 4000);

update();
