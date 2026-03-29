#!/usr/bin/env bash
# ============================================================
#  Four-Probe Method Virtual Lab  —  setup.sh
#  Works on Ubuntu / Debian / Fedora / Arch / macOS
# ============================================================

set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'
RED='\033[0;31m';  RESET='\033[0m'; BOLD='\033[1m'

echo ""
echo -e "${BOLD} ================================================${RESET}"
echo -e "${BOLD}  Four-Probe Method  |  Virtual Lab${RESET}"
echo -e "${BOLD} ================================================${RESET}"
echo ""

# ── Step 1: Check python3 ─────────────────────────────────
echo -e "${CYAN}[1/5]${RESET} Checking Python 3..."

if ! command -v python3 &>/dev/null; then
    echo -e "${RED}[ERROR]${RESET} python3 not found."
    echo ""
    echo "  Install it with one of:"
    echo "    sudo apt install python3 python3-venv python3-full   # Ubuntu/Debian"
    echo "    sudo dnf install python3                             # Fedora"
    echo "    sudo pacman -S python                                # Arch"
    echo "    brew install python                                  # macOS"
    exit 1
fi

PYVER=$(python3 --version)
echo -e "  ${GREEN}✓${RESET} ${PYVER}"

# ── Step 2: Ensure python3-venv is available ──────────────
echo -e "${CYAN}[2/5]${RESET} Checking venv module..."

if ! python3 -m venv --help &>/dev/null; then
    echo -e "${RED}[ERROR]${RESET} python3-venv is not installed."
    echo ""
    echo "  Fix it with:"
    echo "    sudo apt install python3-venv python3-full   # Ubuntu/Debian"
    exit 1
fi

echo -e "  ${GREEN}✓${RESET} venv available"

# ── Step 3: Create virtual environment ───────────────────
echo -e "${CYAN}[3/5]${RESET} Setting up virtual environment..."

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "  ${GREEN}✓${RESET} Created venv/"
else
    echo -e "  ${GREEN}✓${RESET} venv/ already exists, skipping"
fi

# ── Step 4: Install dependencies inside venv ─────────────
echo -e "${CYAN}[4/5]${RESET} Installing dependencies (Flask) into venv..."

venv/bin/pip install --quiet --upgrade pip
venv/bin/pip install --quiet -r requirements.txt

echo -e "  ${GREEN}✓${RESET} Flask installed"

# ── Step 5: Launch ────────────────────────────────────────
echo -e "${CYAN}[5/5]${RESET} Starting server..."
echo ""
echo -e "${BOLD} ================================================${RESET}"
echo -e "${BOLD}  Open your browser at:  http://localhost:5050${RESET}"
echo -e "${BOLD}  Press Ctrl+C to stop the server.${RESET}"
echo -e "${BOLD} ================================================${RESET}"
echo ""

venv/bin/python app.py
