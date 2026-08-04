# MOTU Backend Startup Script
# Run this from the backend/ directory

$backendPath = (Get-Location).Path
$env:PYTHONPATH = $backendPath

Write-Host "Starting MOTU Backend..." -ForegroundColor Cyan
Write-Host "PYTHONPATH = $env:PYTHONPATH" -ForegroundColor Gray

py -m uvicorn src.main:app --reload --port 8000