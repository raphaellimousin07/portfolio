// ─── CURSEUR PERSONNALISÉ (desktop only) ───
let cursor = null;
if (!window.matchMedia('(pointer: coarse)').matches) {
  cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  document.body.classList.add('has-cursor');
  document.documentElement.style.cursor = 'none';

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .skill-card, .competence-card, .stage-card, .acc-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

// ─── MIDDLE CLICK AUTO-SCROLL ───
{
  let active = false, originY = 0, curY = 0, originEl = null, raf = null;

  // Capture phase : empêche le curseur natif du navigateur
  window.addEventListener('mousedown', e => {
    if (e.button === 1) e.preventDefault();
  }, { passive: false, capture: true });

  document.addEventListener('mousedown', e => {
    if (e.button !== 1) { if (active) stop(); return; }
    e.preventDefault();
    active ? stop() : start(e);
  }, { passive: false });

  document.addEventListener('mousemove', e => { if (active) curY = e.clientY; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) stop(); });

  function start(e) {
    active = true;
    originY = curY = e.clientY;
    originEl = document.createElement('div');
    originEl.className = 'mid-scroll-origin';
    originEl.style.left = e.clientX + 'px';
    originEl.style.top  = e.clientY + 'px';
    document.body.appendChild(originEl);
    document.body.style.cursor = 'none';
    cursor?.classList.add('mid-scroll');
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    active = false;
    cancelAnimationFrame(raf);
    originEl?.remove(); originEl = null;
    document.body.style.cursor = '';
    cursor?.classList.remove('mid-scroll');
  }

  function loop() {
    if (!active) return;
    const delta = (curY - originY) * 0.055;
    if (Math.abs(delta) > 0.3) window.scrollBy({ top: delta, behavior: 'instant' });
    raf = requestAnimationFrame(loop);
  }
}

// ─── SPOTLIGHT HOVER ───
document.querySelectorAll('.skill-card, .competence-card, .stage-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
    card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

// ─── HAMBURGER NAV ───
const burger = document.querySelector('.nav-burger');
const navEl  = document.querySelector('nav');
const navLinks = document.querySelector('.nav-links');

if (burger) {
  burger.addEventListener('click', () => {
    navEl.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navEl.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

reveals.forEach(reveal => observer.observe(reveal));

// ─── FORMULAIRE DE CONTACT (EmailJS) ───
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.btn-send');

  btn.textContent = 'Envoi en cours…';
  btn.disabled = true;

  emailjs.send('service_7ij6y9h', 'template_6jdh3q4', {
    from_name: form.from_name.value,
    name:      form.from_name.value,
    email:     form.email.value,
    message:   form.message.value,
  }, { publicKey: 'ur9uIFJO2PmLispN9' }).then(() => {
    btn.textContent = 'Message envoyé ! ✓';
    btn.style.background = '#10b981';
    form.reset();
    setTimeout(() => {
      btn.textContent = 'Envoyer le message →';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }).catch(() => {
    btn.textContent = 'Erreur — réessaie';
    btn.style.background = '#ef4444';
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = 'Envoyer le message →';
      btn.style.background = '';
    }, 3000);
  });
}

// ─── ONGLETS PDF ───
function switchTab(event, tabId) {
  // Désactiver tous les onglets et panels
  document.querySelectorAll('.pdf-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pdf-panel').forEach(p => p.classList.remove('active'));

  // Activer l'onglet cliqué et son panel
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ─── ACCORDION + PDF VIEWER (index) ───
document.querySelectorAll('.acc-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.acc-item');
    const body = item.querySelector('.acc-body');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.acc-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.acc-body').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = '9999px';
      item.querySelectorAll('.pdf-viewer-container[data-src]').forEach(container => {
        if (!container.dataset.loaded) {
          loadPDF(container, container.dataset.src);
          container.dataset.loaded = 'true';
        }
      });
    }
  });
});

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

function loadPDFJS(callback) {
  if (window.pdfjsLib) { callback(); return; }
  const script = document.createElement('script');
  script.src = PDFJS_CDN;
  script.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    callback();
  };
  document.head.appendChild(script);
}

function loadPDF(container, pdfUrl) {
  container.innerHTML = `
    <div class="pdf-loading">
      <div class="pdf-spinner"></div>
      <span>Chargement du PDF…</span>
    </div>`;

  loadPDFJS(async () => {
    try {
      const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      container.innerHTML = '';
      const totalPages = pdfDoc.numPages;
      let currentPage = 1;

      const isModal = container.id === 'pdf-modal-viewer';
      const nav = document.createElement('div');
      nav.className = 'pdf-nav';
      nav.innerHTML = `
        <button class="pdf-nav-btn" id="prev-${container.id}" disabled>‹ Préc.</button>
        <span class="pdf-nav-info">Page <span id="page-num-${container.id}">1</span> / ${totalPages}</span>
        <button class="pdf-nav-btn" id="next-${container.id}" ${totalPages <= 1 ? 'disabled' : ''}>Suiv. ›</button>
        <div class="pdf-zoom-group">
          <button class="pdf-nav-btn" id="zoom-out-${container.id}">−</button>
          <span class="pdf-zoom-level" id="zoom-level-${container.id}">100%</span>
          <button class="pdf-nav-btn" id="zoom-in-${container.id}">+</button>
        </div>
        <a href="${pdfUrl}" download class="pdf-nav-dl">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Télécharger
        </a>
        ${!isModal ? `<button class="pdf-expand-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>Plein écran</button>` : ''}`;
      container.appendChild(nav);
      if (!isModal) nav.querySelector('.pdf-expand-btn').addEventListener('click', () => openPDFModal(pdfUrl));

      const pagesWrapper = document.createElement('div');
      pagesWrapper.className = 'pdf-pages';
      container.appendChild(pagesWrapper);

      let zoomLevel = 1;
      const applyZoom = () => {
        pagesWrapper.style.zoom = zoomLevel;
        document.getElementById(`zoom-level-${container.id}`).textContent = Math.round(zoomLevel * 100) + '%';
        document.getElementById(`zoom-out-${container.id}`).disabled = zoomLevel <= 0.5;
        document.getElementById(`zoom-in-${container.id}`).disabled = zoomLevel >= 3.0;
      };
      document.getElementById(`zoom-out-${container.id}`).addEventListener('click', () => {
        zoomLevel = Math.max(0.5, +(zoomLevel - 0.25).toFixed(2)); applyZoom();
      });
      document.getElementById(`zoom-in-${container.id}`).addEventListener('click', () => {
        zoomLevel = Math.min(3.0, +(zoomLevel + 0.25).toFixed(2)); applyZoom();
      });

      const canvases = [];

      const observer = new IntersectionObserver(entries => {
        let best = null, bestRatio = 0;
        entries.forEach(e => { if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target; } });
        if (best) {
          currentPage = parseInt(best.dataset.page);
          document.getElementById(`page-num-${container.id}`).textContent = currentPage;
          document.getElementById(`prev-${container.id}`).disabled = currentPage <= 1;
          document.getElementById(`next-${container.id}`).disabled = currentPage >= totalPages;
        }
      }, { root: pagesWrapper, threshold: [0.25, 0.5, 0.75] });

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: isModal ? 2.0 : 1.5 });
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas';
        canvas.dataset.page = i;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pagesWrapper.appendChild(canvas);
        canvases.push(canvas);
        observer.observe(canvas);
        page.render({ canvasContext: canvas.getContext('2d'), viewport });
      }

      const scrollToCanvas = c => {
        const top = c.getBoundingClientRect().top - pagesWrapper.getBoundingClientRect().top + pagesWrapper.scrollTop;
        pagesWrapper.scrollTo({ top, behavior: 'smooth' });
      };

      document.getElementById(`prev-${container.id}`).addEventListener('click', () => {
        if (currentPage > 1) scrollToCanvas(canvases[currentPage - 2]);
      });
      document.getElementById(`next-${container.id}`).addEventListener('click', () => {
        if (currentPage < totalPages) scrollToCanvas(canvases[currentPage]);
      });

    } catch {
      container.innerHTML = `<div class="pdf-error">Impossible de charger le PDF.</div>`;
    }
  });
}

// ─── PDF MODAL PLEIN ÉCRAN ───
function openPDFModal(pdfUrl) {
  if (!document.getElementById('pdf-modal')) {
    const modal = document.createElement('div');
    modal.id = 'pdf-modal';
    modal.innerHTML = `
      <div class="pdf-modal-backdrop"></div>
      <div class="pdf-modal-inner">
        <button class="pdf-modal-close" title="Fermer (Échap)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="pdf-viewer-container" id="pdf-modal-viewer"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.pdf-modal-backdrop').addEventListener('click', closePDFModal);
    modal.querySelector('.pdf-modal-close').addEventListener('click', closePDFModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePDFModal(); });
  }
  const viewer = document.getElementById('pdf-modal-viewer');
  viewer.innerHTML = '';
  delete viewer.dataset.loaded;
  document.getElementById('pdf-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  loadPDF(viewer, pdfUrl);
}

function closePDFModal() {
  const modal = document.getElementById('pdf-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

document.querySelectorAll('.sub-acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const item = trigger.parentElement;
        item.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // On sélectionne tous les déclencheurs de sous-menus
    const subTriggers = document.querySelectorAll('.sub-acc-trigger');

    subTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // Empêche l'événement de remonter au menu parent
            e.stopPropagation(); 
            
            const parent = trigger.parentElement; // Le .sub-acc-item
            
            // On bascule la classe 'active'
            parent.classList.toggle('active');

            // Optionnel : Fermer les autres PDF quand on en ouvre un
            subTriggers.forEach(other => {
                if (other !== trigger) {
                    other.parentElement.classList.remove('active');
                }
            });
        });
    });
});

// Easter egg dans easter-egg.js (chargé séparément sur toutes les pages)
