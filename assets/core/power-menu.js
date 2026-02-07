// assets/power-menu.js
(function () {
    function qs(id) { return document.getElementById(id); }

    window.initPowerMenu = function initPowerMenu() {
        const btn = qs("powerButton");
        const menu = qs("powerMenu");
        const rebootBtn = qs("powerReboot");
        const shutBtn = qs("powerShutdown");

        if (!btn || !menu || !rebootBtn || !shutBtn) {
            console.warn("[power-menu] elements not found", {
                powerButton: !!btn,
                powerMenu: !!menu,
                powerReboot: !!rebootBtn,
                powerShutdown: !!shutBtn,
            });
            return;
        }

        // Evite double-binding si tu rappelles initPowerMenu()
        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";

        function openMenu() {
            menu.classList.remove("hidden");
            btn.setAttribute("aria-expanded", "true");
        }

        function closeMenu() {
            menu.classList.add("hidden");
            btn.setAttribute("aria-expanded", "false");
        }

        function toggleMenu() {
            if (menu.classList.contains("hidden")) openMenu();
            else closeMenu();
        }

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // clique ailleurs => ferme
        document.addEventListener("click", () => closeMenu());

        // clique dans le menu => ne ferme pas
        menu.addEventListener("click", (e) => e.stopPropagation());

        rebootBtn.addEventListener("click", () => {
        closeMenu();
            if (typeof window.plymouthReboot === "function") window.plymouthReboot();
            else console.warn("[power-menu] plymouthReboot() missing");
        });

        shutBtn.addEventListener("click", () => {
            closeMenu();
            if (typeof window.plymouthShutdown === "function") window.plymouthShutdown();
            else console.warn("[power-menu] plymouthShutdown() missing");
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMenu();
        });

        console.log("[power-menu] bound ok");
    };

    // Cas simple: top-bar est deja dans le DOM au load
    window.addEventListener("DOMContentLoaded", () => {
        window.initPowerMenu();
    });
})();
