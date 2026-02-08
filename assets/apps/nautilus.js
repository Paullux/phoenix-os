// assets/apps/nautilus.js
(function () {
  window.currentFMPath = "/home/user";
  window.nautilusRootEl = null;

  window.updateFileManagerUI = function (winEl) {
    const root = winEl || window.nautilusRootEl || document;

    const grid = root.querySelector("#fm-grid");
    const pathDisplay = root.querySelector("#fm-path");
    if (!grid || !pathDisplay || !window.vfs) return;

    const res = window.vfs.resolve(window.currentFMPath);
    if (!res || res.node.type !== "dir") {
      window.currentFMPath = "/home/user";
      return window.updateFileManagerUI(root);
    }

    pathDisplay.textContent = window.currentFMPath;
    grid.innerHTML = "";

    const items = Object.keys(res.node.children || {}).sort();

    items.forEach((name) => {
      const item = res.node.children[name];
      const isDir = item.type === "dir";

      const isAsset = item.type === "asset";
      const mime = String(item.mime || "").toLowerCase();
      const lowerName = String(name || "").toLowerCase();

      const isImg = isAsset && mime.startsWith("image/");
      const isAudio = (isAsset && mime.startsWith("audio/")) || lowerName.endsWith(".mp3") || lowerName.endsWith(".ogg") || lowerName.endsWith(".wav");

      // thumbnail dossier si cover.jpg existe dedans
      let folderCoverSrc = null;
      if (isDir && item.children && item.children["cover.jpg"] && item.children["cover.jpg"].type === "asset") {
        const c = item.children["cover.jpg"];
        if (String(c.mime || "").startsWith("image/")) folderCoverSrc = c.src;
      }

      let iconHtml = "";

      // 1) dossier avec cover.jpg => miniature
      if (isDir && folderCoverSrc) {
        iconHtml = `
          <div class="fm-icon">
            <i class="fas fa-folder text-orange-400"></i>
          </div>
        `;
      }
      // 2) fichier image asset => thumbnail direct
      else if (!isDir && isImg) {
        iconHtml = `
          <div class="fm-thumb">
            <img src="${item.src}" class="fm-thumb-img" draggable="false">
          </div>
        `;
      }
      // 3) fichier audio asset => icone musique
      else if (!isDir && isAudio) {
        iconHtml = `<i class="fas fa-music fm-icon text-orange-400 drop-shadow-md pointer-events-none"></i>`;
      }
      else if (isImg) {
        if (typeof window.openImageViewer === "function") {
          window.openImageViewer(item.src, name, window.currentFMPath);
        }
      }
      // 4) fallback
      else {
        const iconClass = isDir ? "fas fa-folder text-orange-400" : "fas fa-file-alt text-gray-400";
        iconHtml = `<i class="${iconClass} fm-icon drop-shadow-md pointer-events-none"></i>`;
      }

      const el = document.createElement("div");
      el.className = "fm-item group";
      el.setAttribute("draggable", "true");
      el.innerHTML = `
        ${iconHtml}
        <span class="fm-label text-gray-700 group-hover:text-black pointer-events-none">${name}</span>
      `;

      // drag & drop dossier (optionnel: tu peux garder ton code existant ici)
      if (isDir) {
        el.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          el.classList.add("drag-over");
        });
        el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
        el.addEventListener("drop", (e) => {
          e.preventDefault();
          el.classList.remove("drag-over");
          const draggedName = e.dataTransfer.getData("text/plain");
          if (draggedName && draggedName !== name) {
            const error = window.vfs.move(window.currentFMPath, draggedName, name);
            if (error) alert(error);
            else window.updateFileManagerUI(root);
          }
        });
      }

      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", name);
        e.dataTransfer.effectAllowed = "move";
        el.style.opacity = "0.5";
      });
      el.addEventListener("dragend", () => (el.style.opacity = "1"));

      el.ondblclick = () => {
        if (isDir) {
          window.currentFMPath = window.currentFMPath === "/" ? `/${name}` : `${window.currentFMPath}/${name}`;
          window.updateFileManagerUI(root);
        } else if (isImg) {
          window.openImageViewer(item.src, name, window.currentFMPath);
        } else if (isAudio) {
          window.openWindow("vlc");
          setTimeout(() => {
            if (window.vlcOpenFromNautilus) {
              window.vlcOpenFromNautilus({
                dirPath: window.currentFMPath,
                fileName: name
              });
            }
          }, 60);
        } else {
          // si tu veux: double-clic sur audio => ouvrir VLC plus tard
          window.openWindow("gedit");
          setTimeout(() => window.loadFileInGedit(name, item.content), 100);
        }
      };

      grid.appendChild(el);
    });
  };

  window.fmNavigateUp = function () {
    if (window.currentFMPath === "/") return;
    const parts = window.currentFMPath.split("/");
    parts.pop();
    window.currentFMPath = parts.length === 1 ? "/" : parts.join("/");
    window.updateFileManagerUI();
  };

  window.fmNavigateTo = function (path) {
    window.currentFMPath = path;
    window.updateFileManagerUI();
  };
})();
