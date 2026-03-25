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
      body.style.maxHeight = '9999px';
      // Charge les PDF viewers dans cet onglet
      item.querySelectorAll('.pdf-viewer-container[data-src]').forEach(container => {
        if (!container.dataset.loaded) {
          loadPDF(container, container.dataset.src);
          container.dataset.loaded = 'true';
        }
      });
    }
  });
});

// Ouvre le premier par défaut
const first = document.querySelector('.acc-item');
if (first) {
  first.classList.add('open');
  first.querySelector('.acc-body').style.maxHeight = '9999px';
  // Charge les PDF du premier onglet
  first.querySelectorAll('.pdf-viewer-container[data-src]').forEach(container => {
    loadPDF(container, container.dataset.src);
    container.dataset.loaded = 'true';
  });
}

// ─── PDF.JS VIEWER ───
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
  // Affiche un loader
  container.innerHTML = `
    <div class="pdf-loading">
      <div class="pdf-spinner"></div>
      <span>Chargement du PDF…</span>
    </div>`;

  loadPDFJS(() => {
    pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc => {
      container.innerHTML = '';
      const totalPages = pdfDoc.numPages;

      // Barre de navigation
      const nav = document.createElement('div');
      nav.className = 'pdf-nav';
      nav.innerHTML = `
        <button class="pdf-nav-btn" id="prev-${container.id}">‹ Préc.</button>
        <span class="pdf-nav-info">Page <span id="page-num-${container.id}">1</span> / ${totalPages}</span>
        <button class="pdf-nav-btn" id="next-${container.id}">Suiv. ›</button>
        <a href="${pdfUrl}" download class="pdf-nav-dl">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" width="14" height="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Télécharger
        </a>`;
      container.appendChild(nav);

      // Canvas
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      container.appendChild(canvas);

      let currentPage = 1;

      function renderPage(num) {
        pdfDoc.getPage(num).then(page => {
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          page.render({ canvasContext: ctx, viewport });
          document.getElementById(`page-num-${container.id}`).textContent = num;
          // Boutons
          document.getElementById(`prev-${container.id}`).disabled = num <= 1;
          document.getElementById(`next-${container.id}`).disabled = num >= totalPages;
        });
      }

      document.getElementById(`prev-${container.id}`).addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderPage(currentPage); }
      });
      document.getElementById(`next-${container.id}`).addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; renderPage(currentPage); }
      });

      renderPage(1);

    }).catch(() => {
      container.innerHTML = `<div class="pdf-error">Impossible de charger le PDF.</div>`;
    });
  });
}

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
