// assets/apps/gedit.js
(function () {
  window.saveGeditFile = function () {
    const content = document.getElementById("gedit-textarea").value;
    const filename = document.getElementById("gedit-filename").value || "Sans-titre.txt";
    const path = window.currentFMPath === "/" ? `/${filename}` : `${window.currentFMPath}/${filename}`;
    const err = window.vfs.writeFile(path, content);
    if (err) alert(err);
    else alert(`Sauvegardé: ${path}`);
  };

  window.loadFileInGedit = function (name, content) {
    const area = document.getElementById("gedit-textarea");
    const field = document.getElementById("gedit-filename");
    if (area && field) {
      area.value = content;
      field.value = name;
    }
  };
})();
