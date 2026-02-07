// assets/apps/terminal.js
(function () {
    window.updatePrompt = function () {
        try {
            const promptPath = document.getElementById("prompt-path");
            if (!promptPath || !window.vfs) return;

            const path = "/" + vfs.currentPath.join("/");
            promptPath.textContent = path.startsWith("/home/user")
                ? path.replace("/home/user", "~")
                : path;
        } catch (err) {
            console.error("Erreur dans updatePrompt:", err);
        }
    };

    function initTerminal() {
        const input = document.getElementById("term-input");
        const output = document.getElementById("term-output");
        const promptPath = document.getElementById("prompt-path");
        const shellView = document.getElementById("term-view-shell");
        const nanoView = document.getElementById("term-view-nano");
        const nanoText = document.getElementById("nano-textarea");
        const promptLeft = document.getElementById("prompt-left");
        const promptSuffix = document.getElementById("prompt-suffix");
        const echo = document.getElementById("term-echo");

        let historyIndex = -1;
        let currentNanoFile = null;
        let sudoMode = null;

        // 1. DÉFINIR escapeHtml EN PREMIER
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 2. DÉFINIR updateCursor
        function updateCursor() {
            const cursorPos = input.selectionStart;
            const textBefore = input.value.substring(0, cursorPos);
            const textAfter = input.value.substring(cursorPos);
            
            if (input.classList.contains("password-mode")) {
                echo.innerHTML = "";
            } else {
                if (input.value.length > 0) {
                    echo.innerHTML = `${escapeHtml(textBefore)}<span class="term-cursor"></span>${escapeHtml(textAfter)}`;
                } else {
                    echo.innerHTML = '<span class="term-cursor"></span>';
                }
            }
        }

        // 3. DÉFINIR showPrompt et hidePrompt
        function showPrompt() {
            promptLeft.style.display = "";
            promptPath.style.display = "";
            promptSuffix.style.display = "";
            input.classList.remove("password-mode");
            input.value = "";
            updateCursor();
            input.focus();
        }

        function hidePrompt() {
            promptLeft.style.display = "none";
            promptPath.style.display = "none";
            promptSuffix.style.display = "none";
            echo.innerHTML = "";
        }

        // 4. VOS AUTRES FONCTIONS (dedent, colorize, etc.)
        function dedent(str) {
            const lines = String(str).replace(/\r/g, "").split("\n");
            while (lines.length && lines[0].trim() === "") lines.shift();
            while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
            const indents = lines
                .filter((l) => l.trim().length)
                .map((l) => (l.match(/^ */) || [""])[0].length);
            const min = indents.length ? Math.min(...indents) : 0;
            return lines.map((l) => l.slice(min)).join("\n");
        }

        function colorizeUbuntuAscii(ascii) {
            return ascii.replace(/[+\-]+|[s]+|[MNdhmy]+|[o.\/:]+/g, (m) => {
                if (/^[s]+$/.test(m)) return `<span class="nf-mid">${m}</span>`;
                if (/^[MNdhmy]+$/.test(m)) return `<span class="nf-light">${m}</span>`;
                return `<span class="nf-mid">${m}</span>`;
            });
        }

        // Dans votre code de gestion des actions nano
        function saveNanoFile() {
            if (!currentNanoFile) return;
            
            const content = nanoText.value;
            
            // Essayer de récupérer le fichier
            let fileNode = vfs.resolve(currentNanoFile.path);
            
            if (!fileNode) {
                // Le fichier n'existe pas, le créer
                const touchResult = vfs.touch(currentNanoFile.path);
                if (!touchResult || !touchResult.success) {
                    appendText("Erreur lors de la création du fichier", "text-red-500");
                    return;
                }
                fileNode = vfs.resolve(currentNanoFile.path);
            }
            
            if (fileNode && fileNode.node.type === 'file') {
                // Sauvegarder le contenu
                fileNode.node.content = content;
                closeNano();
            } else {
                appendText("Erreur : impossible de sauvegarder", "text-red-500");
            }
        }

        function closeNano() {
            currentNanoFile = null;
            nanoView.classList.add("hidden");
            shellView.classList.remove("hidden");
            input.focus();
        }

        // --- Fonctions d'affichage ---
        function appendHtml(html) {
            const d = document.createElement("div");
            d.className = "mb-1";
            d.innerHTML = html;
            output.appendChild(d);
        }

        function appendText(txt, cls = "text-gray-300") {
            const d = document.createElement("div");
            d.className = cls;
            d.textContent = txt;
            output.appendChild(d);
        }

        function printPromptLine(text) {
            output.insertAdjacentHTML(
                "beforeend",
                `<div><span class="text-green-400 font-bold">user@ubuntu</span>:<span class="text-blue-400 font-bold">${promptPath.textContent}</span>$ ${escapeHtml(text)}</div>`
            );
        }

        function showNormalPrompt() {
            promptLeft.innerHTML = `<span class="text-green-400 font-bold">user@ubuntu</span><span class="text-white">:</span>`;
            promptSuffix.textContent = "$";
            promptPath.classList.remove("hidden");
            promptSuffix.classList.remove("hidden");
            input.classList.remove("password-mode");
            input.value = "";
            echo.textContent = "";
            input.focus();
        }

        function showSudoPrompt(username) {
            promptLeft.innerHTML = `<span class="text-gray-200">[sudo] password for ${username}:</span>`;
            promptSuffix.textContent = "";
            promptPath.classList.add("hidden");
            promptSuffix.classList.add("hidden");
            input.classList.add("password-mode");
            input.value = "";
            echo.textContent = "";
            input.focus();
        }
        // --- Logique des commandes ---
        function handleCommand(fullCmd) {
            const parts = fullCmd.split(" ").filter(Boolean);
            const cmd = parts[0] || "";
            const args = parts.slice(1);
            let response = "";
            let responseIsHtml = false;

            switch (cmd) {
                case "cat": {
                    if (!args[0]) {
                        response = "cat: argument manquant";
                        break;
                    }
                    const catPath = vfs.toAbsolute(args[0]);
                    const catRes = vfs.resolve(catPath);
                    
                    if (!catRes) {
                        response = `cat: ${args[0]}: Aucun fichier ou dossier de ce type`;
                    } else if (catRes.node.type === "dir") {
                        response = `cat: ${args[0]}: est un dossier`;
                    } else {
                        response = catRes.node.content || "";
                    }
                    break;
                }

                case "nano": {
                    if (!args[0]) {
                        response = "nano: argument manquant";
                        break;
                    }
                    
                    const nanoPath = vfs.toAbsolute(args[0]);
                    const nanoRes = vfs.resolve(nanoPath);
                    
                    // Si le fichier existe et c'est un dossier, erreur
                    if (nanoRes && nanoRes.node.type === "dir") {
                        response = `nano: ${args[0]}: est un dossier`;
                        break;
                    }
                    
                    // Ouvrir nano (création ou édition)
                    currentNanoFile = {
                        path: nanoPath,
                        name: args[0],
                        content: nanoRes ? nanoRes.node.content || "" : ""
                    };
                    
                    shellView.classList.add("hidden");
                    nanoView.classList.remove("hidden");
                    
                    document.querySelector(".nano-header").textContent = 
                        `GNU nano - ${currentNanoFile.name}`;
                    nanoText.value = currentNanoFile.content;
                    nanoText.focus();
                    
                    return; // Important : ne pas afficher de réponse
                }

                case "mkdir": {
                    if (!args[0]) {
                        response = "mkdir: argument manquant";
                        break;
                    }
                    const mkdirPath = vfs.toAbsolute(args[0]);
                    const result = vfs.mkdir(mkdirPath);
                    if (!result.success) {
                        response = `mkdir: ${result.error}`;
                    }
                    break;
                }

                case "touch": {
                    if (!args[0]) {
                        response = "touch: argument manquant";
                        break;
                    }
                    const touchPath = vfs.toAbsolute(args[0]);
                    const result = vfs.touch(touchPath);
                    if (!result.success) {
                        response = `touch: ${result.error}`;
                    }
                    break;
                }

                case "rm": {
                    if (!args[0]) {
                        response = "rm: argument manquant";
                        break;
                    }
                    const rmPath = vfs.toAbsolute(args[0]);
                    const result = vfs.rm(rmPath);
                    if (!result.success) {
                        response = `rm: ${result.error}`;
                    }
                    break;
                }
                case "htop": {
                    const uptime = "02:45:12";
                    const loadAvg = "0.45, 0.52, 0.48";
                    
                    // Génération de pourcentages entiers aléatoires
                    // Math.floor(Math.random() * 101) donne un entier entre 0 et 100
                    const cpu1 = Math.floor(Math.random() * 101);
                    const cpu2 = Math.floor(Math.random() * 101);
                    const memPercent = Math.floor(Math.random() * 101);
                    const memUsed = (memPercent * 0.08).toFixed(2); // Simule Go sur 8Go

                    // Fonction interne pour générer une barre [||||||      ]
                    const getBar = (percent, colorClass) => {
                        const totalBars = 20;
                        const filledBars = Math.round((percent / 100) * totalBars);
                        const barStr = "|".repeat(filledBars);
                        const emptyStr = " ".repeat(totalBars - filledBars);
                        return `[<span class="${colorClass} font-bold">${barStr}</span>${emptyStr} <span class="text-white">${percent}%</span>]`;
                    };

                    response = `
                        <div class="font-mono text-xs">
                            <div class="flex gap-10">
                                <div>
                                    <div>1 ${getBar(cpu1, "text-blue-400")}</div>
                                    <div>2 ${getBar(cpu2, "text-green-400")}</div>
                                </div>
                                <div>
                                    <div>Mem ${getBar(memPercent, "text-cyan-400")} ${memUsed}G/7.77G</div>
                                    <div>Swp ${getBar(0, "text-red-400")} 0K/2.00G</div>
                                </div>
                            </div>
                            <div class="mt-2">
                                Tasks: 45, 122 thr; 1 running<br>
                                Load average: ${loadAvg} | Uptime: ${uptime}
                            </div>
                            <table class="w-full mt-2 text-left">
                                <tr class="bg-green-800 text-black px-1">
                                    <th>PID</th><th>USER</th><th>CPU%</th><th>MEM%</th><th>TIME+</th><th>Command</th>
                                </tr>
                                <tr><td>1204</td><td>user</td><td>${Math.floor(Math.random() * 5)}</td><td>1.2</td><td>0:04.12</td><td>/usr/bin/gnome-shell</td></tr>
                                <tr><td>3451</td><td>user</td><td>${Math.floor(Math.random() * 10)}</td><td>0.5</td><td>0:01.05</td><td>/usr/lib/firefox/firefox</td></tr>
                                <tr><td>${Math.floor(Math.random() * 9000 + 1000)}</td><td>root</td><td>0.0</td><td>0.0</td><td>0:00.02</td><td>[kworker/u16:1]</td></tr>
                            </table>
                            <div class="mt-2 text-gray-500 italic">[Appuyez sur n'importe quelle touche pour quitter (simulé)]</div>
                        </div>
                    `;
                    responseIsHtml = true;
                    break;
                }
                case "df":
                    response = `
                        Filesystem      Size  Used Avail Use%
                        /dev/sda1        20G   12G   8G   60%
                        tmpfs           1.9G     0  1.9G   0%
                        /dev/sim        10G   2G    8G   20%
                            `;
                    break;
                case "pwd":
                    response = "/" + vfs.currentPath.join("/");
                    break;
                case "ls":
                    response = vfs.ls(args);
                    responseIsHtml = true;
                    break;
                case "cd": {
                    const target = args[0] || "~";
                    const abs = vfs.toAbsolute(target);
                    const res = vfs.resolve(abs);
                    if (res && res.node.type === "dir") {
                        vfs.currentPath = res.pathArray;
                        window.updatePrompt();
                    } else {
                        response = `bash: cd: ${target}: Aucun fichier ou dossier de ce type`;
                    }
                    break;
                }
                case "help":
                    response =
                    "Commandes: ls, cd, mkdir, touch, rm, cat, nano, pwd, clear, exit, neofetch, apt";
                    break;
                case "apt": {
                    const sub = args[0];
                    if (sub === "update") {
                        response = `
                            Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
                            Hit:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease
                            Reading package lists... Done
                            0 package can be upgraded.
                        `;
                    } else if (sub === "upgrade") {
                        response = `
                            Reading package lists... Done
                            Calculating upgrade... Done
                            0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
                        `;
                    } else if (sub === "install" && args[1] === "cowsay") {
                        response = `
                            Lecture des listes de paquets… Fait
                            Construction de l'arbre des dépendances… Fait
                            Lecture des informations d'état… Fait
                            Les NOUVEAUX paquets suivants seront installés : cowsay
                            0 mis à jour, 1 nouvellement installés, 0 à enlever et 0 non mis à jour.

                            ╭────────────╮
                            │ Mooo ! 🐮  │
                            ╰────────────╯
                        `;
                        responseIsHtml = true;
                    } else if (sub === "install" && args[1] !== "cowsay") {
                        response = `
                            <div class="text-gray-300"><span class="nf-mid">E:</span>
                            Reading package lists... Done
                            Building dependency tree... Done
                            Reading state information... Done
                            E: Unable to locate package ${args[1]}</div>
                        `;
                        responseIsHtml = true;
                    } else {
                        response = `E: Opération ${sub || ""} non reconnue`;
                    }
                    break;
                }
                case "neofetch": {
                const art = dedent(`
                                   .-/+oossssssoo+/-.
                                :+ssssssssssssssssssss+:
                              +ssssssssssssssssssyyssssssss+-
                            .ossssssssssssssssssdMMMNysssssso.
                          /ssssssssssshdmmNNmmyNMMMMhsssssssss/
                         +ssssssssshmydMMMMMMMNddddysssssssssss+
                        /sssssssshNMMMyhhyyyyhmNMMMNhsssssssssss/
                        .ssssssssdMMMNhsssssssssshNMMMdssssssssss.
                        +sssshhhyNMMNyssssssssssssyNMMMysssssssss+
                        ossyNMMMNyMMhsssssssssssssshmmmhssssssssso
                        ossyNMMMNyMMhsssssssssssssshmmmhssssssssso
                        +sssshhhyNMMNyssssssssssssyNMMMysssssssss+
                        .ssssssssdMMMNhsssssssssshNMMMdssssssssss.
                         /sssssssshNMMMyhhyyyyhdNMMMNhssssssssss/
                          +sssssssssdmydMMMMMMMMddddyssssssssss+
                            /ssssssssssshdmNNNNmyNMMMMhsssssss/
                             .ossssssssssssssssssdMMMNyssssso.
                               -+sssssssssssssssssyyysssss+-
                                   :+sssssssssssssssssss+:
                                      .-/+oossssssoo+/-.
                    `);
                    const info = `
                        <div class="space-y-1 text-left">
                            <div><span class="nf-mid font-bold">user</span><span class="nf-light">@</span><span class="nf-mid font-bold">ubuntu</span></div>
                            <div class="nf-light">-------------</div>
                            <div><span class="nf-mid">OS</span><span class="nf-light">: Ubuntu 24.04 LTS</span></div>
                            <div><span class="nf-mid">Kernel</span><span class="nf-light">: 6.8.0-generic</span></div>
                            <div><span class="nf-mid">Shell</span><span class="nf-light">: bash</span></div>
                            <div><span class="nf-mid">Terminal</span><span class="nf-light">: web-terminal</span></div>
                        </div>`;
                    response = `
                        <div class="flex items-start gap-6 text-xs font-mono">
                            <pre class="leading-tight">${colorizeUbuntuAscii(art)}</pre>
                            ${info}
                        </div>`;
                    responseIsHtml = true;
                    break;
                }
                case "clear":
                    output.innerHTML = "";
                    return;
                case "exit":
                    if (typeof closeWindow === "function") closeWindow("terminal");
                    return;
                default:
                    response = `bash: ${cmd}: commande introuvable`;
            }

            if (response) {
                if (responseIsHtml) appendHtml(response);
                else appendText(response);
            }
        }

        // 5. EVENT LISTENERS À LA FIN
        input.addEventListener("input", updateCursor);
        
        input.addEventListener("click", updateCursor);
        
        input.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
                updateCursor();
            }
        });

        input.addEventListener("keydown", (e) => {
            // Navigation dans l'historique avec flèches
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (vfs.history.length === 0) return;
                
                if (historyIndex === -1) {
                    historyIndex = vfs.history.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                
                input.value = vfs.history[historyIndex];
                echo.textContent = vfs.history[historyIndex];
                // Placer le curseur à la fin
                setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
                return;
            }
            
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex === -1) return;
                
                if (historyIndex < vfs.history.length - 1) {
                    historyIndex++;
                    input.value = vfs.history[historyIndex];
                    echo.textContent = vfs.history[historyIndex];
                } else {
                    historyIndex = -1;
                    input.value = "";
                    echo.textContent = "";
                }
                
                setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const rawValue = input.value;
                const cleanValue = rawValue.trim();

                if (sudoMode) {
                    const passwordAttempt = rawValue; // Ce que l'utilisateur a tapé (invisible)
                    input.value = "";
                    echo.textContent = "";

                    // On vérifie le mot de passe
                    if (passwordAttempt === "ubuntu123") {
                        const cmdToRun = sudoMode.cmd;
                        sudoMode = null;
                        
                        handleCommand(cmdToRun);
                        
                        showPrompt(); // ← Au lieu de tout réécrire
                    } else {
                        // MAUVAIS MOT DE PASSE
                        sudoMode.tries++;
                        if (sudoMode.tries >= 3) {
                            appendText("sudo: 3 incorrect password attempts", "text-red-500");
                            sudoMode = null;
                            showPrompt();

                            input.value = "";
                            echo.textContent = "";
                            input.focus();
                        } else {
                            // On reste en mode masqué et on redemande le MDP dans l'output
                            appendText("Sorry, try again.", "text-gray-300");
                            appendText(`[sudo] password for user: `, "text-gray-200");
                        }
                    }
                    
                    // Toujours scroller pour voir le résultat ou le nouveau prompt
                    shellView.scrollTop = shellView.scrollHeight;
                    return; // On arrête là pour ne pas traiter le MDP comme une commande
                }

                if (!cleanValue) return;

                vfs.history.push(cleanValue);
                historyIndex = -1;
                printPromptLine(cleanValue);
                input.value = "";
                echo.textContent = "";

                if (cleanValue === "sudo") {
                    appendHtml(`
                        <div class="text-gray-300"># 1) Respectez la vie privée des autres.</div>
                        <div class="text-gray-300"># 2) Réfléchissez avant de taper.</div>
                        <div class="nf-mid font-bold"># 3) Un grand pouvoir implique de grandes responsabilités.</div>`);
                // --- Lors de la détection initiale du sudo ---
                } else if (cleanValue.startsWith("sudo ")) {
                    const actualCmd = cleanValue.slice(5).trim();
                    sudoMode = { tries: 0, username: "user", cmd: actualCmd };

                    hidePrompt(); // ← Au lieu de tout réécrire
                    
                    appendText(`[sudo] password for user: `, "text-gray-200");
                    input.classList.add("password-mode");
                    input.value = "";
                    input.focus();
                } else {
                    handleCommand(cleanValue);
                }

                shellView.scrollTop = shellView.scrollHeight;
            }
        });
        input.addEventListener("input", () => {
            const cursorPos = input.selectionStart;
            const textBefore = input.value.substring(0, cursorPos);
            const textAfter = input.value.substring(cursorPos);
            
            if (input.classList.contains("password-mode")) {
                echo.innerHTML = "";
            } else {
                // Afficher le curseur seulement s'il y a du texte
                if (input.value.length > 0) {
                    echo.innerHTML = `${escapeHtml(textBefore)}<span class="term-cursor"></span>${escapeHtml(textAfter)}`;
                } else {
                    // Pas de texte = juste le curseur clignotant
                    echo.innerHTML = '<span class="term-cursor"></span>';
                }
            }
        });

        // Gérer aussi les déplacements de curseur (clic, flèches gauche/droite)
        input.addEventListener("click", updateCursor);
        input.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
                updateCursor();
            }
        });
        // À la fin de initTerminal(), après les autres event listeners :
        document.querySelector('.nano-footer').addEventListener('click', (e) => {
            if (e.target.closest('[data-action="save"]')) {
                saveNanoFile();
            } else if (e.target.closest('[data-action="exit"]')) {
                closeNano();
            }
        });
        // INITIALISATION À LA FIN DE initTerminal (AVANT la fermeture de la fonction)
        window.updatePrompt();
        updateCursor(); // ← ICI c'est bon, on est dans le scope
        input.focus();
    }

    // 6. INITIALISATION FINALE
    window.initTerminal = initTerminal;
})();