# Four-Probe Method — Virtual Lab

A multi-language virtual laboratory for measuring the resistivity of a Silicon
semiconductor and determining its band gap using the Four-Probe Method.

---

## Quick Start (Linux — Recommended)

```bash
cd D:/Git_Work/Project/Four_Probe_Lab

# Make the setup script executable (first time only)
chmod +x setup.sh

# Run it — creates venv, installs Flask, starts server
./setup.sh
```

Then open **http://localhost:5050** in your browser.

---

## Manual Setup (Linux)

If you prefer doing it step by step:

```bash
# 1. Create a virtual environment (isolated — does NOT touch system Python)
python3 -m venv venv

# 2. Activate it
source venv/bin/activate

# 3. Install Flask into the venv
pip install -r requirements.txt

# 4. Run the server
python app.py
```

Open **http://localhost:5050** in your browser.

To stop the server: **Ctrl + C**
To deactivate the venv when done: type `deactivate`

---

## If python3-venv is missing (Ubuntu/Debian only)

The `python3 -m venv` command requires the `python3-venv` package.
Install it once with:

```bash
sudo apt install python3-venv python3-full
```

Then run `./setup.sh` normally — no more sudo needed after this.

---

## Why a virtual environment instead of sudo apt?

| Method | What it does |
|---|---|
| `sudo apt install python3-flask` | Installs an old, system-managed Flask. Can break OS tools. |
| `sudo pip install flask` | Installs globally. Breaks Debian's "externally managed" policy. |
| `python3 -m venv venv` ✅ | Creates an isolated folder. Safe, clean, no sudo needed. |

The virtual environment lives entirely inside the project folder as `venv/`.
Deleting it removes Flask completely with no side effects.

---

## Project Structure

```
Four_Probe_Lab/
├── app.py                    # Python/Flask — backend + physics engine
├── requirements.txt          # flask>=3.0.0
├── setup.sh                  # Linux/macOS one-click setup & run
├── setup.bat                 # Windows one-click setup & run
├── README.md
├── templates/                # HTML5 + Jinja2 (server-rendered)
│   ├── base.html             #   Sidebar layout
│   ├── index.html            #   Home / overview
│   ├── theory.html           #   Aim, theory, formulas
│   ├── apparatus.html        #   Instruments & specimen specs
│   ├── procedure.html        #   9-step procedure
│   ├── simulation.html       #   Interactive circuit simulation
│   ├── observation.html      #   Observation table
│   ├── calculation.html      #   Step-by-step calculator
│   ├── graph.html            #   ln(rho) vs 1/T graph
│   └── result.html           #   Result & precautions
└── static/
    ├── css/main.css          # CSS3 — all styles
    └── js/
        ├── main.js           # JS — global utilities
        ├── simulation.js     # JS — canvas diagram + API
        ├── observation.js    # JS — table + CSV export
        ├── calculation.js    # JS — step-by-step calculator
        └── graph.js          # JS — canvas graph renderer
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend server | Python 3 + Flask |
| Page templates | HTML5 + Jinja2 |
| Styles | CSS3 |
| Interactivity | Vanilla JavaScript |
| Physics engine | Python 3 (in app.py) |

---

## Lab Workflow

| Page | What you do |
|---|---|
| Theory | Read the aim, formulas, and physics |
| Apparatus | Check specimen specs and instruments |
| Procedure | Follow 9 experimental steps |
| Simulation | Drag sliders — see live V, R, ρ |
| Observation | Enter T(°C) and V(mV) — rest auto-calculated |
| Calculation | Step-by-step calculator + band gap from slope |
| Graph | Auto-plotted ln(ρ) vs 1/T with regression |
| Result | Band gap Eg, % error, precautions |

---

## Physics Summary

- **Specimen**: p-type Silicon, W = 0.05 cm, s = 0.20 cm, I = 5.0 mA
- **Resistivity**: ρ = (V/I) × πW / ln(2)   *[thin-specimen, W/s < 0.5]*
- **Band gap**:   Eg = 2k × |slope of ln(ρ) vs 1/T|
- **Standard**:   Eg(Si) = 1.12 eV
