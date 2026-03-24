# 19: Virtual Environments & pip

## 🔒 Why Virtual Environments?

Each project should have its own isolated set of packages to avoid version conflicts.

```
Without venv:
  ┌────────────────────────────────────────┐
  │  System Python                         │
  │  ├── requests 2.28 (project A needs)  │
  │  └── requests 2.20 (project B needs)  │
  │            ↑ CONFLICT!                │
  └────────────────────────────────────────┘

With venv:
  ┌────────────────┐    ┌────────────────┐
  │  project-a/    │    │  project-b/    │
  │    venv/       │    │    venv/       │
  │  requests 2.28 │    │  requests 2.20 │
  │  (isolated)    │    │  (isolated)    │
  └────────────────┘    └────────────────┘
```

---

## 🏗️ venv — Built-in Virtual Environment

`venv` creates an isolated Python environment in a subdirectory. Each project gets its own installed packages and its own Python interpreter, so version conflicts between projects are impossible. Always activate the environment before installing packages or running project code.

```bash
# Create virtual environment
python -m venv venv          # creates venv/ folder
python -m venv .venv         # hidden folder (common convention)
python3.11 -m venv venv      # specific Python version

# Activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Windows (cmd)
venv\Scripts\activate.bat
# macOS / Linux
source venv/bin/activate

# Deactivate
deactivate

# Delete
rm -rf venv   # just delete the folder
```

### Project Convention
```bash
my-project/
├── venv/              ← virtual environment (add to .gitignore)
├── src/
│   └── app.py
├── requirements.txt   ← packages list (commit this)
├── .env               ← secrets (add to .gitignore)
└── README.md
```

```bash
# .gitignore
venv/
.venv/
__pycache__/
*.pyc
.env
```

---

## 📦 pip — Package Installer

`pip` downloads and installs packages from PyPI. Use exact version pinning (`==`) in production for reproducibility. `pip freeze > requirements.txt` captures the entire current environment. `pip list --outdated` shows which packages have newer versions available.

```bash
# Install packages
pip install requests
pip install "requests==2.31.0"      # exact version
pip install "requests>=2.28,<3.0"   # version range
pip install "django~=4.2"           # compatible release (~= 4.2.x)

# Install from file
pip install -r requirements.txt

# Upgrade
pip install --upgrade requests
pip install -U requests             # shorthand

# Uninstall
pip uninstall requests
pip uninstall -r requirements.txt   # uninstall all from file

# List packages
pip list
pip list --outdated            # show which have updates

# Show info about a package
pip show requests

# Freeze installed packages (with exact versions)
pip freeze > requirements.txt

# Search (deprecated in pip 21+, use https://pypi.org instead)
```

---

## 📋 requirements.txt

A `requirements.txt` file records all project dependencies with pinned version numbers. Commit it to version control. Separate production and development dependencies (e.g., `requirements.txt` and `requirements-dev.txt`) to keep production Docker images lean.

```
# requirements.txt — what to commit to git

# Production dependencies
requests==2.31.0
python-dotenv==1.0.0
fastapi==0.104.0
uvicorn[standard]==0.24.0

# Dev/test dependencies (often in requirements-dev.txt)
pytest==7.4.3
black==23.11.0
mypy==1.7.0
ruff==0.1.6
```

```bash
# Common pattern: separate dev requirements
pip install -r requirements.txt         # production
pip install -r requirements-dev.txt     # dev tools
```

---

## 🚀 pyproject.toml (Modern Standard)

`pyproject.toml` is the modern, unified project configuration standard (PEP 517/518/621). It consolidates project metadata, required Python version, production dependencies, optional dev dependencies, and CLI entry points into a single file. It replaces `setup.py` and `setup.cfg`.

```toml
# pyproject.toml (PEP 518, 621)

[project]
name = "my-app"
version = "1.0.0"
description = "My application"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.28",
    "fastapi>=0.100",
    "python-dotenv>=1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black>=23.0",
    "mypy>=1.0",
    "ruff>=0.1",
]

[project.scripts]
my-app = "my_app.main:main"   # CLI entry point

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.backends.legacy:build"
```

---

## 🎯 pipx — Install CLI Tools

Install Python CLI tools in isolated environments.

```bash
# Install pipx
pip install pipx
pipx ensurepath

# Install a tool (globally, isolated)
pipx install black
pipx install httpie
pipx install poetry
pipx install ruff

# Run without installing
pipx run black my_file.py
```

---

## 🏆 Poetry — Modern Dependency Manager

Poetry combines virtual environment management, dependency resolution, version locking, and package publishing in one CLI. It creates a `poetry.lock` file that ensures every developer and CI run gets the exact same package versions, eliminating "works on my machine" problems.

```bash
# Install
pipx install poetry

# New project
poetry new my-project
cd my-project

# Add dependencies
poetry add requests
poetry add pytest --group dev

# Install all dependencies
poetry install

# Run in virtual env
poetry run python main.py
poetry run pytest

# Show dependency tree
poetry show --tree

# Update lock file
poetry update

# Build & publish
poetry build
poetry publish
```

---

## 🌐 uv — Extremely Fast Package Manager (Modern)

`uv` is an extremely fast Python package and project manager written in Rust. It's a drop-in replacement for `pip` and `venv` that is 10–100× faster. It also manages Python versions, resolves dependencies, and supports `pyproject.toml`-based projects natively.

```bash
# Install uv
pip install uv
# or: curl -LsSf https://astral.sh/uv/install.sh | sh

# Create project
uv init my-project
cd my-project

# Add packages
uv add requests
uv add pytest --dev

# Sync environment
uv sync

# Run
uv run python main.py
uv run pytest

# Manage Python versions
uv python install 3.12
uv python pin 3.12
```

---

## 🔑 .env & python-dotenv

Never hardcode secrets in source code. Store environment-specific configuration (API keys, database URLs, feature flags) in a `.env` file and load it at startup with `python-dotenv`. Always add `.env` to `.gitignore` — only commit a `.env.example` with placeholder values so teammates know what variables are needed.

```bash
# .env (never commit to git!)
DATABASE_URL=postgres://user:pass@localhost/mydb
SECRET_KEY=supersecret
DEBUG=true
PORT=8000
```

```python
# Load .env into environment
from dotenv import load_dotenv
import os

load_dotenv()   # reads .env in current directory

db_url = os.getenv("DATABASE_URL")
port   = int(os.getenv("PORT", "8000"))

# Or load specific file
load_dotenv(".env.production")
```

---

## 📌 Quick Reference

A concise cheatsheet of the key commands for venv, pip, Poetry, and uv.

```bash
# venv
python -m venv venv
source venv/bin/activate    # mac/linux
venv\Scripts\Activate.ps1   # windows
deactivate

# pip
pip install package
pip install -r requirements.txt
pip freeze > requirements.txt
pip list

# Poetry
poetry add package
poetry install
poetry run python script.py

# uv (fastest)
uv add package
uv sync
uv run python script.py
```


---

[← Previous: Regular Expressions](18-regex.md) | [Contents](README.md) | [Next: Type Hints & Dataclasses →](20-type-hints.md)
