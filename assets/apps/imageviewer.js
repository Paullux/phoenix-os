// assets/apps/imageviewer.js
(function () {
    const state = {
        dirPath: null,
        files: [],
        index: 0,
    };

    function isImageNode(node, filename) {
        const mime = String(node?.mime || "").toLowerCase();
        if (mime.startsWith("image/")) return true;
        return /\.(png|jpe?g|webp|gif)$/i.test(String(filename || ""));
    }

    function listImagesInDir(dirNode) {
        const kids = dirNode?.children || {};
        return Object.keys(kids)
        .filter((n) => {
            const node = kids[n];
            // dans ton VFS, les images sont surtout type "asset"
            if (!node) return false;
            if (node.type === "asset") return isImageNode(node, n);
            return false;
        })
        .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base", numeric: true }));
    }

    function showCurrent() {
        const win = window.windows && window.windows.imageviewer;
        if (!win) return;

        const img = win.querySelector("#imgv-img");
        const label = win.querySelector("#imgv-name");
        const prevBtn = win.querySelector("#imgv-prev");
        const nextBtn = win.querySelector("#imgv-next");

        if (!img || !label) return;

        // si on a une liste (mode navigation)
        if (state.files.length > 0 && state.dirPath) {
            const file = state.files[state.index];
            const abs = (state.dirPath === "/" ? `/${file}` : `${state.dirPath}/${file}`);

            const res = window.vfs?.resolve?.(abs);
            const node = res?.node;

            const src = node?.src || node?.url || "";
            img.src = src;
            img.alt = file;
            label.textContent = file;

            // si 0 ou 1 image, on desactive les fleches
            const navDisabled = state.files.length <= 1;
            if (prevBtn) prevBtn.disabled = navDisabled;
            if (nextBtn) nextBtn.disabled = navDisabled;

            return;
        }

        // fallback (pas de contexte dossier): juste afficher src/filename
        // (utile si un jour tu l'appelles depuis ailleurs)
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
    }

    function bindNavButtons() {
        const win = window.windows && window.windows.imageviewer;
        if (!win) return;

        const prevBtn = win.querySelector("#imgv-prev");
        const nextBtn = win.querySelector("#imgv-next");

        // evite de rebinder 10 fois
        if (prevBtn && prevBtn.dataset.bound === "1") return;
        if (prevBtn) prevBtn.dataset.bound = "1";
        if (nextBtn) nextBtn.dataset.bound = "1";

        prevBtn?.addEventListener("click", () => {
            if (state.files.length <= 1) return;
            state.index = (state.index - 1 + state.files.length) % state.files.length; // boucle
            showCurrent();
        });

        nextBtn?.addEventListener("click", () => {
            if (state.files.length <= 1) return;
            state.index = (state.index + 1) % state.files.length; // boucle
            showCurrent();
        });

        // bonus: fleches clavier
        win.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") prevBtn?.click();
            if (e.key === "ArrowRight") nextBtn?.click();
        });
    }

    window.openImageViewer = function (src, filename, dirPath) {
        if (!src) return;

        window.openWindow("imageviewer");

        const win = window.windows && window.windows.imageviewer;
        if (!win) return;

        // mode navigation si on a un dirPath + vfs
        state.dirPath = dirPath || null;
        state.files = [];
        state.index = 0;

        if (state.dirPath && window.vfs?.resolve) {
            const dirRes = window.vfs.resolve(state.dirPath);
            if (dirRes?.node?.type === "dir") {
                state.files = listImagesInDir(dirRes.node);

                const i = state.files.findIndex((n) => n === filename);
                state.index = i >= 0 ? i : 0;
            }
        }

        // fallback: si pas de liste (ou pas de vfs), on affiche ce qu'on a
        const img = win.querySelector("#imgv-img");
        const nameEl = win.querySelector("#imgv-name");
        if (img) {
            img.src = src;
            img.alt = filename || "";
        }
        if (nameEl) {
            nameEl.textContent = filename || (src.split("/").pop() || "image");
        }

        bindNavButtons();
        showCurrent();
        window.focusWindow("imageviewer");
    };
})();

