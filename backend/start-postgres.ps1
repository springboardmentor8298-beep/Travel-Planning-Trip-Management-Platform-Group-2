# ============================================================
#  TripNest Backend — PostgreSQL
#
#  FIRST TIME SETUP (do once in pgAdmin 4):
#  1. Open pgAdmin 4
#  2. Right-click your server → Create → Database → name: tripnest_db
#  3. If you need to reset postgres password:
#       Object Explorer → Login/Group Roles → postgres
#       Right-click → Properties → Definition → set password → Save
#  4. Update DB_PASSWORD below with your postgres password
# ============================================================

# Force Java 21 (project requires Java 21)
$env:JAVA_HOME = "C:\Users\Dell\AppData\Local\jdks\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

$jv = (java -version 2>&1)[0]
Write-Host "Java: $jv" -ForegroundColor Yellow

# PostgreSQL config  ← update DB_PASSWORD with your postgres password
$env:APP_PROFILE = "postgres"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "swami@06"   # change if different

# Google OAuth2 credentials are picked up from the environment.
# Set these before running the script if you want Google login enabled.
#   set GOOGLE_CLIENT_ID=your-real-google-client-id
#   set GOOGLE_CLIENT_SECRET=your-real-google-client-secret

if (-not $env:GOOGLE_CLIENT_ID -or -not $env:GOOGLE_CLIENT_SECRET) {
    Write-Host ""
    Write-Host "Starting TripNest backend (PostgreSQL) without Google OAuth." -ForegroundColor Cyan
    Write-Host "  API : http://localhost:8080/api" -ForegroundColor Green
    Write-Host "  OAuth: Google login DISABLED" -ForegroundColor Yellow
    Write-Host "  Hint : set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before launching." -ForegroundColor Yellow
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "Starting TripNest backend (PostgreSQL + Google OAuth)..." -ForegroundColor Cyan
    Write-Host "  API : http://localhost:8080/api"          -ForegroundColor Green
    Write-Host "  OAuth: Google login ENABLED"             -ForegroundColor Green
    Write-Host ""
}

# Mail config
$env:MAIL_USERNAME = "your-gmail@gmail.com"
$env:MAIL_PASSWORD = "your-16-char-app-password"

Set-Location $PSScriptRoot
mvn spring-boot:run
