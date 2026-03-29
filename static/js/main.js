/* Four-Probe Virtual Lab  —  main.js  (global utilities) */

"use strict";

/* ── Fetch helper ───────────────────────────────────────── */
async function postJSON(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

/* ── Show a status message ──────────────────────────────── */
function showMsg(el, text, type = "success") {
    if (!el) return;
    el.textContent = text;
    el.className = "msg " + type;
    setTimeout(() => { el.className = "msg"; }, 3500);
}

/* ── Format a number for display ───────────────────────── */
function fmt(n, d = 4) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Number(n).toFixed(d);
}