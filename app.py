"""
Four-Probe Method Virtual Lab  —  Flask Backend (app.py)
Physics engine + all API and page routes.
"""
import math
import json
import os
from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)
app.secret_key = "fourprobelab_2024_secret"

# ── Physics Constants ──────────────────────────────────────────────────
K_EV   = 8.617e-5   # eV/K  — Boltzmann constant
EG_SI  = 1.12       # eV    — Silicon band gap (standard)
RHO0   = 0.0012     # Ω·cm  — pre-exponential factor (p-type Si)
W_DEF  = 0.05       # cm    — default specimen thickness
S_DEF  = 0.20       # cm    — default probe spacing
I_DEF  = 5.0        # mA    — default constant current

# ── Physics Engine ─────────────────────────────────────────────────────
def sim_rho(T_K):
    """Resistivity of p-Si at temperature T_K (Kelvin). Returns Ω·cm."""
    return RHO0 * math.exp(EG_SI / (2.0 * K_EV * T_K))

def sim_voltage(rho, I_mA, W_cm):
    """
    Inverse of thin-sample formula: ρ = R·πW/ln2  →  R = ρ·ln2/(π·W)
    Returns simulated voltage V in mV.
    """
    R    = rho * math.log(2) / (math.pi * W_cm)   # Ω
    V_mV = (I_mA * 1e-3) * R * 1e3                # mV
    return V_mV

def calc_row(V_mV, I_mA, W_cm, T_C):
    """Full calculation chain for one observation row."""
    T_K  = T_C + 273.15
    R    = (V_mV * 1e-3) / (I_mA * 1e-3)          # Ω
    rho  = R * math.pi * W_cm / math.log(2)        # Ω·cm
    return dict(
        T_K    = round(T_K, 2),
        inv_T  = round(1000.0 / T_K, 5),
        R      = round(R, 6),
        rho    = round(rho, 6),
        ln_rho = round(math.log(rho), 6),
    )

def linreg(xs, ys):
    """Least-squares linear regression. Returns slope, intercept, R²."""
    n = len(xs)
    if n < 2:
        return {}
    sx  = sum(xs);  sy  = sum(ys)
    sxy = sum(x * y for x, y in zip(xs, ys))
    sx2 = sum(x * x for x in xs)
    d   = n * sx2 - sx * sx
    if d == 0:
        return {}
    m   = (n * sxy - sx * sy) / d
    b   = (sy - m * sx) / n
    ss_res = sum((y - (m * x + b)) ** 2 for x, y in zip(xs, ys))
    ss_tot = sum((y - sy / n) ** 2 for y in ys)
    r2 = 1.0 - ss_res / ss_tot if ss_tot else 1.0
    return dict(slope=round(m, 5), intercept=round(b, 4), r2=round(r2, 6))

# ── Authentic Sample Data  (p-Si, I=5 mA, W=0.05 cm) ──────────────────
SAMPLE = [
    (27.0,  12.485), (35.0,  10.721), (45.0,   8.843), (55.0,   7.102),
    (65.0,   5.588), (75.0,   4.321), (85.0,   3.287), (95.0,   2.451),
    (105.0,  1.803), (115.0,  1.302), (125.0,  0.924), (135.0,  0.648),
    (145.0,  0.446), (155.0,  0.304), (165.0,  0.204), (175.0,  0.136),
]

# ── Helper: build regression dict with Eg ─────────────────────────────
def build_reg(rows):
    if len(rows) < 2:
        return {}
    xs  = [r["inv_T"]  for r in rows]
    ys  = [r["ln_rho"] for r in rows]
    reg = linreg(xs, ys)
    if reg.get("slope"):
        slope_K = reg["slope"] * 1000
        Eg      = round(2.0 * K_EV * abs(slope_K), 4)
        reg.update(
            slope_K = round(slope_K, 2),
            Eg      = Eg,
            err     = round(abs(Eg - EG_SI) / EG_SI * 100, 2),
        )
    return reg

# ══════════════════════════════════════════════════════════════════════
#  Page Routes
# ══════════════════════════════════════════════════════════════════════
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/theory")
def theory():
    return render_template("theory.html")

@app.route("/apparatus")
def apparatus():
    return render_template("apparatus.html")

@app.route("/procedure")
def procedure():
    return render_template("procedure.html")

@app.route("/simulation")
def simulation():
    return render_template("simulation.html",
                           I_def=I_DEF, W_def=W_DEF, S_def=S_DEF)

@app.route("/observation")
def observation():
    rows = session.get("rows", [])
    I    = session.get("I",    I_DEF)
    W    = session.get("W",    W_DEF)
    return render_template("observation.html", rows=rows, I=I, W=W)

@app.route("/calculation")
def calculation():
    rows = session.get("rows", [])
    reg  = build_reg(rows)
    return render_template("calculation.html",
                           rows=rows, reg=reg, EG_SI=EG_SI, K_EV=K_EV)

@app.route("/graph")
def graph():
    rows = session.get("rows", [])
    pts  = [{"x": r["inv_T"], "y": r["ln_rho"]} for r in rows]
    reg  = build_reg(rows)
    return render_template("graph.html",
                           pts=json.dumps(pts),
                           reg=json.dumps(reg))

@app.route("/result")
def result():
    rows   = session.get("rows", [])
    reg    = build_reg(rows)
    rho_rt = rows[0]["rho"] if rows else None
    return render_template("result.html",
                           rows=rows, reg=reg,
                           EG_SI=EG_SI, rho_rt=rho_rt)

# ══════════════════════════════════════════════════════════════════════
#  API Routes (JSON)
# ══════════════════════════════════════════════════════════════════════
@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    d    = request.get_json()
    T_K  = float(d["T_K"])
    I_mA = float(d["I_mA"])
    W_cm = float(d["W_cm"])
    rho  = sim_rho(T_K)
    V    = sim_voltage(rho, I_mA, W_cm)
    R    = (V * 1e-3) / (I_mA * 1e-3)
    return jsonify(
        T_K    = round(T_K, 2),
        T_C    = round(T_K - 273.15, 2),
        V_mV   = round(V, 4),
        R      = round(R, 4),
        rho    = round(rho, 6),
        ln_rho = round(math.log(rho), 4),
        inv_T  = round(1000.0 / T_K, 5),
    )

@app.route("/api/save", methods=["POST"])
def api_save():
    d    = request.get_json()
    I    = float(d.get("I_mA", I_DEF))
    W    = float(d.get("W_cm", W_DEF))
    rows = []
    for i, r in enumerate(d.get("rows", []), 1):
        try:
            c = calc_row(float(r["V_mV"]), I, W, float(r["T_C"]))
            rows.append(dict(sl=i, T_C=float(r["T_C"]),
                             V_mV=float(r["V_mV"]), I_mA=I, **c))
        except Exception:
            pass
    session["rows"] = rows
    session["I"]    = I
    session["W"]    = W
    return jsonify(saved=len(rows), rows=rows)

@app.route("/api/sample")
def api_sample():
    return jsonify(
        rows  = [{"T_C": t, "V_mV": v} for t, v in SAMPLE],
        I_mA  = I_DEF,
        W_cm  = W_DEF,
    )

@app.route("/api/clear", methods=["POST"])
def api_clear():
    session.clear()
    return jsonify(status="ok")

# ══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5050))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=port)
