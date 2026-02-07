// assets/core/vfs.js
(function () {
    class VirtualFileSystem {
        constructor() {
            this.root = {
                type: "dir",
                name: "/",
                children: {
                home: {
                    type: "dir",
                    children: {
                    user: {
                        type: "dir",
                        children: {
                        Documents: {
                            type: "dir",
                            children: {
                            "secret.txt": { type: "file", content: "Le mot de passe est: ubuntu123" },
                            },
                        },
                        Images: { type: "dir", children: {} },
                        Musique: { type: "dir", children: {} },
                        Bureau: { type: "dir", children: {} },
                        Téléchargements: { type: "dir", children: {} },
                        "readme.txt": {
                            type: "file",
                            content:
                            "Bienvenue sur la simulation Ubuntu Unity!\nUtilisez nano ou gedit pour éditer ce fichier.",
                        },
                        },
                    },
                    },
                },
                etc: { type: "dir", children: { hostname: { type: "file", content: "ubuntu-desktop" } } },
                bin: { type: "dir", children: {} },
                },
            };
            // --- helpers: creation dossiers + fichiers "asset" (src URL) ---
            function ensureDir(node, parts){
                let cur = node;
                for (const p of parts){
                    cur.children = cur.children || {};
                    if (!cur.children[p]) cur.children[p] = { type: "dir", children: {} };
                    cur = cur.children[p];
                }
                return cur;
            }

            function addAssetFile(rootNode, relPath, src, mime){
                const parts = String(relPath).split("/").filter(Boolean);
                const file = parts.pop();
                const dir = ensureDir(rootNode, parts);
                dir.children[file] = { type: "asset", src, mime: mime || "" };
            }

            // Mount dans /home/user/Musique
            const musicDir = this.root.children.home.children.user.children.Musique;
            if (musicDir && musicDir.type === "dir") {
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_appel_de_zion.mp3", "assets/musics/lea_solene_appel_de_zion.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_ce_qui_reste.mp3", "assets/musics/lea_solene_ce_qui_reste.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_je_vais_bien.mp3", "assets/musics/lea_solene_je_vais_bien.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_l_echo_de_l_espoir.mp3", "assets/musics/lea_solene_l_echo_de_l_espoir.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_sous_l_oeil_de_jah.mp3", "assets/musics/lea_solene_sous_l_oeil_de_jah.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/Lea_Solene_sous_la_lumiere_douce.mp3", "assets/musics/lea_solene_sous_la_lumiere_douce.mp3", "audio/mpeg");
                addAssetFile(musicDir, "Lea_Solene/cover.jpg", "assets/musics/cover.jpg", "image/jpeg");
            }
            this.currentPath = ["home", "user"];
            this.history = [];
        }

        notifyChange() {
            if (typeof window.updateFileManagerUI === "function") window.updateFileManagerUI();
        }

        getCwdPathStr() {
            return "/" + this.currentPath.join("/");
        }

        expandUser(pathStr) {
            if (!pathStr) return pathStr;
            if (pathStr === "~") return "/home/user";
            if (pathStr.startsWith("~/")) return "/home/user" + pathStr.slice(1);
            return pathStr;
        }

        toAbsolute(pathStr) {
            pathStr = this.expandUser(pathStr);
            if (!pathStr || pathStr === ".") return this.getCwdPathStr();
            if (pathStr.startsWith("/")) return pathStr;
            const base = this.getCwdPathStr();
            return (base.endsWith("/") ? base : base + "/") + pathStr;
        }

        resolve(pathStr) {
            pathStr = this.expandUser(pathStr);

            let parts;
            let traversePath = [];
            if (pathStr === "/") return { node: this.root, pathArray: [] };

            if (pathStr.startsWith("/")) {
                parts = pathStr.split("/").filter((p) => p.length > 0);
                traversePath = [];
            } else {
                parts = pathStr.split("/").filter((p) => p.length > 0);
                traversePath = [...this.currentPath];
            }

            let current = this.root;
            if (traversePath.length > 0) {
                for (let dir of traversePath) {
                    if (current.children && current.children[dir]) current = current.children[dir];
                    else return null;
                }
            }

            for (let part of parts) {
                if (part === ".") continue;
                if (part === "..") {
                    if (traversePath.length > 0) {
                        traversePath.pop();
                        current = this.root;
                        for (let dir of traversePath) current = current.children[dir];
                    }
                } else {
                    if (current.type === "dir" && current.children[part]) {
                        current = current.children[part];
                        traversePath.push(part);
                    } else {
                        return null;
                    }
                }
            }
            return { node: current, pathArray: traversePath };
        }

        writeFile(pathStr, content) {
            pathStr = this.toAbsolute(pathStr);
            const parts = pathStr.split("/").filter(Boolean);
            const fileName = parts.pop();
            const dirPath = "/" + parts.join("/");

            const dirRes = this.resolve(dirPath || "/");
            if (!dirRes || dirRes.node.type !== "dir") return "Erreur: Dossier introuvable";

            dirRes.node.children[fileName] = { type: "file", content: content };
            this.notifyChange();
            return null;
        }

        readFile(pathStr) {
            pathStr = this.toAbsolute(pathStr);
            const res = this.resolve(pathStr);
            if (!res) return null;
            if (res.node.type === "dir") return null;
            if (res.node.type === "asset") {
                // pour un lecteur audio/image: on renvoie la src
                return res.node.src;
            }
            return res.node.content;
        }


        move(pathStr, itemName, destFolderName) {
            const dirRes = this.resolve(pathStr);
            if (!dirRes || dirRes.node.type !== "dir") return "Erreur: Répertoire source invalide";

            const item = dirRes.node.children[itemName];
            const dest = dirRes.node.children[destFolderName];

            if (!item) return "Erreur: Élément introuvable";
            if (!dest || dest.type !== "dir") return "Erreur: La destination n'est pas un dossier";
            if (dest.children[itemName]) return "Erreur: Un élément porte déjà ce nom dans le dossier cible";

            dest.children[itemName] = item;
            delete dirRes.node.children[itemName];

            this.notifyChange();
            return null;
        }

        ls(args) {
            let targetPathStr = args.find((a) => !a.startsWith("-")) || "";
            let targetNode;

            if (targetPathStr) {
                const res = this.resolve(this.toAbsolute(targetPathStr));
                if (!res) return `ls: impossible d'accéder à '${targetPathStr}': Aucun fichier ou dossier de ce type`;
                targetNode = res.node;
            } else {
                targetNode = this.resolve(".").node;
            }

            if (targetNode.type === "file") return targetPathStr;

            let output = "";
            Object.keys(targetNode.children)
                .sort()
                .forEach((item) => {
                const isDir = targetNode.children[item].type === "dir";
                const colorClass = isDir ? "text-blue-400 font-bold" : "text-white";
                output += `<span class="${colorClass}">${item}</span>  `;
                });
            return `<div class="break-words">${output}</div>`;
        }

        cat(pathStr) {
            if (res.node.type === "asset") {
                return `<div class="whitespace-pre-wrap text-gray-300">[binaire] ${pathStr}</div>`;
            }
            if (!pathStr) return "usage: cat [fichier]";
            const res = this.resolve(this.toAbsolute(pathStr));
            if (!res) return `cat: ${pathStr}: Aucun fichier ou dossier de ce type`;
            if (res.node.type === "dir") return `cat: ${pathStr}: est un dossier`;
            let safeContent = res.node.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `<div class="whitespace-pre-wrap text-gray-300">${safeContent}</div>`;
        }

        mkdir(pathStr) {
            if (!pathStr) return "mkdir: opérande manquant";
            const currentDirNode = this.resolve(".").node;
            if (currentDirNode.children[pathStr]) return `mkdir: impossible de créer '${pathStr}': Existe déjà`;
            currentDirNode.children[pathStr] = { type: "dir", children: {} };
            this.notifyChange();
            return "";
        }

        touch(pathStr) {
            if (!pathStr) return "touch: opérande manquant";
            const currentDirNode = this.resolve(".").node;
            if (!currentDirNode.children[pathStr]) {
                currentDirNode.children[pathStr] = { type: "file", content: "" };
                this.notifyChange();
            }
            return "";
        }

        rm(args) {
            let pathStr = args.find((a) => !a.startsWith("-"));
            if (!pathStr) return "rm: opérande manquant";

            const abs = this.toAbsolute(pathStr);
            const parts = abs.split("/").filter(Boolean);
            const name = parts.pop();
            const parentPath = "/" + parts.join("/");

            const parentRes = this.resolve(parentPath || "/");
            if (!parentRes || parentRes.node.type !== "dir") {
                return `rm: impossible de supprimer '${pathStr}': Inconnu`;
            }

            if (parentRes.node.children[name]) {
                delete parentRes.node.children[name];
                this.notifyChange();
                return "";
            }
            return `rm: impossible de supprimer '${pathStr}': Inconnu`;
        }
    }

    window.VirtualFileSystem = VirtualFileSystem;
    window.vfs = new VirtualFileSystem();
})();
