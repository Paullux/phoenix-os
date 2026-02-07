// assets/core/clock.js
(function () {
    function updateClock() {
        const now = new Date();
        let dateStr = now
        .toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(",", "");
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        const clock = document.getElementById("clock");
        if (clock) clock.textContent = dateStr;
    }

    setInterval(updateClock, 1000);
    updateClock();
})();

