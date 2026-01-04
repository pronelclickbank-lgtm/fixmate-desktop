# Building FixMate AI for Windows

This guide will help you build the Windows desktop installer for FixMate AI (PC Doctor).

## Prerequisites

### 1. Install Rust
Download and install Rust from https://rustup.rs/

```powershell
# Run in PowerShell
winget install Rustlang.Rustup
```

### 2. Install Node.js
Download and install Node.js 18+ from https://nodejs.org/

### 3. Install pnpm
```powershell
npm install -g pnpm
```

### 4. Install Tauri CLI
```powershell
cargo install tauri-cli
```

### 5. Install WebView2 (Usually pre-installed on Windows 10/11)
Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### 6. Install Visual Studio Build Tools
Download from: https://visualstudio.microsoft.com/downloads/
- Select "Desktop development with C++"
- This is required for Rust to compile Windows applications

## Building the Application

### Step 1: Clone/Download the Project
```powershell
cd C:\path\to\pc-doctor
```

### Step 2: Install Dependencies
```powershell
# Install Node dependencies
pnpm install

# This will also install Rust dependencies automatically
```

### Step 3: Build the Frontend
```powershell
pnpm build:frontend
```

### Step 4: Build the Tauri Application
```powershell
cd src-tauri
cargo tauri build
```

This will create:
- **MSI Installer**: `src-tauri/target/release/bundle/msi/FixMate AI_1.0.0_x64_en-US.msi` (~10-15 MB)
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/FixMate AI_1.0.0_x64-setup.exe` (~10-15 MB)

## Quick Build Script

Save this as `build.ps1` in the project root:

```powershell
# Build FixMate AI for Windows
Write-Host "Building FixMate AI..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
pnpm build:frontend

# Build Tauri app
Write-Host "Building Tauri application..." -ForegroundColor Yellow
cd src-tauri
cargo tauri build

Write-Host "Build complete! Installers are in src-tauri/target/release/bundle/" -ForegroundColor Green
```

Run it:
```powershell
.\build.ps1
```

## Development Mode

To run the app in development mode:

```powershell
# Terminal 1: Start frontend dev server
pnpm dev:frontend

# Terminal 2: Start Tauri dev app
cd src-tauri
cargo tauri dev
```

## Troubleshooting

### Error: "WebView2 not found"
Install WebView2 Runtime from Microsoft

### Error: "MSVC not found"
Install Visual Studio Build Tools with C++ support

### Error: "cargo command not found"
Restart your terminal after installing Rust

### Build is slow
First build takes 10-20 minutes. Subsequent builds are much faster.

## Distribution

The generated `.msi` or `.exe` installer can be distributed to users. It includes:
- ✅ Small installer size (~10-15 MB)
- ✅ Uses system WebView2 (no Chromium bundle)
- ✅ Auto-update capability
- ✅ Native Windows system access
- ✅ Registry, disk, process management

## Signing the Installer (Optional)

For production distribution, sign the installer with a code signing certificate:

```powershell
signtool sign /f "certificate.pfx" /p "password" /t http://timestamp.digicert.com "FixMate AI_1.0.0_x64-setup.exe"
```

## Next Steps

After building:
1. Test the installer on a clean Windows machine
2. Verify all features work correctly
3. Set up auto-update server (optional)
4. Distribute to users
