// assets/apps/calculator.js
(function () {
  function $(id) { return document.getElementById(id); }

  function toRadiansFromMode(x, mode){
    if (mode === "DEG") return x * Math.PI / 180;
    if (mode === "GRA") return x * Math.PI / 200;
    return x; // RAD
  }
  function toModeFromRadians(x, mode){
    if (mode === "DEG") return x * 180 / Math.PI;
    if (mode === "GRA") return x * 200 / Math.PI;
    return x; // RAD
  }

  function evalExpr(raw, angleMode) {
    let expr = String(raw || "").trim();
    if (!expr) return "";

    expr = expr
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/\^/g, "**")
      .replace(/π/g, "pi");

    expr = expr.replace(/\bpi\b/gi, "Math.PI");
    expr = expr.replace(/\be\b/g, "Math.E");

    // sécurité simple
    if (!/^[0-9a-zA-Z+\-*/().,%\s_]*$/.test(expr)) {
      throw new Error("Expression invalide");
    }

    const trig = {
      sin: (x) => Math.sin(toRadiansFromMode(x, angleMode)),
      cos: (x) => Math.cos(toRadiansFromMode(x, angleMode)),
      tan: (x) => Math.tan(toRadiansFromMode(x, angleMode)),
      asin: (x) => toModeFromRadians(Math.asin(x), angleMode),
      acos: (x) => toModeFromRadians(Math.acos(x), angleMode),
      atan: (x) => toModeFromRadians(Math.atan(x), angleMode),
    };

    const scope = {
      ...trig,
      sqrt: (x) => Math.sqrt(x),
      cbrt: (x) => Math.cbrt(x),
      abs: (x) => Math.abs(x),
      ln: (x) => Math.log(x),
      log: (x) => Math.log10(x),
      exp: (x) => Math.exp(x),
      pow: (a, b) => Math.pow(a, b),
    };

    expr = expr.replace(
      /\b(sin|cos|tan|asin|acos|atan|sqrt|cbrt|abs|ln|log|exp|pow)\b/g,
      "scope.$1"
    );

    const fn = new Function("scope", `"use strict"; return (${expr});`);
    const val = fn(scope);

    if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
      throw new Error("Résultat invalide");
    }

    const rounded = Math.round(val * 1e12) / 1e12;
    return String(rounded);
  }

  function initCalculator() {
    const wrap = $("calc");
    if (!wrap) return;

    const display = $("calc-display");
    const exprEl = $("calc-expr");

    let expr = "";
    let angleMode = "RAD"; // ta UI coche "Rad"
    let lastAnswer = "";

    function render() {
      if (exprEl) exprEl.textContent = expr || "0";
      if (display) display.textContent = lastAnswer || "";
    }

    wrap.querySelectorAll('input[name="calc-angle"]').forEach(r => {
      r.addEventListener("change", () => {
        angleMode = r.value; // DEG | RAD | GRA
      });
    });

    function push(s) { expr += s; render(); }
    function backspace() { expr = expr.slice(0, -1); render(); }
    function clearAll() { expr = ""; lastAnswer = ""; render(); }

    function compute() {
      try {
        const res = evalExpr(expr, angleMode);
        lastAnswer = res;
        if (display) display.textContent = res;
      } catch {
        lastAnswer = "Erreur";
        if (display) display.textContent = "Erreur";
      }
    }

    function setExprFromAnswer() {
      if (lastAnswer && lastAnswer !== "Erreur") {
        expr = String(lastAnswer);
        render();
      }
    }

    wrap.querySelectorAll("[data-calc]").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-calc");

        if (v === "C") return clearAll();
        if (v === "BS") return backspace();
        if (v === "=") return compute();
        if (v === "ANS") return setExprFromAnswer();

        if (v === "INV") {
          if (!expr) { expr = "1/"; render(); return; }
          expr = `1/(${expr})`;
          render();
          return;
        }

        if (v === "SQRT") return push("sqrt(");
        if (v === "CBRT") return push("cbrt(");

        if (v === "SIN") return push("sin(");
        if (v === "COS") return push("cos(");
        if (v === "TAN") return push("tan(");
        if (v === "ASIN") return push("asin(");
        if (v === "ACOS") return push("acos(");
        if (v === "ATAN") return push("atan(");

        if (v === "PI") return push("π");
        if (v === "E") return push("e");

        push(v);
      });
    });

    // clavier
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); compute(); return; }
      if (e.key === "Backspace") { e.preventDefault(); backspace(); return; }
      if (e.key === "Escape") { e.preventDefault(); clearAll(); return; }

      const k = e.key;
      if (/^[0-9]$/.test(k)) return push(k);
      if ("+-*/().%^".includes(k)) return push(k);
      if (k === ".") return push(".");
    });

    wrap.tabIndex = 0;
    setTimeout(() => wrap.focus(), 50);

    render();
  }

  function registerCalculatorApp() {
    // IMPORTANT: surtout pas reset ici, juste créer si absent
    window.appConfigs = window.appConfigs || {};

    window.appConfigs["calculator"] = {
      title: "Calculatrice",
      icon: "fa-calculator",
      width: 620,
      height: 430,
      content: `
        <div id="calc" class="calc-ambiance outline-none">
          <div class="calc-topbar">
            <div class="calc-appname">Qalculate!</div>
            <div class="calc-menubar">
              <span>File</span><span>Edit</span><span>Mode</span><span>Functions</span>
              <span>Variables</span><span>Units</span><span>Help</span>
            </div>
          </div>

          <div class="calc-work">
            <div class="calc-screen">
              <div id="calc-expr" class="calc-expr">0</div>
              <div id="calc-display" class="calc-result"></div>
            </div>

            <div class="calc-options">
              <div class="calc-pill">Exact</div>
              <div class="calc-pill">Fraction</div>
              <div class="calc-pill">Normal</div>
              <div class="calc-pill">Decimal</div>
            </div>

            <div class="calc-bottom">
              <div class="calc-angle">
                <label><input type="radio" name="calc-angle" value="DEG"> Deg</label>
                <label><input type="radio" name="calc-angle" value="RAD" checked> Rad</label>
                <label><input type="radio" name="calc-angle" value="GRA"> Gra</label>
              </div>

              <div class="calc-grid select-none">
                <button class="calc-btn fn" data-calc="f(x)">f(x)</button>
                <button class="calc-btn fn" data-calc="^">xʸ</button>
                <button class="calc-btn fn" data-calc="^2">x²</button>
                <button class="calc-btn" data-calc="7">7</button>
                <button class="calc-btn" data-calc="8">8</button>
                <button class="calc-btn" data-calc="9">9</button>
                <button class="calc-btn danger" data-calc="BS">DEL</button>
                <button class="calc-btn danger" data-calc="C">AC</button>

                <button class="calc-btn fn" data-calc="SQRT">√</button>
                <button class="calc-btn fn" data-calc="log(">log</button>
                <button class="calc-btn fn" data-calc="ln(">ln</button>
                <button class="calc-btn" data-calc="4">4</button>
                <button class="calc-btn" data-calc="5">5</button>
                <button class="calc-btn" data-calc="6">6</button>
                <button class="calc-btn fn" data-calc="*">×</button>
                <button class="calc-btn fn" data-calc="/">÷</button>

                <button class="calc-btn fn" data-calc="abs(">abs</button>
                <button class="calc-btn fn" data-calc="COS">cos</button>
                <button class="calc-btn fn" data-calc="TAN">tan</button>
                <button class="calc-btn" data-calc="1">1</button>
                <button class="calc-btn" data-calc="2">2</button>
                <button class="calc-btn" data-calc="3">3</button>
                <button class="calc-btn fn" data-calc="+">+</button>
                <button class="calc-btn fn" data-calc="-">-</button>

                <button class="calc-btn fn" data-calc="pow(">EXP</button>
                <button class="calc-btn ans" data-calc="ANS">Ans</button>
                <button class="calc-btn" data-calc="0">0</button>
                <button class="calc-btn" data-calc=".">.</button>
                <button class="calc-btn fn" data-calc="(">(</button>
                <button class="calc-btn fn" data-calc=")">)</button>
                <button class="calc-btn fn" data-calc="%">%</button>
                <button class="calc-btn ok" data-calc="=">=</button>
              </div>
            </div>
          </div>
        </div>
      `,
      onLoad: initCalculator,
    };
  }

  document.addEventListener("DOMContentLoaded", registerCalculatorApp);
})();
