// assets/core/mobile.js
// Mode mobile : fenêtres plein écran (launcher vertical reste à gauche, BFB en bas)
(function () {
    const MOBILE_BP = 768;

    function isMobile() {
        return window.innerWidth <= MOBILE_BP || document.body.classList.contains('mobile-forced');
    }

    function applyMode() {
        const mobile = isMobile();
        document.body.classList.toggle('mobile-mode', mobile);
        if (mobile && window.windows) {
            Object.keys(window.windows).forEach(enforceMobileWindow);
        }
    }

    // Fenêtre plein écran : de la topbar jusqu'en bas, après le launcher
    function enforceMobileWindow(appId) {
        const win = window.windows?.[appId];
        if (!win) return;
        win.style.top = '28px';
        win.style.left = '64px';
        win.style.width = 'calc(100vw - 64px)';
        win.style.height = 'calc(100vh - 28px)';
        win.style.borderRadius = '0';
        win.style.resize = 'none';
    }

    // Patch openWindow pour forcer plein écran en mobile
    function patchWindowManager() {
        if (typeof window.openWindow !== 'function') {
            setTimeout(patchWindowManager, 50);
            return;
        }
        const _orig = window.openWindow;
        window.openWindow = function (appId) {
            _orig(appId);
            if (isMobile()) {
                requestAnimationFrame(() => enforceMobileWindow(appId));
            }
        };

        // Désactiver maximize en mobile (inutile)
        const _origMax = window.maximizeWindow;
        window.maximizeWindow = function (appId) {
            if (isMobile()) return;
            _origMax(appId);
        };

        // Désactiver drag en mobile
        const _origDrag = window.startDrag;
        window.startDrag = function (e, appId) {
            if (isMobile()) { window.focusWindow(appId); return; }
            _origDrag(e, appId);
        };
    }
    patchWindowManager();

    // Toggle manuel (bouton téléphone dans la topbar)
    window.toggleMobileMode = function () {
        document.body.classList.toggle('mobile-forced');
        applyMode();
    };

    // Resize
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(applyMode, 100); });

    window.addEventListener('load', applyMode);
    applyMode();
})();
