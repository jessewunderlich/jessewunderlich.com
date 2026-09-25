// Scroll-reveal: CSS defines the states, this just toggles the class.
// Survives Astro View Transitions by re-running on astro:page-load.
// External file (not inline) so it doesn't need a CSP script-src hash
// that would break every time this file's content changes.
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}
initReveal();
document.addEventListener('astro:page-load', initReveal);
