document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!button || !nav) return;
  button.addEventListener("click", function () {
    const open = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
});
