# MOTU Development Script
# Starts both frontend and backend servers

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWDrontend
    npm run dev
}

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWDackend
    python src/main.py
}

Write-Host "MOTU development servers starting..." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Yellow

try {
    while ($true) {
        Receive-Job -Job $frontendJob
        Receive-Job -Job $backendJob
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Job -Job $frontendJob
    Stop-Job -Job $backendJob
    Remove-Job -Job $frontendJob
    Remove-Job -Job $backendJob
    Write-Host "Servers stopped." -ForegroundColor Red
}
