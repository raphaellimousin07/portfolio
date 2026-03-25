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
