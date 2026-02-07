// assets/core/desktop.js
(function () {
  // 1) Choisis le "fond bureau" sur lequel tu veux capter le clic droit
  // Si tu as un #desktop, utilise-le. Sinon tu peux mettre document.body.
  const desktop = document.getElementById('desktop') || document.body;

  // 2) Cree le menu
  const menu = document.createElement('div');
  menu.className = 'desktop-menu';
  menu.innerHTML = `
    <div class="item" data-action="theme">Theme</div>
    <div class="item" data-action="background">Background</div>
    <div class="sep"></div>
    <div class="item" data-action="settings">Parametres...</div>
  `;
  document.body.appendChild(menu);

  function hideMenu() {
    menu.style.display = 'none';
  }

  function clampToViewport(x, y) {
    const pad = 8;
    const mw = menu.offsetWidth || 200;
    const mh = menu.offsetHeight || 120;
    const vx = Math.max(pad, Math.min(x, window.innerWidth - mw - pad));
    const vy = Math.max(pad, Math.min(y, window.innerHeight - mh - pad));
    return { x: vx, y: vy };
  }

  function showMenu(x, y) {
    menu.style.display = 'block';
    const p = clampToViewport(x, y);
    menu.style.left = p.x + 'px';
    menu.style.top = p.y + 'px';
  }

  // Petit helper: activer l'onglet voulu dans l'app Settings
  function openSettingsAndTab(tabName) {
    // -> adapte selon ton systeme de fenetres
    // Exemple: si tu as une fonction globale pour ouvrir/bringToFront:
    // window.openApp?.('settings');

    const win = document.getElementById('win-settings');
    if (win) {
      // si tu as une fonction qui focus/bring front, appelle-la
      if (typeof window.focusWindow === 'function') window.focusWindow(win);
      win.classList.remove('hidden');
    }

    // Clique la tab correspondante par son texte
    const tabs = document.querySelectorAll('.settings-tab');
    for (const t of tabs) {
      const label = (t.textContent || '').trim().toLowerCase();
      if (label === tabName.toLowerCase()) {
        t.click();
        break;
      }
    }
  }

  // IMPORTANT: ne pas bloquer le clic droit sur les fenetres / icones etc
  // On ne l'active que si tu cliques "vraiment" le fond.
  function isOnDesktopBackground(e) {
    // Si tu as un calque wallpaper, check sa classe/id ici.
    // Sinon, on dit: ok seulement si target est desktop ou body
    return e.target === desktop || e.target === document.body;
  }

  desktop.addEventListener('contextmenu', (e) => {
    if (!isOnDesktopBackground(e)) return; // laisse normal ailleurs
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  });

  // click sur un item
  menu.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    const action = item.dataset.action;
    hideMenu();

    if (action === 'theme') {
      window.SettingsApp?.open('theme');
    } else if (action === 'background') {
      window.SettingsApp?.open('background');
    } else if (action === 'settings') {
      window.SettingsApp?.open(); // juste ouvrir
    }
  });

  // ferme le menu quand tu cliques ailleurs / scroll / escape
  window.addEventListener('mousedown', (e) => {
    if (!menu.contains(e.target)) hideMenu();
  });
  window.addEventListener('scroll', hideMenu, true);
  window.addEventListener('resize', hideMenu);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });
})();
