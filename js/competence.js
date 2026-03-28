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

  document.querySelectorAll('a, button, .acc-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

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

// ─── FORCE REVEAL ───
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});

// ─── ACCORDION ───
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
        if (!container.closest('.sub-acc-item') && !container.dataset.loaded) {
          loadPDF(container, container.dataset.src);
          container.dataset.loaded = 'true';
        }
      });
    }
  });
});

// ─── SUB-ACCORDION (imbriqué) ───
document.querySelectorAll('.sub-acc-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.sub-acc-item');
    const isOpen = item.classList.contains('open');

    if (isOpen) {
      item.classList.remove('open');
    } else {
      item.classList.add('open');
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
document.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.acc-item');
  if (first) {
    first.classList.add('open');
    first.querySelector('.acc-body').style.maxHeight = '9999px';
    first.querySelectorAll('.pdf-viewer-container[data-src]').forEach(container => {
      loadPDF(container, container.dataset.src);
      container.dataset.loaded = 'true';
    });
  }
});

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
        </a>`;
      container.appendChild(nav);

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
        const viewport = page.getViewport({ scale: 1.5 });
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

