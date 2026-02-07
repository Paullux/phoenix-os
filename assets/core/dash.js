// assets/core/dash.js
(function () {
    window.toggleDash = function () {
        const dash = document.getElementById("dash");
        if (!dash) return;

        const isHidden = dash.classList.contains("hidden");

        if (isHidden) {
            dash.classList.remove("hidden");
            requestAnimationFrame(() => {
                dash.classList.add("dash-open");
                const input = document.getElementById("dash-search");
                if (input) {
                input.value = "";
                input.focus();
                }
            });
        } else {
            dash.classList.remove("dash-open");
            setTimeout(() => dash.classList.add("hidden"), 170);
        }
    };
})();
