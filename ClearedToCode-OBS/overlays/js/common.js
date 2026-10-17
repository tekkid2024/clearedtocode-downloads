// Shared helpers for every ClearedToCode overlay page.
(function () {
  const defaults = {
    twitchChannel: '',
    brand: ['Cleared', 'To', 'Code'],
    brandTagline: 'Flight Sim · Dev · Live',
    name: '',
    role: '',
    screenTitle: '',
    taglines: [],
    socials: [],
    footerMessages: [],
    startingMinutes: 5,
    schedule: [],
    chat: { hideBots: [], hideCommands: true, maxMessages: 40 },
    colors: { accent: '#ffb547', accent2: '#46d2ff' },
  };
  const user = window.CTC_CONFIG || {};
  const cfg = Object.assign({}, defaults, user);
  cfg.chat = Object.assign({}, defaults.chat, user.chat || {});
  cfg.colors = Object.assign({}, defaults.colors, user.colors || {});

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--accent', cfg.colors.accent);
  rootStyle.setProperty('--accent-2', cfg.colors.accent2);

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const pad = (n) => String(n).padStart(2, '0');

  const stroke = (d) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  const icons = {
    plane: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    code: stroke('<path d="M8 6l-6 6 6 6"/><path d="M16 6l6 6-6 6"/><path d="M14 4l-4 16"/>'),
    sliders: stroke('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    climb: stroke('<path d="M3 19h18"/><path d="M5 15l5-3 3 2 6-6"/><path d="M15 8h4v4"/>'),
    star: stroke('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    gem: stroke('<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 21L9 9M12 21l3-12"/>'),
    raid: stroke('<path d="M3 12h11"/><path d="M10 7l5 5-5 5"/><path d="M19 5v14"/>'),
  };

  window.CTC = {
    cfg,
    demo: new URLSearchParams(location.search).has('demo'),
    esc,
    pad,
    icons,
    brandHTML() {
      const [a, b, c] = cfg.brand;
      return `${esc(a)}<span class="hl">${esc(b || '')}</span>${esc(c || '')}`;
    },
    duration(sec) {
      sec = Math.max(0, Math.floor(sec));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    },
    store: {
      get(key, fallback) {
        try {
          const v = localStorage.getItem('ctc:' + key);
          return v ? JSON.parse(v) : fallback;
        } catch (e) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem('ctc:' + key, JSON.stringify(value));
        } catch (e) {
          /* storage unavailable: values just won't survive a restart */
        }
      },
    },
  };
})();
