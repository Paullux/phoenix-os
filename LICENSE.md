# GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc.
<https://fsf.org/>

Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

---

## Preamble

The GNU General Public License is a free, copyleft license for
software and other kinds of works.

The licenses for most software and other practical works are designed
to take away your freedom to share and change the works. By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users. We, the Free Software Foundation, use the
GNU General Public License for most of our software; it applies also to
any other work released this way by its authors. You can apply it to
your programs, too.

When we speak of free software, we are referring to freedom, not price.
Our General Public Licenses are designed to make sure that you have the
freedom to distribute copies of free software (and charge for them if
you wish), that you receive source code or can get it if you want it,
that you can change the software or use pieces of it in new free
programs, and that you know you can do these things.

To protect your rights, we need to prevent others from denying you
these rights or asking you to surrender the rights. Therefore, you have
certain responsibilities if you distribute copies of the software, or
if you modify it: responsibilities to respect the freedom of others.

For example, if you distribute copies of such a program, whether
gratis or for a fee, you must pass on to the recipients the same
freedoms that you received. You must make sure that they, too, receive
or can get the source code. And you must show them these terms so they
know their rights.

Developers that use the GNU GPL protect your rights with two steps:
(1) assert copyright on the software, and (2) offer you this License
giving you legal permission to copy, distribute and/or modify it.

For the developers' and authors' protection, the GPL clearly explains
that there is no warranty for this free software. For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

Some devices are designed to deny users access to install or run
modified versions of the software inside them, although the manufacturer
can do so. This is fundamentally incompatible with the aim of protecting
users' freedom to change the software. The systematic pattern of such
abuse occurs in the area of products for individuals to use, which is
precisely where it is most unacceptable. Therefore, we have designed
this version of the GPL to prohibit the practice for those products. If
such problems arise substantially in other domains, we stand ready to
extend this provision to those domains in future versions of the GPL,
as needed to protect the freedom of users.

Finally, every program is threatened constantly by software patents.
States should not allow patents to restrict development and use of
software on general-purpose computers, but in those that do, we wish to
avoid the special danger tha
simulation d'environnement de bureau (Web Desktop) inspirée par l'interface **Ubuntu Unity**. Ce projet a été conçu pour offrir une expérience multitâche fluide.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)

## 🌟 Fonctionnalités

Phoenix OS intègre plusieurs applications inspirées de l’écosystème Ubuntu, réécrites entièrement en HTML, CSS et JavaScript. Elles ne sont pas de simples maquettes: chacune possède une logique propre et s’intègre au gestionnaire de fenêtres.

- **Nautilus** (Gestionnaire de fichiers)
Explorateur de fichiers basé sur un système de fichiers virtuel (VFS).
Navigation par dossiers, affichage en grille, détection des types de fichiers (audio, image), gestion des covers de dossiers et ouverture contextuelle des applications (VLC, visionneuse d’images, éditeur de texte).
- **Terminal**
Terminal simulé permettant d’exécuter des commandes courantes (ls, cd, cat, sudo apt update, etc.).
Gestion du prompt, historique des commandes, et comportements réalistes inspirés d’Ubuntu.
- **VLC Media Player**
Lecteur audio intégré avec playlist automatique par dossier.
Support de la lecture directe depuis Nautilus, barre de progression, gestion du volume, bouton précédent intelligent (restart / piste précédente), covers d’album via cover.jpg et design inspiré de VLC avec dégradés orange.
- **Mozilla Firefox**
Navigateur web embarqué basé sur des iFrames.
Gestion des favoris, historique de navigation et compatibilité avec les sites adaptés aux environnements sandboxés.
- **Gedit (éditeur de texte)**
Éditeur de texte simple pour visualiser et modifier des fichiers du VFS.
Pensé comme un outil léger, fidèle a l’esprit de Gedit.
- **Writer**
Traitement de texte minimaliste orienté écriture, distinct de l’éditeur brut.
Idéal pour des contenus longs ou narratifs.
- **Calculatrice**
Calculatrice fonctionnelle intégrée au bureau, utilisable dans une fenêtre indépendante.
- **Paramètres système**
Panneau de configuration simulé pour centraliser les réglages de l’environnement (apparence, comportements, options futures).
- **Horloge**
Application horloge affichant l’heure et servant de base a de futures extensions (alarme, minuterie).
- **Corbeille**
Gestion des fichiers supprimés au sein du VFS, avec possibilité d’évolution vers une restauration.
- **Menu d’alimentation**
Menu simulant les actions système (éteindre, redémarrer), purement visuel mais intégré a l’UX globale.

## 🛠️ Installation & Déploiement

Le projet est purement "Front-end" (HTML/JS/CSS). Aucun serveur backend n'est requis.

1. Clonez le dépôt :
   ```bash
   git clone [https://github.com/Paullux/phoenix-os.git](https://github.com/Paullux/phoenix-os.git)

2. Ouvrez index.html dans votre navigateur ou déployez-le sur GitHub Pages.

## 📝 Configuration du Navigateur (Firefox App)
Pour une expérience optimale, il est recommandé d'utiliser des sites compatibles avec les iFrames (comme Wikipédia, OpenStreetMap ou les versions embed de YouTube et Dailymotion).

## 📄 Licence
Ce projet est sous licence GNU GPL v3. Voir le fichier LICENSE.md pour plus de détails.

*Développé avec passion par un passioné en quête d'uptime.*
