// ─── CURSEUR PERSONNALISÉ (desktop only) ───
if (!window.matchMedia('(pointer: coarse)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  document.body.classList.add('has-cursor');

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .skill-card, .competence-card, .stage-card, .acc-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
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

// ─── FORMULAIRE DE CONTACT ───
function handleSubmit(event) {
  event.preventDefault();
  const btn = event.target.querySelector('.btn-send');
  const originalText = btn.textContent;

  btn.textContent = "Message envoyé ! ✓";
  btn.style.background = "#10b981";

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
    event.target.reset();
  }, 3000);
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