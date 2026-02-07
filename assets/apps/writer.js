// assets/apps/writer.js
// Writer simple mais "propre":
// - contenteditable + toolbar styles rapides
// - save cache (localStorage) + VFS (session) si vfs existe
// - un seul doc par defaut: /home/user/Documents/Writer.html

(function () {
  function $(id) { return document.getElementById(id); }

  const CACHE_KEY = "writer_doc_html_v1";
  const CACHE_META = "writer_doc_meta_v1";
  const DEFAULT_VFS_PATH = "/home/user/Documents/Writer.html";

  function exec(cmd, value = null) {
    try {
      document.execCommand(cmd, false, value);
    } catch (e) {}
  }

  function sanitizeForSave(html) {
    // petit nettoyage: retire scripts au cas ou
    return String(html || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }

  function initWriter() {
    const editor = $("writer-editor");
    const status = $("writer-status");
    const styleSel = $("writer-style");
    const titleEl = $("writer-docname");

    if (!editor) return;

    let docPath = DEFAULT_VFS_PATH;

    function setStatus(msg) {
      if (!status) return;
      status.textContent = msg || "";
      if (msg) setTimeout(() => { if (status.textContent === msg) status.textContent = ""; }, 1400);
    }

    function saveToCache() {
      const html = sanitizeForSave(editor.innerHTML);
      localStorage.setItem(CACHE_KEY, html);
      localStorage.setItem(CACHE_META, JSON.stringify({ path: docPath, t: Date.now() }));
    }

    function saveToVFS() {
      if (!window.vfs || typeof window.vfs.writeFile !== "function") return false;
      const html = sanitizeForSave(editor.innerHTML);

      // on sauve un HTML "portable"
      const full = `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
      const err = window.vfs.writeFile(docPath, full);
      if (err) { setStatus(err); return false; }
      return true;
    }

    function saveAll() {
      saveToCache();
      const ok = saveToVFS();
      setStatus(ok ? "Sauvegardé (cache + VFS)" : "Sauvegardé (cache)");
    }

    function loadFromCache() {
      const html = localStorage.getItem(CACHE_KEY);
      if (html) editor.innerHTML = html;
      const meta = localStorage.getItem(CACHE_META);
      if (meta) {
        try {
          const m = JSON.parse(meta);
          if (m && m.path) docPath = m.path;
        } catch (e) {}
      }
    }

    function loadFromVFS() {
      if (!window.vfs || typeof window.vfs.readFile !== "function") return false;

      const content = window.vfs.readFile(docPath);
      if (!content) return false;

      // si c'est un HTML complet, on extrait le body grossier
      const m = String(content).match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      editor.innerHTML = m ? m[1] : content;
      return true;
    }

    function setDocNameInUI() {
      if (titleEl) titleEl.textContent = docPath.split("/").pop() || "Writer";
    }

    function applyQuickStyle(val) {
      // on applique via execCommand formatBlock
      // h1/h2/p
      if (val === "h1") exec("formatBlock", "h1");
      else if (val === "h2") exec("formatBlock", "h2");
      else exec("formatBlock", "p");
      editor.focus();
    }

    // toolbar events
    $("writer-bold")?.addEventListener("click", () => { exec("bold"); editor.focus(); });
    $("writer-italic")?.addEventListener("click", () => { exec("italic"); editor.focus(); });
    $("writer-underline")?.addEventListener("click", () => { exec("underline"); editor.focus(); });

    $("writer-ul")?.addEventListener("click", () => { exec("insertUnorderedList"); editor.focus(); });
    $("writer-ol")?.addEventListener("click", () => { exec("insertOrderedList"); editor.focus(); });

    $("writer-left")?.addEventListener("click", () => { exec("justifyLeft"); editor.focus(); });
    $("writer-center")?.addEventListener("click", () => { exec("justifyCenter"); editor.focus(); });
    $("writer-right")?.addEventListener("click", () => { exec("justifyRight"); editor.focus(); });

    $("writer-link")?.addEventListener("click", () => {
      const url = prompt("Lien (URL) ?");
      if (!url) return;
      exec("createLink", url);
      editor.focus();
    });

    $("writer-undo")?.addEventListener("click", () => { exec("undo"); editor.focus(); });
    $("writer-redo")?.addEventListener("click", () => { exec("redo"); editor.focus(); });

    $("writer-save")?.addEventListener("click", saveAll);

    $("writer-saveas")?.addEventListener("click", () => {
      const p = prompt("Chemin VFS (ex: /home/user/Documents/mon_doc.html)", docPath);
      if (!p) return;
      docPath = p.trim();
      setDocNameInUI();
      saveAll();
    });

    styleSel?.addEventListener("change", () => applyQuickStyle(styleSel.value));

    // autosave soft
    let saveTick = null;
    editor.addEventListener("input", () => {
      saveToCache();
      if (saveTick) clearTimeout(saveTick);
      saveTick = setTimeout(() => saveToVFS(), 900);
    });

    // raccourcis
    editor.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveAll();
      }
    });

    // init content
    const loadedVfs = loadFromVFS();
    if (!loadedVfs) loadFromCache();
    if (!editor.innerHTML.trim()) {
      editor.innerHTML = `<h1>Mon document</h1><p>Commence a taper...</p>`;
    }

    setDocNameInUI();
    editor.focus();
  }

  function registerWriterApp() {
    if (!window.appConfigs) window.appConfigs = {};

    window.appConfigs["libreoffice"] = {
      title: "LibreOffice Writer",
      icon: "fa-file-word",
      width: 820,
      height: 600,
      content: `
        <div class="h-full flex flex-col bg-white">
          <div class="bg-gray-100 border-b px-2 py-2 flex items-center gap-2 select-none">
            <div class="text-sm font-bold text-gray-700 mr-2">Writer</div>
            <div class="text-xs text-gray-500 mr-3" id="writer-docname">Writer.html</div>

            <select id="writer-style" class="border rounded px-2 py-1 text-sm">
              <option value="p" selected>Normal</option>
              <option value="h1">Titre</option>
              <option value="h2">Sous-titre</option>
            </select>

            <div class="h-5 w-px bg-gray-300 mx-1"></div>

            <button id="writer-bold" class="px-2 py-1 border rounded hover:bg-gray-50"><b>B</b></button>
            <button id="writer-italic" class="px-2 py-1 border rounded hover:bg-gray-50"><i>I</i></button>
            <button id="writer-underline" class="px-2 py-1 border rounded hover:bg-gray-50"><u>U</u></button>

            <div class="h-5 w-px bg-gray-300 mx-1"></div>

            <button id="writer-ul" class="px-2 py-1 border rounded hover:bg-gray-50">• Liste</button>
            <button id="writer-ol" class="px-2 py-1 border rounded hover:bg-gray-50">1. Liste</button>

            <div class="h-5 w-px bg-gray-300 mx-1"></div>

            <button id="writer-left" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-align-left"></i></button>
            <button id="writer-center" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-align-center"></i></button>
            <button id="writer-right" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-align-right"></i></button>

            <button id="writer-link" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-link"></i></button>

            <div class="h-5 w-px bg-gray-300 mx-1"></div>

            <button id="writer-undo" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-undo"></i></button>
            <button id="writer-redo" class="px-2 py-1 border rounded hover:bg-gray-50"><i class="fas fa-redo"></i></button>

            <div class="flex-grow"></div>

            <span id="writer-status" class="text-xs text-gray-500 mr-2"></span>
            <button id="writer-saveas" class="px-3 py-1 border rounded hover:bg-gray-50 text-sm"><i class="fas fa-save"></i> Enregistrer sous</button>
            <button id="writer-save" class="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"><i class="fas fa-check"></i> Enregistrer</button>
          </div>

          <div class="flex-grow overflow-auto bg-gray-50 p-4">
            <div id="writer-editor"
                class="bg-white shadow-sm border rounded p-6 min-h-[420px] outline-none"
                contenteditable="true"
                spellcheck="true"></div>
          </div>
        </div>
      `,
      onLoad: initWriter,
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    registerWriterApp();
  });
})();
