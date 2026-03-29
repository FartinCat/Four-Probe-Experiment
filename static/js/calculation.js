/* Four-Probe Lab  —  calculation.js
   Handles the live single-row calculator and the band-gap calculator
   on the Calculation page.
*/
"use strict";

/* ── helper: build a styled calc-box HTML block ── */
function box(label, equation) {
  return (
    "<div class='calc-box'>" +
      "<div class='clabel'>" + label + "</div>" +
      "<div class='ceq'>"   + equation + "</div>" +
    "</div>"
  );
}

/* ── Live single-row calculator ── */
function liveCalc() {
  var V   = parseFloat(document.getElementById("c-V").value);
  var I   = parseFloat(document.getElementById("c-I").value);
  var W   = parseFloat(document.getElementById("c-W").value);
  var T   = parseFloat(document.getElementById("c-T").value);
  var div = document.getElementById("calc-steps");

  if (isNaN(V) || isNaN(I) || isNaN(W) || I === 0) {
    div.innerHTML = "";
    return;
  }

  var V_V = V * 1e-3;          /* Volts  */
  var I_A = I * 1e-3;          /* Amperes */
  var R   = V_V / I_A;         /* Ohms   */
  var rho = R * Math.PI * W / Math.log(2);   /* Ohm·cm */
  var lnr = Math.log(rho);
  var invT = (!isNaN(T) && T > 0) ? (1000 / T).toFixed(5) : "—";

  div.innerHTML =
    box(
      "Step 1 — Unit Conversion",
      "V = " + V + " mV = " + V_V.toExponential(4) + " V &nbsp;|&nbsp; " +
      "I = " + I + " mA = " + I_A.toExponential(4) + " A"
    ) +
    box(
      "Step 2 — Resistance",
      "R = V / I = " + V_V.toExponential(4) + " / " + I_A.toExponential(4) +
      " = <strong>" + R.toFixed(6) + " &Omega;</strong>"
    ) +
    box(
      "Step 3 — Resistivity &rho; = R &times; &pi; &times; W / ln(2)",
      "&rho; = " + R.toFixed(6) +
      " &times; " + (Math.PI * W).toFixed(6) +
      " / 0.693147 = <strong>" + rho.toFixed(6) + " &Omega;&middot;cm</strong>"
    ) +
    box(
      "Step 4 — Natural Logarithm",
      "ln(&rho;) = ln(" + rho.toFixed(6) + ") = <strong>" + lnr.toFixed(6) + "</strong>"
    ) +
    (!isNaN(T) && T > 0
      ? box(
          "Step 5 — Inverse Temperature",
          "1/T &times; 10&sup3; = 1000 / " + T +
          " = <strong>" + invT + " K&minus;&sup1;</strong>"
        )
      : "") +
    "<div class='result-display'>" +
      "<span class='rl'>Resistivity &rho;</span>" +
      "<span class='rv'>" + rho.toFixed(6) + "</span>" +
      "<span class='ru'>&Omega;&middot;cm</span>" +
    "</div>";
}

/* ── Band-gap calculator from slope ── */
function calcEg() {
  var slope = parseFloat(document.getElementById("c-slope").value);
  var div   = document.getElementById("eg-result");

  if (isNaN(slope)) { div.innerHTML = ""; return; }

  var k_eV  = 8.617e-5;
  var Eg    = 2 * k_eV * Math.abs(slope);
  var EG_SI = 1.12;
  var err   = Math.abs(Eg - EG_SI) / EG_SI * 100;

  div.innerHTML =
    box(
      "Band Gap Calculation",
      "E<sub>g</sub> = 2 &times; k &times; |Slope| = " +
      "2 &times; 8.617&times;10&minus;&sup5; &times; " +
      Math.abs(slope).toFixed(1) +
      " = <strong>" + Eg.toFixed(4) + " eV</strong>"
    ) +
    "<div class='result-display'>" +
      "<span class='rl'>Band Gap Energy (E<sub>g</sub>)</span>" +
      "<span class='rv'>" + Eg.toFixed(4) + "</span>" +
      "<span class='ru'>eV</span>" +
      "<span style='display:block;margin-top:6px;font-size:0.68rem;color:#888;'>" +
        "Standard Si: " + EG_SI + " eV &nbsp;|&nbsp; " +
        "Percentage Error: " + err.toFixed(2) + "%" +
      "</span>" +
    "</div>";
}
