/* Four-Probe Lab  —  graph.js
   Draws the ln(rho) vs 1/T scatter plot with best-fit line.
   Expects globals: PTS (array of {x, y}) and REG (regression result) from Flask.
*/
"use strict";

window.addEventListener("load",   function () { drawGraph(); });
window.addEventListener("resize", function () { drawGraph(); });

function drawGraph() {
  var canvas = document.getElementById("graph-canvas");
  if (!canvas) return;

  var dpr  = window.devicePixelRatio || 1;
  var W_px = canvas.offsetWidth;
  var H_px = 420;
  canvas.width  = W_px * dpr;
  canvas.height = H_px * dpr;

  var ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  /* ── background ── */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W_px, H_px);

  var pad = { top: 40, right: 40, bottom: 64, left: 78 };
  var gW  = W_px - pad.left - pad.right;
  var gH  = H_px - pad.top  - pad.bottom;

  /* ── no data ── */
  if (!PTS || PTS.length < 2) {
    ctx.fillStyle = "#aaa";
    ctx.font      = "14px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "No data — save observations first, then reload this page.",
      W_px / 2, H_px / 2
    );
    return;
  }

  /* ── axis ranges ── */
  var xs   = PTS.map(function (p) { return p.x; });
  var ys   = PTS.map(function (p) { return p.y; });
  var xPad = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) * 0.08 || 0.05;
  var yPad = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) * 0.08 || 0.5;
  var xMin = Math.min.apply(null, xs) - xPad;
  var xMax = Math.max.apply(null, xs) + xPad;
  var yMin = Math.min.apply(null, ys) - yPad;
  var yMax = Math.max.apply(null, ys) + yPad;

  function cx(x) { return pad.left + (x - xMin) / (xMax - xMin) * gW; }
  function cy(y) { return pad.top  + (1 - (y - yMin) / (yMax - yMin)) * gH; }

  /* ── grid lines ── */
  ctx.strokeStyle = "#f0f0ee";
  ctx.lineWidth   = 1;
  var G = 6;
  for (var g = 0; g <= G; g++) {
    var xx = pad.left + g / G * gW;
    ctx.beginPath(); ctx.moveTo(xx, pad.top); ctx.lineTo(xx, pad.top + gH); ctx.stroke();
  }
  for (var g = 0; g <= 5; g++) {
    var yy = pad.top + g / 5 * gH;
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(pad.left + gW, yy); ctx.stroke();
  }

  /* ── axes ── */
  ctx.strokeStyle = "#222";
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + gH);
  ctx.lineTo(pad.left + gW, pad.top + gH);
  ctx.stroke();

  /* ── tick labels ── */
  ctx.fillStyle = "#888";
  ctx.font      = "10px IBM Plex Mono, monospace";

  /* x-axis */
  ctx.textAlign = "center";
  for (var g = 0; g <= G; g++) {
    var xv = xMin + (xMax - xMin) * g / G;
    ctx.fillText(xv.toFixed(3), pad.left + g * gW / G, pad.top + gH + 16);
  }

  /* y-axis */
  ctx.textAlign = "right";
  for (var g = 0; g <= 5; g++) {
    var yv = yMax - (yMax - yMin) * g / 5;
    ctx.fillText(yv.toFixed(2), pad.left - 7, pad.top + g * gH / 5 + 4);
  }

  /* ── axis labels ── */
  ctx.fillStyle = "#555";
  ctx.font      = "11px IBM Plex Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText("1/T \u00d7 10\u00b3  (K\u207b\u00b9)", pad.left + gW / 2, H_px - 10);

  ctx.save();
  ctx.translate(16, pad.top + gH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("ln(\u03c1)  [\u03c1 in \u03a9\u00b7cm]", 0, 0);
  ctx.restore();

  /* ── best-fit line ── */
  if (REG && REG.slope != null) {
    ctx.strokeStyle = "#b5291c";
    ctx.lineWidth   = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(cx(xMin), cy(REG.slope * xMin + REG.intercept));
    ctx.lineTo(cx(xMax), cy(REG.slope * xMax + REG.intercept));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ── data points ── */
  PTS.forEach(function (p) {
    ctx.fillStyle   = "#181818";
    ctx.strokeStyle = "#b5291c";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx(p.x), cy(p.y), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  /* ── title ── */
  ctx.fillStyle = "#181818";
  ctx.font      = "bold 12px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "ln(\u03c1) vs 1/T \u2014 Four-Probe Method (Silicon)",
    pad.left + gW / 2, pad.top - 14
  );

  /* ── info line below canvas ── */
  var infoEl = document.getElementById("graph-info");
  if (infoEl && REG && REG.Eg) {
    infoEl.textContent =
      "Slope = " + REG.slope +
      " (\u00d710\u207b\u00b3 axis)  |  Slope\u1d4a = " + REG.slope_K + " K" +
      "  |  E\u1d4d = " + REG.Eg + " eV" +
      "  |  R\u00b2 = " + REG.r2;
  }
}
