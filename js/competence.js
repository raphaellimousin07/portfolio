// ─── ACCORDION ───
document.querySelectorAll('.acc-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.acc-item');
    const body = item.querySelector('.acc-body');
    const isOpen = item.classList.contains('open');

    // Ferme tous les autres
    document.querySelectorAll('.acc-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.acc-body').style.maxHeight = null;
    });

    // Ouvre celui cliqué (si pas déjà ouvert)
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// Ouvre le premier par défaut
const first = document.querySelector('.acc-item');
if (first) {
  first.classList.add('open');
  first.querySelector('.acc-body').style.maxHeight =
    first.querySelector('.acc-body').scrollHeight + 'px';
}

// ─── LIGHTBOX ───
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.screenshot-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const src = thumb.querySelector('img').src;
    lightboxImg.src = src;
    lightbox.classList.add('open');
  });
});

document.getElementById('lightbox-close')?.addEventListener('click', () => {
  lightbox.classList.remove('open');
});

lightbox?.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
