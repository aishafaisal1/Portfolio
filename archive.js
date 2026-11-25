/* Ayesha Faisal — the archive: filtering + lightbox */

const arcFilters = document.querySelector('.arc-filters');
const arcItems = [...document.querySelectorAll('.arc-item')];
const arcEmpty = document.querySelector('.arc-empty');

/* ---- folder filters ----------------------------------------------------- */
const inFolder = (item, folder) =>
  folder === 'all' || item.dataset.cat.split(' ').includes(folder);

/* keep the counts on the chips honest, whatever gets added later */
arcFilters?.querySelectorAll('button').forEach((btn) => {
  const small = btn.querySelector('[data-count]');
  if (small) small.textContent = String(arcItems.filter((i) => inFolder(i, btn.dataset.filter)).length);
});

arcFilters?.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    arcFilters.querySelectorAll('button').forEach((b) => b.classList.remove('is-on'));
    btn.classList.add('is-on');

    const filter = btn.dataset.filter;
    let shown = 0;

    arcItems.forEach((item) => {
      const show = inFolder(item, filter);
      item.hidden = !show;
      if (show) shown += 1;
    });

    if (arcEmpty) arcEmpty.hidden = shown > 0;
  });
});

/* ---- lightbox ----------------------------------------------------------- */
const lb = document.getElementById('lb');
const lbImg = lb?.querySelector('.lb-img');
const lbVideo = lb?.querySelector('.lb-video');
const lbCap = lb?.querySelector('.lb-cap');
let lastFocus = null;

function openLightbox(item) {
  if (!lb) return;
  const kind = item.dataset.kind;
  const src = item.getAttribute('href');

  lbImg.hidden = true;
  lbImg.removeAttribute('src');
  lbVideo.hidden = true;
  lbVideo.innerHTML = '';

  if (kind === 'video') {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    lbVideo.appendChild(video);
    lbVideo.hidden = false;
  } else {
    lbImg.src = src;
    lbImg.alt = item.querySelector('img')?.alt || item.dataset.title || '';
    lbImg.hidden = false;
  }

  lbCap.textContent = item.dataset.title || '';
  lb.hidden = false;
  document.body.classList.add('lb-open');
  lastFocus = document.activeElement;
  lb.querySelector('.lb-close')?.focus();
}

function closeLightbox() {
  if (!lb || lb.hidden) return;
  lb.hidden = true;
  document.body.classList.remove('lb-open');
  if (lbVideo) {
    lbVideo.querySelectorAll('video').forEach((v) => v.pause());
    lbVideo.innerHTML = '';
  }
  lastFocus?.focus?.();
}

arcItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    openLightbox(item);
  });
});

lb?.addEventListener('click', (event) => {
  if (event.target === lb || event.target.closest('.lb-close')) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
