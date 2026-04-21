// ─── EASTER EGG MULTI-PLATEFORME (PC & MOBILE) ───

// 1. Version Clavier (PC)
let easterInputSeq = "";
const easterTarget = "memento";

document.addEventListener('keydown', (e) => {
    easterInputSeq += e.key.toLowerCase();
    easterInputSeq = easterInputSeq.slice(-easterTarget.length);
    if (easterInputSeq === easterTarget) activateMemento();
});

// 2. Triple clic/tap sur le logo
const easterLogo = document.querySelector('.nav-logo');
let easterTapCount = 0;
let easterTapTimeout;

if (easterLogo) {
    easterLogo.style.userSelect = 'none';
    easterLogo.style.webkitUserSelect = 'none';
    easterLogo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        easterTapCount++;
        clearTimeout(easterTapTimeout);
        easterTapTimeout = setTimeout(() => { easterTapCount = 0; }, 500);
        if (easterTapCount === 3) { activateMemento(); easterTapCount = 0; }
    }, { passive: false });
    easterLogo.addEventListener('click', (e) => {
        e.preventDefault();
        easterTapCount++;
        clearTimeout(easterTapTimeout);
        easterTapTimeout = setTimeout(() => { easterTapCount = 0; }, 500);
        if (easterTapCount === 3) { activateMemento(); easterTapCount = 0; }
    });
}

// 3. Redirection
function activateMemento() {
    document.body.style.transition = "all 0.5s ease";
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    setTimeout(() => { window.location.href = "/html/Memento.html"; }, 600);
}

// 4. Dropdown matières (mobile toggle)
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.nav-dropdown');
    if (!dropdown) return;
    const btn = dropdown.querySelector('.nav-dropdown-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
});
