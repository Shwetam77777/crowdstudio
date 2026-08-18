# CrowdStudio Setup Script for Windows (PowerShell)
# Run this script to set up the entire project

Write-Host "🎵 CrowdStudio Setup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host ""
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Set-Location backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production_12345"
JWT_EXPIRY="7d"
CORS_ORIGIN="http://localhost:3000"
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✓ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Run Prisma migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name updated_schema
npx prisma generate
Write-Host "✓ Database migrations completed" -ForegroundColor Green

# Return to root
Set-Location ..

# Frontend Setup
Write-Host ""
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
Set-Location frontend-web

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_BASE=http://localhost:4000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✓ Created .env.local file" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local file already exists" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Return to root
Set-Location ..

# Done
Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd frontend-web" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then visit: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "For more details, see SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
