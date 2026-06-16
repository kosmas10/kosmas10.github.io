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

  /* ── Dark / light theme toggle ──
     Floating segmented Light/Dark pill injected here so every page that
     loads this file gets it for free. The initial theme is applied before
     paint by a small inline guard in each page's <head>; this block keeps
     the control's state in sync and persists the user's choice. The default
     (no stored choice) is dark. */
  const STORAGE_KEY = 'site-theme';

  const storedTheme = () => {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) { return null; }
  };

  const getPreferred = () => storedTheme() || 'dark';

  const SUN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const MOON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  const makeOpt = (value, label, svg) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle__opt theme-toggle__opt--' + value;
    btn.innerHTML = svg + '<span>' + label + '</span>';
    btn.addEventListener('click', () => {
      applyTheme(value);
      try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    });
    return btn;
  };

  const toggle = document.createElement('div');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Theme');
  const lightOpt = makeOpt('light', 'Light', SUN_SVG);
  const darkOpt = makeOpt('dark', 'Dark', MOON_SVG);
  toggle.appendChild(lightOpt);
  toggle.appendChild(darkOpt);

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    lightOpt.setAttribute('aria-pressed', String(theme === 'light'));
    darkOpt.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  document.body.appendChild(toggle);
  applyTheme(getPreferred());
})();
