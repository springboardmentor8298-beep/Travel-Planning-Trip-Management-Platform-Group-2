# ============================================================
#  TripNest Backend — MySQL (default)
#  Run from ANY location:
#    powershell -ExecutionPolicy Bypass -File "start-mysql.ps1"
# ============================================================

# Force Java 21
$env:JAVA_HOME = "C:\Users\Dell\AppData\Local\jdks\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

# Profile
$env:APP_PROFILE = "local"

# Google OAuth2 credentials are picked up from the environment.
# Set these before running the script if you want Google login enabled.
#   set GOOGLE_CLIENT_ID=your-real-google-client-id
#   set GOOGLE_CLIENT_SECRET=your-real-google-client-secret

if (-not $env:GOOGLE_CLIENT_ID -or -not $env:GOOGLE_CLIENT_SECRET) {
    Write-Host ""
    Write-Host "Starting TripNest backend (MySQL) without Google OAuth." -ForegroundColor Cyan
    Write-Host "  API    : http://localhost:8080/api" -ForegroundColor Green
    Write-Host "  OAuth  : Google login DISABLED" -ForegroundColor Yellow
    Write-Host "  Hint   : set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before launching." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Starting TripNest backend (MySQL + Google OAuth)..." -ForegroundColor Cyan
    Write-Host "  API    : http://localhost:8080/api" -ForegroundColor Green
    Write-Host "  OAuth  : Google login ENABLED" -ForegroundColor Green
    Write-Host ""
}

# Mail (update with your Gmail App Password)
$env:MAIL_USERNAME = "your-gmail@gmail.com"
$env:MAIL_PASSWORD = "your-16-char-app-password"

Set-Location $PSScriptRoot
mvn spring-boot:run
