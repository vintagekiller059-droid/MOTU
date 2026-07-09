# MOTU Windows One-Time Setup Script
# Run this once to set up the development environment

Write-Host "Setting up MOTU development environment..." -ForegroundColor Cyan

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "Node.js not found. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check if Python is installed
$pythonVersion = python --version 2>$null
if (-not $pythonVersion) {
    Write-Host "Python not found. Please install Python 3.11+ from https://python.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Python version: $pythonVersion" -ForegroundColor Green

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
python -m pip install -r requirements.txt
Set-Location ..

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Run ./scripts/dev.ps1 to start development servers." -ForegroundColor Cyan
