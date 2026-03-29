# Four-Probe Method — Virtual Lab

A multi-language virtual laboratory for measuring the resistivity of a Silicon
semiconductor and determining its band gap using the Four-Probe Method.

---

## Quick Start (Linux)

```bash
cd Four_Probe_Lab

chmod +x setup.sh
./setup.sh
```

Then open **http://localhost:5050** in your browser.
Press **Ctrl+C** to stop the server.

---

## Manual Setup (Linux)

```bash
# 1. Create isolated virtual environment
python3 -m venv venv

# 2. Activate it
source venv/bin/activate

# 3. Install Flask
pip install -r requirements.txt

# 4. Run
python app.py
```

---

## If python3-venv is missing

```bash
sudo apt install python3-venv python3-full
# then run ./setup.sh normally — no more sudo needed
```

---

## Push to GitHub

```bash
# Remove venv from tracking if accidentally staged
git rm -r --cached venv/ --ignore-unmatch
git rm -r --cached __pycache__/ --ignore-unmatch

# Stage everything
git add .

# Commit
git commit -m "Replaced single-HTML version with full multi-language Flask app"

# Push
git push origin main
```

---

## Deploy Free to Render.com (share with friends)

Once your code is on GitHub:

1. Go to **https://render.com** → Sign up free
2. Click **New → Web Service**
3. Connect your GitHub account and select the repo
4. Fill in the settings:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Click **Deploy**

You'll get a permanent public URL like:
`https://four-probe-experiment.onrender.com`

Share that URL with anyone — no PC needs to stay on.

---

## Share instantly with ngrok (no deployment)

```bash
# Terminal 1 — start your lab
./setup.sh

# Terminal 2 — expose it publicly
sudo snap install ngrok
ngrok http 5050
```

Copy the `https://xxxx.ngrok.io` link and share it.
Works as long as your machine is running.

---

## Project Structure

```
Four_Probe_Lab/
├── app.py                    # Python/Flask — backend + physics engine
├── requirements.txt          # flask, gunicorn
├── Procfile                  # for Render.com deployment
├── runtime.txt               # Python version for Render.com
├── setup.sh                  # Linux one-click setup & run
├── setup.bat                 # Windows one-click setup & run
├── .gitignore                # excludes venv/, __pycache__/, etc.
├── README.md
├── templates/                # HTML5 + Jinja2 (server-rendered)
│   ├── base.html
│   ├── index.html
│   ├── theory.html
│   ├── apparatus.html
│   ├── procedure.html
│   ├── simulation.html
│   ├── observation.html
│   ├── calculation.html
│   ├── graph.html
│   └── result.html
└── static/
    ├── css/main.css
    └── js/
        ├── main.js
        ├── simulation.js
        ├── observation.js
        ├── calculation.js
        └── graph.js
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
| Deployment | Render.com + Gunicorn |

---

## Physics Summary

- **Specimen**: p-type Silicon, W = 0.05 cm, s = 0.20 cm, I = 5.0 mA
- **Resistivity**: ρ = (V/I) × πW / ln(2)   *[thin-specimen, W/s < 0.5]*
- **Band gap**:   Eg = 2k × |slope of ln(ρ) vs 1/T|
- **Standard**:   Eg(Si) = 1.12 eV
