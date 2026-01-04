# FixMate AI - Windows Build Script
# Run this script on Windows to build the desktop installer

param(
    [switch]$SkipDependencies,
    [switch]$DevMode
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FixMate AI - Windows Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
Write-Host "[1/6] Checking Rust installation..." -ForegroundColor Yellow
if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust is not installed!" -ForegroundColor Red
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}
$rustVersion = cargo --version
Write-Host "✓ $rustVersion" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "[2/6] Checking Node.js installation..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
$nodeVersion = node --version
Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green

# Check if pnpm is installed
Write-Host "[3/6] Checking pnpm installation..." -ForegroundColor Yellow
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed!" -ForegroundColor Red
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
$pnpmVersion = pnpm --version
Write-Host "✓ pnpm $pnpmVersion" -ForegroundColor Green

# Install dependencies
if (!$SkipDependencies) {
    Write-Host "[4/6] Installing Node.js dependencies..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[4/6] Skipping dependency installation..." -ForegroundColor Gray
}

# Build frontend
Write-Host "[5/6] Building React frontend..." -ForegroundColor Yellow
pnpm build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

# Build Tauri application
if ($DevMode) {
    Write-Host "[6/6] Starting Tauri in development mode..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    pnpm tauri:dev
} else {
    Write-Host "[6/6] Building Tauri desktop application..." -ForegroundColor Yellow
    Write-Host "This may take 10-20 minutes on first build..." -ForegroundColor Gray
    pnpm tauri:build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tauri build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Build Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installers created:" -ForegroundColor Cyan
    Write-Host "  MSI:  src-tauri\target\release\bundle\msi\FixMate AI_1.0.0_x64_en-US.msi" -ForegroundColor White
    Write-Host "  NSIS: src-tauri\target\release\bundle\nsis\FixMate AI_1.0.0_x64-setup.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "Installer size: ~10-15 MB" -ForegroundColor Gray
    Write-Host ""
}
