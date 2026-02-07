// assets/apps/imageviewer.js
(function () {
    window.openImageViewer = function (src, filename) {
        if (!src) return;

        // Ouvre la fenetre (ou la focus si deja ouverte)
        window.openWindow("imageviewer");

        // Attends que la fenetre existe dans le DOM
        setTimeout(() => {
            const win = window.windows && window.windows.imageviewer;
            const root = win || document;

            const img = root.querySelector("#imgv-img");
            const name = root.querySelector("#imgv-name");
            if (!img || !name) return;

            img.src = src;
            img.alt = filename || "";
            name.textContent = filename || (src.split("/").pop() || "image");
        }, 0);
    };
})();
