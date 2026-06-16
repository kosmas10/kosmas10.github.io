/* ============================================================
   Shared content-page behavior
   Single source of truth for the interactive behavior used by
   the subdirectory content pages. Link it with:
     <script src="/assets/theme.js"></script>
   Each behavior is guarded so it is a harmless no-op on pages
   that don't use the relevant elements. Pair with
   /assets/theme.css. The root index.html does NOT use this.
   ============================================================ */

(function () {
  'use strict';

  /* ── Sticky nav active state (scrollspy) ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.toc a');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.toc a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -75% 0px' });

    sections.forEach(section => navObserver.observe(section));
  }

  /* ── Fade-in on scroll ── */
  /* Superset of selectors across all content pages; selectors with
     no matches are simply skipped. */
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.callout, .stat-grid, .cap-grid, .two-col, .disclosure, .era-table, .ideation-grid, .timeline, .pattern-diagram, h3, h4'
  ).forEach(el => {
    if (el.closest('.disclosure-body')) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });

  /* ── Disclosure / accordion: open from URL hash + sub-topic pills ── */
  if (document.querySelector('.disclosure')) {
    const openDisclosureById = (id) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (el && el.tagName === 'DETAILS' && el.classList.contains('disclosure')) {
        el.open = true;
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };

    const syncHashToDisclosure = () => openDisclosureById(window.location.hash.slice(1));

    window.addEventListener('hashchange', syncHashToDisclosure);
    syncHashToDisclosure();

    document.querySelectorAll('.sub-topic-pill[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target && target.tagName === 'DETAILS') {
          e.preventDefault();
          openDisclosureById(id);
          history.replaceState(null, '', '#' + id);
        }
      });
    });
  }
})();
