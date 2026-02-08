(function () {
  // historique simple
  let history = [];
  let index = -1;
  let internalNav = false;

  function getIframe() {
    return document.getElementById("firefox-iframe");
  }

  function getInput() {
    return document.getElementById("firefox-url-input");
  }

  function normalizeUrl(url) {
    let u = (url || "").trim();
    if (!u) return null;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }

  function loadUrl(url, fromHistory = false) {
    const iframe = getIframe();
    const input = getInput();
    const clean = normalizeUrl(url);
    if (!iframe || !clean) return;

    internalNav = fromHistory;

    iframe.src = clean;
    if (input) input.value = clean;

    if (!fromHistory) {
      // coupe l'historique futur
      history = history.slice(0, index + 1);
      history.push(clean);
      index = history.length - 1;
    }
  }

  // ---------- API globale ----------

  // Ta liste de favoris par défaut
  const defaultBookmarks = [
      { name: "Wiki", url: "https://en.wikipedia.org/wiki/Ubuntu_Unity" },
      { name: "Google Maps", url: "https://maps.google.com/maps?q=Paris&output=embed" },
      { name: "Archive", url: "https://archive.org" },
      { name: "Dailymotion", url: "https://www.dailymotion.com/embed/video/x6mbdni" },
      { name: "Site Officiel de Lea Solène", url: "https://lea-solene.fr/" },
      { name: "Marv Web", url: "https://marv-bot.fr/" },
      { name: "Undead Murderer", url: "https://www.undead-murderer.com/" },
      { name: "Mon Blog", url: "https://blog.paulwoisard.fr/" },
  ];

  function renderBookmarks() {
      const bar = document.getElementById("firefox-bookmarks");
      if (!bar) return;
      
      bar.innerHTML = ""; // On nettoie
      defaultBookmarks.forEach(fav => {
          const btn = document.createElement("button");
          btn.className = "px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-100 flex items-center gap-1 transition-colors";
          btn.innerHTML = `<i class="fas fa-globe text-blue-400"></i> ${fav.name}`;
          btn.onclick = () => loadUrl(fav.url);
          bar.appendChild(btn);
      });
  }

  window.firefoxGo = function () {
    const input = getInput();
    if (!input) return;
    loadUrl(input.value);
  };

  window.firefoxReload = function () {
    const iframe = getIframe();
    if (!iframe) return;
    iframe.src = iframe.src;
  };

  window.firefoxPrevious = function () {
    if (index <= 0) return;
    index--;
    console.log(`Previous Calls URL ${history[index]}`)
    loadUrl(history[index], true);
  };

  window.firefoxNext = function () {
    if (index >= history.length - 1) return;
    index++;
    console.log(`Next Calls URL ${history[index]}`)
    loadUrl(history[index], true);
  };

  window.firefoxAddFav = function() {
    const input = getInput();
    if (!input || !input.value) return;
    
    const newUrl = input.value;
    const newName = newUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    
    // Ajoute à la liste mémoire
    defaultBookmarks.push({ name: newName, url: newUrl });
    
    // Rafraîchit la barre visuelle
    renderBookmarks();
  };

  // ---------- init ----------

  window.initFirefox = function () {
    console.log("[firefox.js] charge");
    const iframe = getIframe();
    const input = getInput();
    if (!iframe || !input) return;

    renderBookmarks();

    const startUrl = normalizeUrl(input.value);
    if (startUrl) {
      history = [startUrl];
      index = 0;
      iframe.src = startUrl;
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") window.firefoxGo();
    });
  };
})();
