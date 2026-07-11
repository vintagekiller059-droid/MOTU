import subprocess
import sys
import os

# Auto-install missing dependencies
REQUIRED = [
    "fastapi", "uvicorn[standard]", "psutil", "httpx", 
    "sqlalchemy", "alembic", "pydantic", "pydantic-settings", 
    "python-dotenv", "structlog", "watchfiles"
]

for pkg in REQUIRED:
    pkg_import = pkg.replace("-", "_").split("[")[0]
    try:
        __import__(pkg_import)
    except ImportError:
        print(f"Installing {pkg}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

# Change to src directory and run server
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
subprocess.run([
    sys.executable, "-m", "uvicorn", 
    "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"
])