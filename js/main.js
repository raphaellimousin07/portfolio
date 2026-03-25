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
