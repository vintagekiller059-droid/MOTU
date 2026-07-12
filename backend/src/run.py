"""Entry point to start the MOTU backend on Windows."""

import sys

# Add src to path so imports work
sys.path.insert(0, __import__("os").path.dirname(__file__))

from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
