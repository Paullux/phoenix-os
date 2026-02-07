// assets/core/window-manager.js
(function () {
    window.windows = window.windows || {};
    window.zIndexCounter = window.zIndexCounter || 199;

    window.openWindow = function (appId) {
        if (window.windows[appId]) {
            const win = window.windows[appId];
            if (win.dataset.minimized === "true") {
                win.style.display = "flex";
                delete win.dataset.minimized;

                const launcherItem = document.querySelector(`.launcher-item[onclick="openWindow('${appId}')"]`);
                if (launcherItem) launcherItem.classList.remove("minimized");
            }
            window.focusWindow(appId);
            return;
        }

        const config = window.appConfigs && window.appConfigs[appId];
        if (!config) return;

        const win = document.createElement("div");
        win.className = "window";
        win.id = `win-${appId}`;
        win.style.width = config.width + "px";
        win.style.height = config.height + "px";
        win.style.top = 40 + Object.keys(window.windows).length * 25 + "px";
        win.style.left = 90 + Object.keys(window.windows).length * 25 + "px";

        win.innerHTML = `
            <div class="window-header" onmousedown="startDrag(event, '${appId}')">
                <div class="window-controls">
                <button class="window-btn btn-close" onclick="closeWindow('${appId}')"><i class="fas fa-times"></i></button>
                <button class="window-btn btn-min" onclick="minimizeWindow('${appId}')"><i class="fas fa-minus"></i></button>
                <button class="window-btn btn-max" onclick="maximizeWindow('${appId}')"><i class="fas fa-expand"></i></button>
                </div>
                <div class="window-title">${config.title}</div>
            </div>
            <div class="window-content ${appId === "terminal" ? "terminal-content" : ""}" onmousedown="focusWindow('${appId}')">
                ${config.content}
            </div>
        `;

        document.getElementById("windows-container").appendChild(win);
        window.windows[appId] = win;

        const launcherItem = document.querySelector(`.launcher-item[onclick="openWindow('${appId}')"]`);
        if (launcherItem) launcherItem.classList.add("active", "open");

        if (typeof config.onLoad === "function") {
            console.log("[Terminal] onLoad called");
            config.onLoad(win);
        }

        window.focusWindow(appId);
    };

    window.closeWindow = function (appId) {
        const win = window.windows[appId];
        if (!win) return;

        win.style.transition = "all 0.15s ease-in";
        win.style.opacity = "0";
        win.style.transform = "scale(0.95)";

        setTimeout(() => {
            win.remove();
            delete window.windows[appId];
            const launcherItem = document.querySelector(`.launcher-item[onclick="openWindow('${appId}')"]`);
            if (launcherItem) launcherItem.classList.remove("active", "open");
            const a = document.getElementById("active-app-name");
            if (a) a.textContent = "Bureau Ubuntu";
        }, 150);
    };

    window.minimizeWindow = function (appId) {
        const win = window.windows[appId];
        if (!win) return;

        win.style.display = "none";
        win.dataset.minimized = "true";

        const launcherItem = document.querySelector(`.launcher-item[onclick="openWindow('${appId}')"]`);
        if (launcherItem) launcherItem.classList.add("minimized");

        const a = document.getElementById("active-app-name");
        if (a) a.textContent = "Bureau Ubuntu";
    };

    window.maximizeWindow = function (appId) {
        const win = window.windows[appId];
        if (!win) return;

        if (!win.dataset.maximized) {
            win.dataset.prev = JSON.stringify({ t: win.style.top, l: win.style.left, w: win.style.width, h: win.style.height });
            win.style.top = "28px";
            win.style.left = "64px";
            win.style.width = "calc(100vw - 64px)";
            win.style.height = "calc(100vh - 28px)";
            win.dataset.maximized = "true";
            } else {
            const prev = JSON.parse(win.dataset.prev);
            win.style.top = prev.t;
            win.style.left = prev.l;
            win.style.width = prev.w;
            win.style.height = prev.h;
            delete win.dataset.maximized;
        }
    };

    window.focusWindow = function (appId) {
        if (!appId) {
            // clic sur le bureau = on "defocus" sans rien casser
            window.activeWindowId = null;

            // optionnel: reset du titre en haut
            const n = document.getElementById('active-app-name');
            if (n) n.textContent = '';

            return;
        }

        const el = window.windows?.[appId];
        if (!el) {
            console.warn('[focusWindow] fenetre introuvable pour appId=', appId, window.windows);
            return;
        }

        document.querySelectorAll(".launcher-item").forEach((el) => el.classList.remove("active"));

        if (appId) {
            window.zIndexCounter++;
            const el = window.windows?.[appId];
            if (!el) {
                console.warn('[focusWindow] fenetre introuvable pour appId=', appId, window.windows);
                return;
            }
            el.style.zIndex = window.zIndexCounter;

            const w = window.windows[appId];
            w.style.transform = "scale(1.005)";
            setTimeout(() => {
                w.style.transform = "scale(1)";
            }, 80);

            const a = document.getElementById("active-app-name");
            if (a) a.textContent = window.appConfigs[appId].title;

            const launcherItem = document.querySelector(`.launcher-item[onclick="openWindow('${appId}')"]`);
        if (launcherItem) launcherItem.classList.add("active");
        } else {
            const a = document.getElementById("active-app-name");
            if (a) a.textContent = "Bureau Ubuntu";
        }
    };

    let isDragging = false;
    let currentDragWin = null;
    let dragOffset = { x: 0, y: 0 };

    window.startDrag = function (e, appId) {
        if (e.target.closest(".window-btn")) return;
        isDragging = true;
        currentDragWin = window.windows[appId];
        window.focusWindow(appId);

        const rect = currentDragWin.getBoundingClientRect();
        dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        currentDragWin.style.transition = "none";
    };

    document.addEventListener("mousemove", (e) => {
        if (isDragging && currentDragWin) {
            let y = e.clientY - dragOffset.y;
            if (y < 28) y = 28;
            currentDragWin.style.left = e.clientX - dragOffset.x + "px";
            currentDragWin.style.top = y + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        currentDragWin = null;
    });
})();
