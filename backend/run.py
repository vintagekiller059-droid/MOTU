"""Entry point for running MOTU backend."""

import os
import sys
from pathlib import Path

# Add backend/ (parent of src/) to PYTHONPATH so 'src.*' imports resolve
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)