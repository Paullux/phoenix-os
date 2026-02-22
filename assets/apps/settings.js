// assets/apps/settings.js
(function () {
  const LS_THEME = 'unity_theme';
  const LS_WALLPAPER = 'unity_wallpaper';

  const THEMES = [
    { id: 'ambiance', label: 'Ambiance' },
    { id: 'radiance', label: 'Radiance' },
  ];

  const WALLPAPERS = [
    { id: 'paul', label: 'Wallpapper Paul', src: 'assets/wallpapers/Wallpapper_Paul.png' },
    { id: 'elsa', label: 'Wallpapper Elsa', src: 'assets/wallpapers/Wallpapper_Elsa.png' },
    { id: 'marysa', label: 'Wallpapper Marysa', src: 'assets/wallpapers/Wallpapper_Marysa.png' },
    { id: 'couple', label: 'Mon couple', src: 'assets/wallpapers/Wallpapper_mon_couple.png' },
    { id: 'aurora', label: 'Aurora Mountains', src: 'assets/wallpapers/wallpaper_aurora_mountains.png' },
    { id: 'ocean', label: 'Ocean Sunset', src: 'assets/wallpapers/wallpaper_ocean_sunset.png' },
    { id: 'city', label: 'City Night', src: 'assets/wallpapers/wallpaper_city_night.png' },
    { id: 'nebula', label: 'Cosmic Nebula', src: 'assets/wallpapers/wallpaper_cosmic_nebula.png' },
  ];

  function getTheme() {
    return document.body.dataset.theme || localStorage.getItem(LS_THEME) || 'ambiance';
  }

  function getWallpaper() {
    return document.body.dataset.wallpaper || localStorage.getItem(LS_WALLPAPER) || 'aurora';
  }

  function ensurePrefsAPI() {
    if (typeof window.applyUnityPrefs !== 'function') {
      window.applyUnityPrefs = function applyUnityPrefs() {
        const theme = localStorage.getItem(LS_THEME) || 'ambiance';
        const wp = localStorage.getItem(LS_WALLPAPER) || 'aurora';
        document.body.dataset.theme = theme;
        document.body.dataset.wallpaper = wp;
      };
    }

    if (typeof window.setUnityTheme !== 'function') {
      window.setUnityTheme = function setUnityTheme(theme) {
        document.body.dataset.theme = theme;
        localStorage.setItem(LS_THEME, theme);
      };
    }

    if (typeof window.setUnityWallpaper !== 'function') {
      window.setUnityWallpaper = function setUnityWallpaper(wp) {
        document.body.dataset.wallpaper = wp;
        localStorage.setItem(LS_WALLPAPER, wp);
      };
    }
  }

  function template() {
    const themeTiles = THEMES.map((t) => {
      return `
        <button class="settings-tile" type="button" data-kind="theme" data-value="${t.id}">
          <div class="settings-preview ${t.id === 'radiance' ? 'preview-radiance' : 'preview-ambiance'}">
            <div class="preview-top"></div>
            <div class="preview-body">
              <div class="preview-box"></div>
              <div class="preview-line"></div>
              <div class="preview-line short"></div>
            </div>
          </div>
          <div class="settings-tile-label">${t.label}</div>
        </button>
      `;
    }).join('');

    const wpTiles = WALLPAPERS.map((w) => {
      return `
        <button class="settings-tile" type="button" data-kind="wallpaper" data-value="${w.id}">
          <div class="settings-wall-thumb">
            <img src="${w.src}" alt="${w.label}" loading="lazy" draggable="false" />
          </div>
          <div class="settings-tile-label">${w.label}</div>
        </button>
      `;
    }).join('');

    return `
      <div class="settings-frame">
        <div class="settings-titlebar">Appearance Preferences</div>

        <div class="settings-tabs">
          <button class="settings-tab is-active" type="button" data-tab="theme">Theme</button>
          <button class="settings-tab" type="button" data-tab="background">Background</button>
        </div>

        <div class="settings-body">
          <div class="settings-panel" data-panel="theme">
            <div class="settings-grid">
              ${themeTiles}
            </div>
          </div>

          <div class="settings-panel settings-hidden" data-panel="background">
            <div class="settings-grid">
              ${wpTiles}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function syncSelected(root) {
    const theme = getTheme();
    const wp = getWallpaper();

    root.querySelectorAll('.settings-tile').forEach((btn) => {
      btn.classList.remove('is-selected');
      const kind = btn.dataset.kind;
      const val = btn.dataset.value;
      if (kind === 'theme' && val === theme) btn.classList.add('is-selected');
      if (kind === 'wallpaper' && val === wp) btn.classList.add('is-selected');
    });
  }

  function initSettingsUI() {
    ensurePrefsAPI();

    const win = document.getElementById('win-settings');
    if (!win) return false;

    const root = win.querySelector('#settings-root');
    if (!root) return false;

    // inject UI
    root.innerHTML = template();

    const tabs = Array.from(root.querySelectorAll('.settings-tab'));
    const panels = Array.from(root.querySelectorAll('.settings-panel'));

    function openTab(name) {
      tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
      panels.forEach((p) => p.classList.toggle('settings-hidden', p.dataset.panel !== name));
    }

    // tabs click
    tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));

    // tiles click
    root.querySelectorAll('.settings-tile').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.kind;
        const val = btn.dataset.value;

        if (kind === 'theme') window.setUnityTheme(val);
        if (kind === 'wallpaper') window.setUnityWallpaper(val);

        syncSelected(root);
      });
    });

    // expose openTab for SettingsApp.open
    win.__settingsOpenTab = openTab;

    // initial selection
    syncSelected(root);
    return true;
  }

  let _inited = false;

  function ensureWindowAndRoot(cb, tries = 0) {
    let win = document.getElementById('win-settings');

    if (!win) {
      if (typeof window.openWindow === 'function') window.openWindow('settings');
      win = document.getElementById('win-settings');
    }

    // attend que le window-manager ait injecte le DOM
    const hasRoot = win && win.querySelector('#settings-root');
    if (!hasRoot) {
      if (tries > 30) return; // stop (evite boucle infinie)
      setTimeout(() => ensureWindowAndRoot(cb, tries + 1), 0);
      return;
    }

    cb(win);
  }

  window.SettingsApp = {
    onLoad() {
      initSettingsUI();
    },
    open(tab) {
      const wanted = (tab || '').trim().toLowerCase(); // 'theme' | 'background' | ''

      // 1) ouvre/cree la fenetre (ton window-manager va injecter le HTML)
      if (typeof window.openWindow === 'function') {
        window.openWindow('settings');
      }

      // 2) on attend que la fenetre et le root existent
      const tick = (tries = 0) => {
        const win = document.getElementById('win-settings');
        const root = win?.querySelector('#settings-root');

        if (!win || !root) {
          if (tries < 40) return setTimeout(() => tick(tries + 1), 0);
          return;
        }

        win.classList.remove('hidden');
        if (typeof window.focusWindow === 'function') window.focusWindow(win);

        // 3) injecte l'UI si elle n'est pas la
        // (important: si root est vide => on build)
        if (!root.firstElementChild) {
          initSettingsUI();
        }

        // 4) RE-QUERY APRES initSettingsUI (sinon tu cliques du vide)
        if (wanted) {
          const btn = win.querySelector(`.settings-tab[data-tab="${wanted}"]`);
          console.log('Settings open wanted=', wanted, 'btn=', !!btn);
          if (btn) btn.click();
        }
      };

      tick();
    },
  };

  // applique les prefs au chargement global (fond + theme)
  document.addEventListener('DOMContentLoaded', () => {
    ensurePrefsAPI();
    if (typeof window.applyUnityPrefs === 'function') window.applyUnityPrefs();
  });
})();
