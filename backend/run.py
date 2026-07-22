import sys
import os
from pathlib import Path
import uvicorn

# 1. Force the 'backend' directory into Python's module search path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    # 2. Run Uvicorn using string import pointing to src.main:app
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )