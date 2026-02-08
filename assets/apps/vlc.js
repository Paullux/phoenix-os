// assets/apps/vlc.js
(function () {
    function fmtTime(s) {
        if (!isFinite(s) || s < 0) s = 0;
        const m = Math.floor(s / 60);
        const ss = Math.floor(s % 60);
        return `${m}:${String(ss).padStart(2, "0")}`;
    }

    function formatTitle(filename) {
        let cleanName = String(filename || "");
        // retire extension
        const parts = cleanName.split(".");
        if (parts.length > 1) parts.pop();
        cleanName = parts.join(".");
        // underscores -> espaces
        cleanName = cleanName.replace(/_/g, " ").trim();
        return cleanName || "Lecture audio";
    }

    function isAudioNode(name, node) {
        const lowerName = String(name || "").toLowerCase();
        const mime = String(node?.mime || "").toLowerCase();

        const byMime = node?.type === "asset" && mime.startsWith("audio/");
        const byExt =
        lowerName.endsWith(".mp3") ||
        lowerName.endsWith(".ogg") ||
        lowerName.endsWith(".wav") ||
        lowerName.endsWith(".flac") ||
        lowerName.endsWith(".m4a");

        return !!(byMime || byExt);
    }

    function pickAudioSrc(node) {
        // selon ton VFS, ca peut etre src, url, content...
        const src =
        node?.src ||
        node?.url ||
        node?.href ||
        node?.content ||
        "";

        return String(src || "");
    }

    function buildPlaylistFromDir(dirPath, clickedName) {
        const res = window.vfs?.resolve?.(dirPath);
        if (!res || res.node?.type !== "dir") return { list: [], startIndex: 0 };

        // cover du dossier courant (si cover.jpg existe)
        let coverSrc = null;
        const c = res.node.children?.["cover.jpg"];
        if (c && c.type === "asset" && String(c.mime || "").startsWith("image/")) {
            coverSrc = c.src;
        }

        const children = res.node.children || {};
        const names = Object.keys(children).sort();

        const list = names
        .filter((n) => isAudioNode(n, children[n]))
        .map((n) => ({
            name: n,
            src: pickAudioSrc(children[n]),
            coverSrc,
        }))
        .filter((t) => !!t.src);

        let startIndex = 0;
        if (clickedName) {
        const idx = list.findIndex((t) => t.name === clickedName);
        if (idx >= 0) startIndex = idx;
        }

        return { list, startIndex };
    }

    // petit "state" global (1 seule instance de VLC)
    const VLC_STATE = {
        bound: false,
        playlist: [],
        index: -1,
        lastPrevTap: 0,
        lastDirPath: "/home/user/Musique/Lea_Solene",
    };

    window.vlcReset = function () {
        // reset state
        VLC_STATE.playlist = [];
        VLC_STATE.index = -1;
        VLC_STATE.lastPrevTap = 0;

        // stop audio element si on l'a deja
        const a = VLC_STATE.audioEl || document.querySelector("#vlc-audio");
        if (a) {
            try {
            a.pause();
            a.currentTime = 0;
            a.removeAttribute("src");
            a.load();
            } catch (e) {}
        }

        // reset UI si la fenetre est encore la
        const title = document.querySelector("#vlc-title");
        if (title) title.textContent = "Aucun média";

        const cover = document.querySelector("#vlc-cover");
        const cone = document.querySelector("#vlc-cone");
        if (cover) {
            cover.src = "";
            cover.classList.add("hidden");
        }
        if (cone) cone.classList.remove("hidden");

        const seek = document.querySelector("#vlc-seek");
        if (seek) seek.value = "0";

        const timeEl = document.querySelector("#vlc-time");
        if (timeEl) timeEl.textContent = "0:00 / 0:00";

        console.log("[VLC] reset OK");
    };

    window.initVLC = function initVLC(winEl) {
        // important: on scope dans la fenetre VLC
        const root =
        winEl ||
        document.getElementById("win-vlc") ||
        document;

        const audio = root.querySelector("#vlc-audio");
        const cover = root.querySelector("#vlc-cover");
        const cone = root.querySelector("#vlc-cone");
        const title = root.querySelector("#vlc-title");

        const prevBtn = root.querySelector("#vlc-prev");
        const playBtn = root.querySelector("#vlc-play");
        const nextBtn = root.querySelector("#vlc-next");

        const seek = root.querySelector("#vlc-seek");
        const timeEl = root.querySelector("#vlc-time");

        const volInput = root.querySelector("#vlc-vol");
        const volFill = root.querySelector(".vlc-vol-fill");
        const volText = root.querySelector("#vlc-vol-text");

        if (!audio || !playBtn || !seek || !volInput) return;
        VLC_STATE.audioEl = audio;

        // evite de binder 15 fois si onLoad est rappele
        if (root.dataset.vlcBound === "1") return;
        root.dataset.vlcBound = "1";

        function setCover(src) {
        if (src) {
            cover.src = src;
            cover.classList.remove("hidden");
            cone.classList.add("hidden");
        } else {
            cover.classList.add("hidden");
            cone.classList.remove("hidden");
        }
        }

        function loadAt(i, autoplay) {
            const playlist = VLC_STATE.playlist;
            if (!playlist.length) return;

            VLC_STATE.index = (i + playlist.length) % playlist.length;
            const t = playlist[VLC_STATE.index];

            title.textContent = formatTitle(t.name);
            setCover(t.coverSrc || null);

            // si c'est deja une URL, pas besoin d'encode special
            const src = String(t.src || "");
            audio.src = src.startsWith("http") || src.startsWith("data:")
                ? src
                : encodeURI(src);

            audio.load();

            if (autoplay) {
                audio.play().catch((err) => {
                console.error("VLC play blocked:", err);
                title.textContent = "Clique sur lecture pour demarrer";
                });
            }
        }

        function ensureSomethingLoadedAndPlay() {
            if (VLC_STATE.index !== -1 && VLC_STATE.playlist.length) return true;

            const dir = VLC_STATE.lastDirPath || "/home/user/Musique";
            const built = buildPlaylistFromDir(dir, null);
            VLC_STATE.playlist = built.list;

            if (!VLC_STATE.playlist.length) {
                title.textContent = "Aucun media";
                setCover(null);
                VLC_STATE.index = -1;
                return false;
            }

            loadAt(0, true);
            return true;
        }

        // --- controls ---
        playBtn.onclick = () => {
        // si rien charge => on essaye de charger et jouer direct
        if (VLC_STATE.index === -1 || !VLC_STATE.playlist.length) {
            ensureSomethingLoadedAndPlay();
            return;
        }

        if (audio.paused) audio.play();
            else audio.pause();
        };

        nextBtn.onclick = () => {
        if (!VLC_STATE.playlist.length) return;
            loadAt(VLC_STATE.index + 1, true);
        };

        prevBtn.onclick = () => {
        if (!VLC_STATE.playlist.length) return;
            const now = Date.now();
            if (now - VLC_STATE.lastPrevTap > 650) {
                audio.currentTime = 0;
            } else {
                loadAt(VLC_STATE.index - 1, true);
            }
            VLC_STATE.lastPrevTap = now;
        };

        audio.onplay = () => (playBtn.innerHTML = `<i class="fas fa-pause"></i>`);
        audio.onpause = () => (playBtn.innerHTML = `<i class="fas fa-play"></i>`);

        seek.addEventListener("input", () => {
        if (!isFinite(audio.duration) || audio.duration <= 0) return;
            const ratio = Number(seek.value) / 1000;
            audio.currentTime = ratio * audio.duration;
        });

        audio.addEventListener("timeupdate", () => {
            const cur = audio.currentTime || 0;
            const dur = audio.duration || 0;

            if (isFinite(dur) && dur > 0) {
                seek.value = String(Math.round((cur / dur) * 1000));
            } else {
                seek.value = "0";
            }

            if (timeEl) timeEl.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
        });

        audio.addEventListener("ended", () => {
            if (!VLC_STATE.playlist.length) return;
            loadAt(VLC_STATE.index + 1, true);
        });

        audio.addEventListener("error", () => {
            console.error("Audio error:", audio.error);
            title.textContent = "Erreur chargement audio";
        });

        // --- volume UI ---
        function applyVolUI(v) {
            const val = Math.max(0, Math.min(100, Number(v)));
            volInput.value = String(val);
            if (volFill) volFill.style.width = val + "%";
            if (volText) volText.textContent = val + "%";
            audio.volume = val / 100;
        }

        volInput.addEventListener("input", (e) => {
            applyVolUI(e.target.value);
        });

        applyVolUI(80);

        // --- API publique: appelee par Nautilus ---
        window.vlcOpenFromNautilus = function ({ dirPath, fileName }) {
        VLC_STATE.lastDirPath = dirPath || VLC_STATE.lastDirPath;

        const built = buildPlaylistFromDir(VLC_STATE.lastDirPath, fileName);
        VLC_STATE.playlist = built.list;

        if (!VLC_STATE.playlist.length) {
            title.textContent = "Aucun media";
            setCover(null);
            VLC_STATE.index = -1;
            return;
        }

        loadAt(built.startIndex || 0, true);
        };

        // init UI
        title.textContent = VLC_STATE.playlist.length ? formatTitle(VLC_STATE.playlist[VLC_STATE.index]?.name) : "Aucun media";
    };
})();
