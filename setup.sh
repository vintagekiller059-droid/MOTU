#!/bin/bash
set -e

echo "=========================================="
echo "MOTU - My Own Thinking Unit"
echo "Setup Script"
echo "=========================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "[ERROR] Ollama not found. Please install it first:"
    echo "https://ollama.com/download"
    exit 1
fi

echo "[1/5] Checking Ollama..."
ollama --version

echo ""
echo "[2/5] Pulling Qwen model (this may take a while)..."
ollama pull qwen2.5:1.5b

echo ""
echo "[3/5] Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo ""
echo "[4/5] Setting up frontend..."
cd ../frontend
npm install

echo ""
echo "[5/5] Creating data directories..."
mkdir -p ../backend/data/voices

echo ""
echo "=========================================="
echo "Setup complete! To start MOTU:"
echo ""
echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173"
echo "=========================================="
echo ""
echo "Voice Setup:"
echo "  1. Download Piper from https://github.com/rhasspy/piper/releases"
echo "  2. Add piper to your PATH"
echo "  3. Download a voice model to backend/data/voices/"
echo "=========================================="
