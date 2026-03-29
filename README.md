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

## Push to GitHub (already initialised)

Since you have already run `git init` and added the files, just do:

```bash
cd Four_Probe_Lab

# 1. Make sure .gitignore is applied (removes venv/ etc. from tracking)
git rm -r --cached venv/ --ignore-unmatch
git rm -r --cached __pycache__/ --ignore-unmatch

# 2. Stage everything
git add .

# 3. Commit
git commit -m "Four-Probe Method Virtual Lab — initial commit"

# 4. Create a repo on GitHub (github.com → New repository → name it four-probe-lab)
#    Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/four-probe-lab.git
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

After this, every future change is just:
```bash
git add .
git commit -m "your message"
git push
```

---

## Deploy Free to Render.com (share with friends)

Once your code is on GitHub:

1. Go to **https://render.com** → Sign up free
2. Click **New → Web Service**
3. Connect your GitHub account and select the `four-probe-lab` repo
4. Fill in the settings:
   - **Name**: `four-probe-lab` (or anything you like)
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Click **Deploy**

You'll get a permanent public URL like:
`https://four-probe-lab.onrender.com`

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
        ├── main.js           # Global utilities
        ├── simulation.js     # Canvas diagram + API calls
        ├── observation.js    # Table management + CSV export
        ├── calculation.js    # Step-by-step calculator logic
        └── graph.js          # Canvas graph renderer
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
