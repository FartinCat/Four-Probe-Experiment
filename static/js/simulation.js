/* Four-Probe Lab  —  simulation.js */
"use strict";

let _last = {};  // cached last API response for recording

async function onSlider() {
    const T_K = parseFloat(document.getElementById("ctrl-T").value);
    const I = parseFloat(document.getElementById("ctrl-I").value);
    const W = parseFloat(document.getElementById("ctrl-W").value);

    document.getElementById("disp-T").textContent = T_K + " K";
    document.getElementById("disp-I").textContent = I.toFixed(1) + " mA";
    document.getElementById("disp-W").textContent = W.toFixed(2) + " cm";

    try {
        const data = await postJSON("/api/simulate", { T_K, I_mA: I, W_cm: W });
        _last = { T_C: data.T_C, V_mV: data.V_mV, I_mA: I };
        document.getElementById("m-V").textContent = fmt(data.V_mV, 3);
        document.getElementById("m-R").textContent = fmt(data.R, 3);
        document.getElementById("m-rho").textContent = fmt(data.rho, 4);
        document.getElementById("m-invT").textContent = fmt(data.inv_T, 4);
        document.getElementById("m-lnrho").textContent = fmt(data.ln_rho, 4);
        document.getElementById("m-TC").textContent = fmt(data.T_C, 1);
        drawDiagram(I, T_K, data.V_mV, data.T_C);
    } catch (e) {
        console.error(e);
    }
}

async function recordToTable() {
    if (!_last.T_C && _last.T_C !== 0) { showMsg(document.getElementById("sim-msg"), "Run simulation first", "error"); return; }

    // Load existing session rows then append
    const res = await fetch("/observation");
    // We just store a pending row in localStorage-like sessionStorage for the page
    const pending = JSON.parse(sessionStorage.getItem("pending_rows") || "[]");
    pending.push({ T_C: _last.T_C, V_mV: _last.V_mV });
    sessionStorage.setItem("pending_rows", JSON.stringify(pending));

    showMsg(document.getElementById("sim-msg"),
        `✓ Reading queued: T=${_last.T_C}°C, V=${fmt(_last.V_mV, 3)} mV — open Observation tab to save.`);
}

/* ── Canvas Diagram ────────────────────────────────────── */
function drawDiagram(I_mA, T_K, V_mV, T_C) {
    const canvas = document.getElementById("sim-canvas");
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W_px = canvas.offsetWidth;
    const H_px = 300;
    canvas.width = W_px * dpr;
    canvas.height = H_px * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#f8f8f5";
    ctx.fillRect(0, 0, W_px, H_px);

    // Temperature tint
    const t01 = Math.min(1, Math.max(0, (T_K - 300) / 150));
    ctx.fillStyle = `rgba(${Math.round(200 * t01)},0,${Math.round(60 * (1 - t01))},0.05)`;
    ctx.fillRect(0, 0, W_px, H_px);

    const cx = W_px / 2;
    const sY = H_px * 0.54;
    const sH = 46;
    const sW = Math.min(W_px * 0.68, 460);
    const sX = cx - sW / 2;

    // ── Silicon slab ──
    const gr = ctx.createLinearGradient(sX, sY, sX, sY + sH);
    gr.addColorStop(0, `hsl(${215 - t01 * 185},55%,${55 - t01 * 14}%)`);
    gr.addColorStop(1, "#ccc");
    ctx.fillStyle = gr;
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(sX, sY, sW, sH, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Silicon Specimen (p-type)", cx, sY + 19);
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(`T = ${T_K.toFixed(0)} K  (${T_C.toFixed(1)}°C)  |  W = 0.05 cm`, cx, sY + 36);

    // ── Probes ──
    const probeColors = ["#e74c3c", "#3b82f6", "#22c55e", "#f59e0b"];
    const probeLabels = ["P1 (I⁺)", "P2 (V⁺)", "P3 (V⁻)", "P4 (I⁻)"];
    const step = sW / 5;
    const pX = [sX + step, sX + 2 * step, sX + 3 * step, sX + 4 * step];
    const pTop = sY - 68;

    pX.forEach((px, i) => {
        ctx.strokeStyle = probeColors[i]; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, pTop + 28);
        ctx.lineTo(px, sY);
        ctx.stroke();

        ctx.fillStyle = probeColors[i];
        ctx.beginPath(); ctx.arc(px, sY, 5, 0, Math.PI * 2); ctx.fill();

        // body box
        ctx.beginPath(); ctx.roundRect(px - 11, pTop + 8, 22, 20, 4); ctx.fill();

        ctx.fillStyle = probeColors[i];
        ctx.font = "9px IBM Plex Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(probeLabels[i], px, pTop + 3);
    });

    // ── Current Source (left) ──
    const csX = sX - 55;
    ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 2;
    // from P1
    ctx.beginPath();
    ctx.moveTo(pX[0], pTop + 18); ctx.lineTo(pX[0], pTop - 8); ctx.lineTo(csX + 38, pTop - 8); ctx.stroke();
    // from P4
    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(pX[3], pTop + 18); ctx.lineTo(pX[3], pTop - 26); ctx.lineTo(csX + 38, pTop - 26); ctx.stroke();
    // box
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(csX - 36, pTop - 48, 74, 38, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 9px IBM Plex Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText("CCS", csX, pTop - 34);
    ctx.fillText(`I = ${I_mA.toFixed(1)} mA`, csX, pTop - 22);

    // ── Voltmeter (right) ──
    const vmX = sX + sW + 55;
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pX[1], pTop + 18); ctx.lineTo(pX[1], pTop - 48); ctx.lineTo(vmX, pTop - 48); ctx.stroke();
    ctx.strokeStyle = "#22c55e";
    ctx.beginPath();
    ctx.moveTo(pX[2], pTop + 18); ctx.lineTo(pX[2], pTop - 58); ctx.lineTo(vmX, pTop - 58); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(vmX - 36, pTop - 78, 74, 38, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 9px IBM Plex Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText("DMV", vmX, pTop - 64);
    ctx.fillText(`V=${V_mV.toFixed(2)} mV`, vmX, pTop - 52);

    // ── Spacing indicator ──
    ctx.strokeStyle = "#bbb"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pX[0], sY + sH + 10); ctx.lineTo(pX[3], sY + sH + 10);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#999"; ctx.font = "10px IBM Plex Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText("s = 0.20 cm  (probe spacing, equal intervals)", cx, sY + sH + 24);

    // ── Thermometer gauge ──
    const gX = W_px - 46, gY = H_px / 2;
    ctx.fillStyle = "#e5e5e5";
    ctx.beginPath(); ctx.roundRect(gX - 10, gY - 55, 20, 78, 10); ctx.fill();
    ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1; ctx.stroke();
    const fH = t01 * 58;
    ctx.fillStyle = `hsl(${20 - t01 * 20},90%,50%)`;
    ctx.beginPath(); ctx.roundRect(gX - 6, gY + 16 - fH, 12, fH, 7); ctx.fill();
    ctx.fillStyle = "#555"; ctx.font = "9px IBM Plex Mono, monospace"; ctx.textAlign = "center";
    ctx.fillText(T_K.toFixed(0) + "K", gX, gY - 60);
    ctx.fillText("T", gX, gY + 34);
}

// Init
window.addEventListener("load", () => onSlider());
window.addEventListener("resize", () => onSlider());