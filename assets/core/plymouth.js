// assets/core/plymouth.js
// Requis dans le HTML:
// <div id="blackout" class="blackout hidden"></div>
// <div id="plymouth" class="plymouth hidden"> ... dots ... </div>
//
// CSS conseille:
// #blackout{ position:fixed; inset:0; background:#000; z-index:99998; }
// #plymouth{ position:fixed; inset:0; z-index:99999; }

(function () {
  let running = false;

  let dotsInterval = null;
  let seqTimeout = null;

  function $(id) { return document.getElementById(id); }

  // ---- Texte (optionnel) ----
  function setSub(sub) {
    const s = $("plymouth-sub");
    if (s && sub != null) s.textContent = sub;
  }

  // ---- BLACKOUT (noir) ----
  function showBlackout() {
    const b = $("blackout");
    if (!b) return;
    b.classList.remove("hidden");
    b.style.opacity = "1";
    b.style.transition = "";
    b.setAttribute("aria-hidden", "false");
  }

  function hideBlackout(ms = 200) {
    const b = $("blackout");
    if (!b) return;
    b.style.transition = `opacity ${ms}ms ease-out`;
    b.style.opacity = "0";
    setTimeout(() => {
      b.classList.add("hidden");
      b.style.opacity = "";
      b.style.transition = "";
      b.setAttribute("aria-hidden", "true");
    }, ms + 40);
  }

  // ---- PLYMOUTH (logo + dots) ----
  function showPlymouth() {
    const p = $("plymouth");
    if (!p) return;
    p.classList.remove("hidden");
    p.style.opacity = "1";
    p.style.transition = "";
    p.setAttribute("aria-hidden", "false");
  }

  function hidePlymouthInstant() {
    const p = $("plymouth");
    if (!p) return;
    p.classList.add("hidden");
    p.style.opacity = "";
    p.style.transition = "";
    p.setAttribute("aria-hidden", "true");
  }

  function fadeOutPlymouthThenHide(ms = 180) {
    const p = $("plymouth");
    if (!p) return;
    p.style.transition = `opacity ${ms}ms ease-out`;
    p.style.opacity = "0";
    setTimeout(() => {
      hidePlymouthInstant();
    }, ms + 40);
  }

  // ---- Desktop blur/fade (si tu as #desktop) ----
  function fadeDesktop(on) {
    const desk = document.getElementById("desktop");
    const target = desk || document.body;
    target.classList.toggle("desktop-shutdown", !!on);
  }

  // ---- Dots animation ----
  function stopDots() {
    if (dotsInterval) clearInterval(dotsInterval);
    dotsInterval = null;
  }

  function startDots(root) {
    const dots = [...root.querySelectorAll(".plymouth-dots .dot")];
    if (!dots.length) return;

    dots.forEach(d => d.classList.remove("orange", "white"));
    stopDots();

    let i = 0;
    let phase = "orange"; // orange puis white

    dotsInterval = setInterval(() => {
      const d = dots[i];

      if (phase === "orange") {
        d.classList.add("orange");
        d.classList.remove("white");
      } else {
        d.classList.remove("orange");
        d.classList.add("white");
      }

      i++;

      if (i >= dots.length) {
        i = 0;
        phase = (phase === "orange") ? "white" : "orange";
        if (phase === "orange") {
          // reset total avant de rallumer en orange
          dots.forEach(x => x.classList.remove("white", "orange"));
        }
      }
    }, 220);
  }

  // ---- Timers ----
  function clearSeq() {
    if (seqTimeout) clearTimeout(seqTimeout);
    seqTimeout = null;
  }

  function getPlymouthRoot() {
    return $("plymouth");
  }

  // ---- Boot ----
  function bootSequence() {
    const root = getPlymouthRoot();
    if (!root) return;

    // 1) noir 2s sous le plymouth
    showBlackout();

    // 2) plymouth au dessus
    showPlymouth();
    startDots(root);
    setSub("Hello, world.");
    setTimeout(() => setSub("Checking disks"), 320);
    setTimeout(() => setSub("Loading desktop"), 620);
    setTimeout(() => setSub("Loading desktop"), 350);

    // 3) on fade le plymouth assez vite
    setTimeout(() => {
      fadeOutPlymouthThenHide(180);
      stopDots();
      // 4) le noir dure 2s au total, puis s'enleve
      // (si tu veux pile 2s depuis le debut)
    }, 900);

    setTimeout(() => {
      hideBlackout(60);
    }, 1000);
  }

  // ---- Shutdown/Reboot ----
  function shutdownSequence(opts) {
    if (running) return;
    running = true;

    const mode = (opts && opts.mode) || "shutdown"; // shutdown|reboot
    const end  = (opts && opts.end)  || "black";    // black|reload|back

    fadeDesktop(true);

    // noir en dessous (reste)
    showBlackout();

    // plymouth au dessus
    showPlymouth();
    const root = getPlymouthRoot();
    if (root) startDots(root);

    setSub(mode === "reboot" ? "Restarting..." : "Shutting down...");

    clearSeq();
    seqTimeout = setTimeout(() => {
      setSub("Stopping services");

      clearSeq();
      seqTimeout = setTimeout(() => {
        setSub("Unmounting filesystems");

        clearSeq();
        seqTimeout = setTimeout(() => {
          // on peut faire disparaitre le plymouth, mais on laisse le noir
          fadeOutPlymouthThenHide(180);
          stopDots();

          clearSeq();
          seqTimeout = setTimeout(() => {
            fadeDesktop(false);
            running = false;

            if (end === "reload") {
              location.reload();
              return;
            }

            if (end === "back") {
              // revenir au bureau: on enleve le noir
              hideBlackout(200);
            }

            // end === "black": on laisse le noir, point.
          }, 320);
        }, 900);
      }, 900);
    }, 220);
  }

  // ---- API publique ----
  window.plymouthBoot = function () {
    bootSequence();
  };

  window.plymouthShutdown = function () {
    shutdownSequence({ mode: "shutdown", end: "black" });
  };

  window.plymouthReboot = function () {
    shutdownSequence({ mode: "reboot", end: "reload" });
  };

  window.plymouthStop = function () {
    clearSeq();
    stopDots();
    running = false;
    fadeDesktop(false);
    hidePlymouthInstant();
    // blackout: a toi de decider. perso je le laisse pas toucher ici.
  };

  // auto boot
  document.addEventListener("DOMContentLoaded", () => {
    window.plymouthBoot();
  });
})();
