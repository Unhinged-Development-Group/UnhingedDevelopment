/* eslint-disable */
/* unhinged-icons.js
 * Procedural "chaos" icon generator. Stacks six copies of the same Heroicon-shaped
 * path with small translate/rotate/opacity jitter, then over-strokes the top
 * layer in an accent color. Produces icons with the same scrawled energy as
 * the wordmark, but readable at small sizes.
 *
 * Usage:
 *   <script src="unhinged-icons.js"></script>
 *   <span data-unhinged-icon="lightning" data-size="22"></span>
 *
 *   // or programmatically:
 *   const svg = UnhingedIcon('home', { size: 24, main: '#fff', accent: '#D2FF14' });
 *
 * Reference: uploads/Icon Library.html (45+ icons, light/dark themes).
 */

(function (global) {
  const PATHS = {
    'logo':       ["M9 18l6-6-6-6"],
    'home':       ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
    'search':     ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.35-4.35"],
    'menu':       ["M3 12h18","M3 6h18","M3 18h18"],
    'close':      ["M18 6L6 18","M6 6l12 12"],
    'check':      ["M20 6L9 17l-5-5"],
    'chevron-right': ["M9 18l6-6-6-6"],
    'chevron-left':  ["M15 18l-6-6 6-6"],
    'chevron-down':  ["M18 9l-6 6-6-6"],
    'lightning':  ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
    'rocket':     ["M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z","M22 2L11 13","M22 2l-7 20-4-9-9-4 20-7z"],
    'shield':     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
    'star':       ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
    'heart':      ["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"],
    'pulse':      ["M22 12h-4l-3 9L9 3l-3 9H2"],
    'mail':       ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
    'chat':       ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
    'folder':     ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
    'file':       ["M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z","M13 2v7h7"],
    'lock':       ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
    'cloud':      ["M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"],
    'users':      ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
    'database':   ["M21 12c0 1.66-4 3-9 3s-9-1.34-9-3","M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5","M21 5c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"],
    'terminal':   ["M4 17l6-6-6-6","M12 19h8"],
    'code':       ["M16 18l6-6-6-6","M8 6l-6 6 6 6"],
    'chart':      ["M3 3v18h18","M18 17V9","M13 17V5","M8 17v-3"],
    'calendar':   ["M3 4h18v18H3z","M16 2v4","M8 2v4","M3 10h18"],
    'clock':      ["M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z","M12 6v6l4 2"],
    'plus':       ["M12 5v14","M5 12h14"],
    'arrow-right':["M5 12h14","M12 5l7 7-7 7"],
  };

  const LAYERS = [
    { t: "translate(0.5,0.5) rotate(1.5 12 12)",   o: 0.30, w: 1.2, accent: false },
    { t: "translate(-0.5,-0.5) rotate(-1.5 12 12)", o: 0.40, w: 1.0, accent: false },
    { t: "translate(1,-0.5) rotate(3 12 12)",      o: 0.30, w: 0.8, accent: false },
    { t: "translate(-1,1) rotate(-2.5 12 12)",     o: 0.50, w: 1.0, accent: false },
    { t: "translate(0,0) rotate(0 12 12)",         o: 0.90, w: 2.0, accent: false },
    { t: "translate(1.5,1.5) rotate(-4 12 12)",    o: 0.80, w: 1.5, accent: true  },
  ];

  function render(paths, opts) {
    const size = opts.size || 24;
    const main = opts.main || '#FFFFFF';
    const accent = opts.accent || '#D2FF14';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;
    for (const L of LAYERS) {
      const color = L.accent ? accent : main;
      s += `<g transform="${L.t}" opacity="${L.o}">`;
      for (const p of paths) s += `<path d="${p}" stroke="${color}" stroke-width="${L.w}"/>`;
      s += `</g>`;
    }
    s += `</svg>`;
    return s;
  }

  function UnhingedIcon(name, opts = {}) {
    const paths = PATHS[name];
    if (!paths) return '';
    return render(paths, opts);
  }

  // Auto-mount: <span data-unhinged-icon="..." data-size="22" data-main="..." data-accent="...">
  function mount(root = document) {
    root.querySelectorAll('[data-unhinged-icon]').forEach((el) => {
      const name = el.dataset.unhingedIcon;
      el.innerHTML = UnhingedIcon(name, {
        size: parseInt(el.dataset.size || '24', 10),
        main: el.dataset.main || undefined,
        accent: el.dataset.accent || undefined,
      });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount());
    else mount();
  }

  global.UnhingedIcon = UnhingedIcon;
  global.UnhingedIconNames = Object.keys(PATHS);
  global.mountUnhingedIcons = mount;
})(typeof window !== 'undefined' ? window : globalThis);
