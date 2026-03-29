/* Four-Probe Lab  —  observation.js */
"use strict";

let rowCount = document.querySelectorAll("#obs-body tr").length;

window.addEventListener("load", () => {
    const pending = JSON.parse(sessionStorage.getItem("pending_rows") || "[]");
    if (pending.length) {
        pending.forEach(r => addRow(r.T_C, r.V_mV));
        sessionStorage.removeItem("pending_rows");
        showMsg(document.getElementById("obs-msg"),
            pending.length + " reading(s) imported from Simulation.");
    }
    recalcAllLocal();
});

function addRow(T_c, V_mV) {
    T_c = T_c === undefined ? "" : T_c;
    V_mV = V_mV === undefined ? "" : V_mV;
    rowCount++;
    const tbody = document.getElementById("obs-body");
    const tr = document.createElement("tr");
    tr.id = "row-" + rowCount;
    tr.innerHTML =
        "<td>" + rowCount + "</td>" +
        "<td class='inp'><input type='number' step='0.1' value='" + T_c + "' onchange='recalcRow(" + rowCount + ")' placeholder='°C'/></td>" +
        "<td class='auto' id='tk-" + rowCount + "'>—</td>" +
        "<td class='auto' id='it-" + rowCount + "'>—</td>" +
        "<td class='inp'><input type='number' step='0.001' value='" + V_mV + "' onchange='recalcRow(" + rowCount + ")' placeholder='mV'/></td>" +
        "<td class='auto' id='ia-" + rowCount + "'>—</td>" +
        "<td class='auto' id='rr-" + rowCount + "'>—</td>" +
        "<td class='auto' id='rh-" + rowCount + "'>—</td>" +
        "<td class='auto' id='lr-" + rowCount + "'>—</td>";
    tbody.appendChild(tr);
    if (T_c !== "" && V_mV !== "") recalcRow(rowCount);
}

function removeRow() {
    if (!rowCount) return;
    var tr = document.getElementById("row-" + rowCount);
    if (tr) tr.remove();
    rowCount--;
}

function clearAll() {
    document.getElementById("obs-body").innerHTML = "";
    rowCount = 0;
    postJSON("/api/clear", {});
    showMsg(document.getElementById("obs-msg"), "Table cleared.");
}

function recalcRow(n) {
    var tr = document.getElementById("row-" + n);
    if (!tr) return;
    var inputs = tr.querySelectorAll("input");
    var T_C = parseFloat(inputs[0].value);
    var V_mV = parseFloat(inputs[1].value);
    var I = parseFloat(document.getElementById("obs-I").value);
    var W = parseFloat(document.getElementById("obs-W").value);
    var tk = document.getElementById("tk-" + n);
    var it = document.getElementById("it-" + n);
    var ia = document.getElementById("ia-" + n);
    var rr = document.getElementById("rr-" + n);
    var rh = document.getElementById("rh-" + n);
    var lr = document.getElementById("lr-" + n);
    if (!isNaN(T_C)) {
        var T_K = T_C + 273.15;
        if (tk) tk.textContent = T_K.toFixed(2);
        if (it) it.textContent = (1000 / T_K).toFixed(5);
    }
    if (ia) ia.textContent = I.toFixed(1);
    if (!isNaN(V_mV) && !isNaN(I) && !isNaN(W) && I > 0) {
        var R = (V_mV * 1e-3) / (I * 1e-3);
        var rho = R * Math.PI * W / Math.log(2);
        if (rr) rr.textContent = R.toFixed(6);
        if (rh) rh.textContent = rho.toFixed(6);
        if (lr) lr.textContent = Math.log(rho).toFixed(6);
    }
}

function recalcAllLocal() {
    for (var i = 1; i <= rowCount; i++) recalcRow(i);
}

async function saveAll() {
    var I = parseFloat(document.getElementById("obs-I").value);
    var W = parseFloat(document.getElementById("obs-W").value);
    var rows = [];
    for (var i = 1; i <= rowCount; i++) {
        var tr = document.getElementById("row-" + i);
        if (!tr) continue;
        var inputs = tr.querySelectorAll("input");
        var T_C = parseFloat(inputs[0].value);
        var V_mV = parseFloat(inputs[1].value);
        if (!isNaN(T_C) && !isNaN(V_mV)) rows.push({ T_C: T_C, V_mV: V_mV });
    }
    if (!rows.length) { showMsg(document.getElementById("obs-msg"), "No valid rows to save.", "error"); return; }
    var res = await postJSON("/api/save", { rows: rows, I_mA: I, W_cm: W });
    showMsg(document.getElementById("obs-msg"), "✓ " + res.saved + " row(s) saved. Navigate to Calculation or Graph.");
}

async function loadSample() {
    var res = await fetch("/api/sample");
    var data = await res.json();
    document.getElementById("obs-body").innerHTML = "";
    rowCount = 0;
    document.getElementById("obs-I").value = data.I_mA;
    document.getElementById("obs-W").value = data.W_cm;
    data.rows.forEach(function (r) { addRow(r.T_C, r.V_mV); });
    showMsg(document.getElementById("obs-msg"), "Sample data loaded. Click Save & Recalculate.");
}

function exportCSV() {
    var I = document.getElementById("obs-I").value;
    var W = document.getElementById("obs-W").value;
    var csv = "Four-Probe Method Virtual Lab\nI=" + I + " mA  W=" + W + " cm\n\n";
    csv += "Sl,T(C),T(K),1/T*1000(K-1),V(mV),I(mA),R(Ohm),Rho(Ohm.cm),ln(rho)\n";
    for (var i = 1; i <= rowCount; i++) {
        var tr = document.getElementById("row-" + i);
        if (!tr) continue;
        var inputs = tr.querySelectorAll("input");
        csv += [
            i, inputs[0].value,
            document.getElementById("tk-" + i) ? document.getElementById("tk-" + i).textContent : "",
            document.getElementById("it-" + i) ? document.getElementById("it-" + i).textContent : "",
            inputs[1].value,
            document.getElementById("ia-" + i) ? document.getElementById("ia-" + i).textContent : "",
            document.getElementById("rr-" + i) ? document.getElementById("rr-" + i).textContent : "",
            document.getElementById("rh-" + i) ? document.getElementById("rh-" + i).textContent : "",
            document.getElementById("lr-" + i) ? document.getElementById("lr-" + i).textContent : ""
        ].join(",") + "\n";
    }
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "four_probe_observations.csv";
    a.click();
}