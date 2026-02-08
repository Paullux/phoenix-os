// assets/app-configs.js
(function () {
    window.appConfigs = window.appConfigs || {};

    Object.assign(window.appConfigs, {
        terminal: {
            title: "Terminal",
            icon: "fa-terminal", 
            width: 650,
            height: 420,
            content: `
                <div id="term-view-shell" class="terminal-body text-sm" onclick="document.getElementById('term-input').focus()">
                    <div id="term-output" class="space-y-1">
                        <div class="text-gray-200">Bienvenue sur Ubuntu 16.04.7 LTS (GNU/Linux 4.4.0-186-generic x86_64)</div>
                        <div class="text-gray-400">0 paquets peuvent être mis à jour.</div>
                    </div>

                    <div id="invite" class="term-prompt">
                        <span id="prompt-left">
                            <span class="text-green-400 font-bold">user@ubuntu</span><span class="text-white">:</span>
                        </span>

                        <span id="prompt-path" class="text-blue-400 font-bold">~</span>
                        <span id="prompt-suffix" class="text-white">$</span>&nbsp;

                        <span id="term-echo" class="text-white"></span>
                        <input id="term-input" type="text" autocomplete="off" spellcheck="false">
                    </div>
                </div>

                <div id="term-view-nano" class="nano-ui hidden">
                    <div class="nano-header">GNU nano 2.5.3</div>
                    <textarea id="nano-textarea" class="nano-content"></textarea>
                    <div class="nano-footer">
                        <div class="nano-action" data-action="save"><span class="font-bold">^O</span> Écrire</div>
                        <div class="nano-action" data-action="exit"><span class="font-bold">^X</span> Quitter</div>
                    </div>
                </div>
            `,
            onLoad: () => {
                const waitForPromptPath = () => {
                    const promptPath = document.getElementById('prompt-path');
                    if (promptPath) {
                        console.log("✅ promptPath trouvé, lancement du terminal");
                        window.initTerminal();
                    } else {
                        console.log("⏳ En attente de #prompt-path...");
                        setTimeout(waitForPromptPath, 50);
                    }
                };
                waitForPromptPath();
            }
        },

        gedit: {
            title: "Éditeur de texte",
            icon: "fa-edit",
            width: 600,
            height: 500,
            content: `
                <div class="flex flex-col h-full bg-gray-100">
                <div class="bg-gray-200 border-b p-2 flex items-center space-x-2">
                    <button onclick="document.getElementById('gedit-textarea').value=''"
                    class="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">
                    <i class="fas fa-file"></i> Nouveau
                    </button>
                    <button onclick="window.saveGeditFile()"
                    class="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">
                    <i class="fas fa-save"></i> Enregistrer
                    </button>
                    <div class="border-l border-gray-400 h-4 mx-2"></div>
                    <span class="text-sm text-gray-600">Nom:</span>
                    <input type="text" id="gedit-filename" value="document.txt"
                    class="border px-2 py-1 text-sm rounded w-40">
                </div>
                <textarea id="gedit-textarea"
                    class="flex-grow p-4 outline-none resize-none font-mono text-gray-800 text-sm"
                    placeholder="Commencez à taper..."></textarea>
                </div>
            `,
        },

        "file-manager": {
            title: "Dossier Personnel",
            icon: "fa-folder",
            width: 700,
            height: 450,
            content: `
                <div class="flex h-full flex-col">
                <div class="bg-gray-100 border-b p-2 flex items-center space-x-2 text-sm select-none">
                    <button class="hover:bg-gray-300 p-1 px-2 rounded text-gray-600"
                    onclick="fmNavigateUp()" title="Dossier parent"><i class="fas fa-arrow-up"></i></button>
                    <div class="flex-grow flex bg-white border rounded items-center">
                    <i class="fas fa-pen text-gray-400 ml-2 text-xs"></i>
                    <div id="fm-path" class="px-2 py-1 flex-grow text-gray-600 font-mono text-xs">/home/user</div>
                    </div>
                </div>
                <div class="flex flex-grow overflow-hidden">
                    <div class="w-40 bg-gray-100 border-r p-2 text-sm text-gray-700 flex-shrink-0 flex flex-col gap-1 select-none">
                    <div class="p-1 font-bold mb-1 text-gray-500 uppercase text-xs">Lieux</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user')"><i class="fas fa-home mr-3 text-gray-500"></i> Dossier</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user/Bureau')"><i class="fas fa-desktop mr-3 text-gray-500"></i> Bureau</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user/Documents')"><i class="fas fa-file-alt mr-3 text-gray-500"></i> Documents</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user/Musique')"><i class="fas fa-file-alt mr-3 text-gray-500"></i> Musique</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user/Images')"><i class="fas fa-images mr-3 text-gray-500"></i> Images</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/home/user/Téléchargements')"><i class="fas fa-download mr-3 text-gray-500"></i> Téléch.</div>
                    <div class="p-1 hover:bg-orange-100 cursor-pointer rounded flex items-center"
                        onclick="fmNavigateTo('/')"><i class="fas fa-hdd mr-3 text-gray-500"></i> Ordinateur</div>
                    </div>
                    <div id="fm-grid"
                    class="flex-grow bg-white p-4 grid grid-cols-4 gap-4 content-start auto-rows-max overflow-y-auto select-none"></div>
                </div>
                </div>
            `,
            onLoad(winEl){
                window.nautilusRootEl = winEl;
                window.currentFMPath = "/home/user";
                setTimeout(() => window.updateFileManagerUI(winEl), 0);
            }
        },

        vlc: {
            title: "VLC media player",
            icon: "fa-cone",
            width: 820,
            height: 520,
            content: `
                <div class="vlc-wrap">
                    <div class="vlc-stage">
                        <img id="vlc-cover" class="vlc-cover hidden" src="" alt="">
                        <img
                            src="assets/logos/vlc.svg"
                            alt="VLC"
                            id="vlc-cone"
                            class="vlc-cone" />
                    </div>

                    <div class="vlc-bar">
                        <div class="vlc-left">
                            <button id="vlc-prev" class="vlc-btn" title="Précédent"><i class="fas fa-step-backward"></i></button>
                            <button id="vlc-play" class="vlc-btn" title="Lecture/Pause"><i class="fas fa-play"></i></button>
                            <button id="vlc-next" class="vlc-btn" title="Suivant"><i class="fas fa-step-forward"></i></button>
                        </div>

                        <div class="vlc-center">
                            <div id="vlc-time" class="vlc-time">0:00 / 0:00</div>
                            <input id="vlc-seek" class="vlc-seek" type="range" min="0" max="1000" value="0">
                        </div>

                        <div class="vlc-right">
                            <div class="vlc-vol">
                                <i class="fas fa-volume-up"></i>
                                <div class="vlc-vol-triangle-wrapper">
                                    <div class="vlc-vol-fill"></div>
                                    <input id="vlc-vol" type="range" min="0" max="100" value="80">
                                </div>
                                <span id="vlc-vol-text" style="font-size: 10px;">80%</span>
                            </div>
                        </div>
                        
                        <audio id="vlc-audio"></audio>
                    </div>
                    <div id="vlc-title" class="vlc-title">Aucun média</div>
                </div>
            `,
            onLoad(winEl){
                if (typeof window.vlcReset === "function") {
                    window.vlcReset();
                }
                window.initVLC(winEl);
            }
        },

        imageviewer: {
            title: "Visionneuse d'images",
            icon: "fa-image",
            width: 720,
            height: 520,
            content: `
                <div class="imgv-wrap">
                <div class="imgv-stage">
                    <button id="imgv-prev" class="imgv-nav imgv-prev" title="Précédent">‹</button>
                    <img id="imgv-img" class="imgv-img" src="" alt="">
                    <button id="imgv-next" class="imgv-nav imgv-next" title="Suivant">›</button>
                </div>
                <div id="imgv-name" class="imgv-name">-</div>
                </div>
            `,
            onLoad(win) {
                // rien, tout passe par openImageViewer(...)
            }
        },

        firefox: {
            title: "Mozilla Firefox",
            icon: "fab fa-firefox",
            width: 900,
            height: 560,
            content: `
                <div class="flex flex-col h-full">
                    <!-- Toolbar -->
                    <div id="firefox-url" class="bg-gray-100 border-b p-2 flex items-center space-x-2">
                        <button class="text-gray-500 hover:text-gray-800 p-1" onclick="window.firefoxPrevious && window.firefoxPrevious()"><i class="fas fa-arrow-left"></i></button>
                        <button class="text-gray-500 hover:text-gray-800 p-1" onclick="window.firefoxNext && window.firefoxNext()"><i class="fas fa-arrow-right"></i></button>
                        <button class="text-gray-500 hover:text-gray-800 p-1" onclick="window.firefoxReload && window.firefoxReload()"><i class="fas fa-redo"></i></button>

                        <div class="flex-grow flex items-center bg-white border rounded px-2">
                        <input type="text" id="firefox-url-input" class="w-full py-1 text-sm text-gray-700 outline-none"
                            value="https://www.wikipedia.org" placeholder="Entrez une URL (ex: wikipedia.org)">
                        </div>

                        <button class="text-gray-500 hover:text-gray-800 p-1" title="Ajouter aux favoris" onclick="window.firefoxAddFav()">
                        <i class="fas fa-star text-yellow-500"></i>
                        </button>

                        <button class="text-gray-500 hover:text-gray-800 p-1" onclick="window.firefoxGo()">
                        <i class="fas fa-arrow-right text-green-600"></i>
                        </button>
                    </div>

                    <!-- Bookmarks bar -->
                    <div id="firefox-bookmarks" class="bg-gray-50 border-b px-2 py-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap"></div>

                    <!-- Viewport -->
                    <div class="relative flex-grow w-full">
                        <iframe id="firefox-iframe" src="https://www.wikipedia.org"
                            class="absolute inset-0 w-full h-full border-none bg-white"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>

                        <!-- Fallback overlay (site bloque iframe) -->
                        <div id="firefox-blocked"
                        class="hidden absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
                            <div class="max-w-lg w-full bg-white border rounded-lg shadow p-5 text-gray-800">
                                <div class="flex items-start gap-3">
                                    <div class="text-2xl">🚫</div>
                                        <div class="flex-1">
                                            <div class="font-bold text-lg">Ce site bloque l'intégration (iframe)</div>
                                            <div class="text-sm text-gray-600 mt-1">
                                                Certains sites refusent d'etre affiches dans une iframe (X-Frame-Options / CSP).
                                            </div>

                                            <div class="mt-3 text-sm">
                                                <div class="font-semibold">URL</div>
                                                <div id="firefox-blocked-url" class="break-all text-gray-700 mt-1"></div>
                                            </div>

                                            <div class="mt-4 flex flex-wrap gap-2">
                                                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                                                    onclick="window.firefoxCopyBlockedUrl()">Copier l'URL</button>
                                                <button class="px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm"
                                                    onclick="window.firefoxOpenExternal()">Ouvrir dans le navigateur</button>
                                                <button class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm"
                                                onclick="window.firefoxHideBlocked()">Fermer</button>
                                            </div>

                                            <div class="mt-4 text-xs text-gray-500">
                                            Astuce: garde en favoris surtout des sites "compatibles iframe" pour une experience fluide.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            onLoad: function () {
                if (typeof window.initFirefox === "function") {
                    window.initFirefox();
                } else {
                    console.warn("[firefox] initFirefox pas encore charge");
                }
            },
        },

        trash: {
            title: "Corbeille",
            icon: "fa-trash-alt",
            width: 600,
            height: 420,
            content: `
                <div class="h-full bg-white">
                <div class="bg-gray-100 border-b p-2 text-sm text-gray-700 flex items-center justify-between">
                    <div class="font-bold">Corbeille</div>
                    <button class="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                    onclick="alert('Vider la corbeille (simulation)')">Vider</button>
                </div>
                <div class="p-6 text-gray-500 text-sm">(simulation) La corbeille est vide.</div>
                </div>
            `,
        },

        settings: {
            title: "Paramètres",
            icon: "fa-cog",
            width: 760,
            height: 540,
            // contenu injecté par assets/apps/settings.js
            content: `<div id="settings-root" class="settings-app"></div>`,
            onLoad: function () {
                if (window.SettingsApp && typeof window.SettingsApp.onLoad === "function") {
                    window.SettingsApp.onLoad();
                }
            },
        },
    });
})();
