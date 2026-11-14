#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="${VENV_DIR:-.ansible-venv}"
PLAYBOOK="${PLAYBOOK:-site.yml}"
INVENTORY="${INVENTORY:-inventory.yml}"

# Ansible 14 needs Python 3.12 or newer on the machine that runs it.
MIN_PYTHON_MINOR=12

is_new_enough() {
    "$1" -c "import sys; sys.exit(0 if sys.version_info >= (3, $MIN_PYTHON_MINOR) else 1)" 2>/dev/null
}

# Prints the first Python that is new enough. Set PYTHON to choose one yourself.
find_python() {
    local candidates=(python3.14 python3.13 python3.12 python3)
    if [ -n "${PYTHON:-}" ]; then
        candidates=("$PYTHON")
    fi
    local candidate path
    for candidate in "${candidates[@]}"; do
        if path="$(command -v "$candidate")" && is_new_enough "$path"; then
            echo "$path"
            return 0
        fi
    done
    return 1
}

if ! PYTHON_BIN="$(find_python)"; then
    echo "Error: Python 3.$MIN_PYTHON_MINOR or newer is required, and none was found." >&2
    echo "Install one (for example: brew install python@3.14) or set PYTHON=/path/to/python3.x." >&2
    exit 1
fi

# A virtualenv made with an older Python cannot install Ansible 14. Recreate it, but
# only if it really is a virtualenv (it has a pyvenv.cfg), so VENV_DIR can never
# point at some other folder that gets deleted.
if [ -f "$VENV_DIR/pyvenv.cfg" ] && ! is_new_enough "$VENV_DIR/bin/python"; then
    echo "The virtualenv at $VENV_DIR uses an older Python. Recreating it with $PYTHON_BIN..."
    rm -rf "$VENV_DIR"
fi

if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtualenv at $VENV_DIR with $PYTHON_BIN..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if [ -f requirements.yml ]; then
    ansible-galaxy collection install -r requirements.yml
fi

echo "Running: ansible-playbook -i $INVENTORY $PLAYBOOK $*"
ansible-playbook -i "$INVENTORY" "$PLAYBOOK" "$@"
