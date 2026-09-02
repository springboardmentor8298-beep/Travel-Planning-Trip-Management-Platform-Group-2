# ============================================================
#  TripNest Frontend
#  Run from ANY location:
#    powershell -ExecutionPolicy Bypass -File "start-frontend.ps1"
# ============================================================

Set-Location $PSScriptRoot

# Install dependencies if node_modules is missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting TripNest frontend..." -ForegroundColor Cyan
Write-Host "  URL : http://localhost:3000"  -ForegroundColor Green
Write-Host "  Make sure backend is running on http://localhost:8080"  -ForegroundColor Yellow
Write-Host ""

npm start
