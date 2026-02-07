// assets/core/utils.js
(function () {
    function escapeHtml(s) {
        return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

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

    window.escapeHtml = escapeHtml;
    window.dedent = dedent;
})();
