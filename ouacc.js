document.addEventListener('DOMContentLoaded', function () {
  const button = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!button || !nav) return;

  button.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', function (event) {
    const summary = event.target.closest('.nav-menu > summary');
    const link = event.target.closest('a');

    if (summary) {
      nav.querySelectorAll('.nav-menu[open]').forEach(function (menu) {
        if (menu !== summary.parentElement) menu.removeAttribute('open');
      });
    }

    if (window.innerWidth <= 800 && link) {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      nav.querySelectorAll('.nav-menu[open]').forEach(function (menu) {
        menu.removeAttribute('open');
      });
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
});
