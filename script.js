/* Ayesha Faisal — portfolio interactions */

const root = document.documentElement;

/* ---- headline word motion ---------------------------------------------- */
function splitWords(el) {
  const words = [];

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const outer = document.createElement('span');
          outer.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
          words.push(inner);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('w')) {
        walk(child);
      }
    });
  };

  walk(el);
  words.forEach((word, i) => { word.style.transitionDelay = (i * 42) + 'ms'; });
  el.classList.add('split');
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-split]').forEach(splitWords);
}

/* ---- scroll progress, parallax & drift ---------------------------------- */
const progress = document.querySelector('.progress');
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
const driftEl = document.querySelector('.cutwall-stage');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let ticking = false;

function paintFrame() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = (max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0) + '%';

  if (!reducedMotion) {
    const vh = window.innerHeight;

    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -240 || rect.top > vh + 240) return;
      const speed = parseFloat(el.dataset.parallax) || 14;
      const offset = (rect.top + rect.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', (offset * -speed).toFixed(1) + 'px');
    });

    if (driftEl) {
      const rect = driftEl.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - vh / 2) / vh;
      driftEl.style.setProperty('--drift', (offset * -18).toFixed(1) + 'px');
    }
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(paintFrame);
  }
}, { passive: true });
window.addEventListener('resize', paintFrame);
paintFrame();

/* ---- pointer tilt ------------------------------------------------------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--tx', (x * 7).toFixed(2) + 'deg');
      el.style.setProperty('--ty', (-y * 7).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0deg');
      el.style.setProperty('--ty', '0deg');
    });
  });
}

/* ---- mobile menu -------------------------------------------------------- */
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.site-nav, .nav');

menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));

/* ---- project filters ---------------------------------------------------- */
const filterBar = document.querySelector('.filters');
const cards = document.querySelectorAll('.project');

filterBar?.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBar.querySelectorAll('button').forEach((b) => b.classList.remove('is-on'));
    btn.classList.add('is-on');

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const show = filter === 'all' || card.dataset.tags.split(' ').includes(filter);
      card.hidden = !show;
      if (show) card.classList.add('in');
    });
  });
});

/* ---- reveal on scroll --------------------------------------------------- */
const revealables = document.querySelectorAll('.reveal');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!('IntersectionObserver' in window) || reduced) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

  revealables.forEach((el) => observer.observe(el));
}

/* ---- colour palettes ---------------------------------------------------- */
const themes = {
  paper: '#F6F1E7',
  sage: '#EEF0E5',
  blush: '#FAEDE8',
  noir: '#121110'
};
const swatches = document.querySelectorAll('[data-set-theme]');
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(name) {
  if (!themes[name]) return;
  root.dataset.theme = name;
  if (themeMeta) themeMeta.setAttribute('content', themes[name]);
  swatches.forEach((sw) => sw.setAttribute('aria-pressed', String(sw.dataset.setTheme === name)));
  try { localStorage.setItem('af-theme', name); } catch (e) { /* private mode */ }
}

swatches.forEach((sw) => sw.addEventListener('click', () => applyTheme(sw.dataset.setTheme)));

try {
  const saved = localStorage.getItem('af-theme');
  if (saved && themes[saved]) applyTheme(saved);
} catch (e) { /* ignore */ }
