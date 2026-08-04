"""Entry point to start the MOTU backend on Windows."""

import sys
from pathlib import Path

# Add parent (backend/) to PYTHONPATH so 'src.*' imports resolve
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=False)