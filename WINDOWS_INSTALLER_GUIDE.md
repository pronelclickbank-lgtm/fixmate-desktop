# FixMate AI - Windows Installer Guide

This guide explains how to package FixMate AI as a Windows desktop application with a small installer that downloads components during installation.

## Overview

FixMate AI is a web-based application that can be packaged as a Windows desktop app using **Electron** or run as a **Progressive Web App (PWA)**. The installer will be small (~5-10MB) and download additional components during installation.

## Recommended Approach: Electron + Electron Builder

### Why Electron?

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Web technologies**: Uses the existing React/TypeScript codebase
- **Native integration**: Access to Windows APIs for real system diagnostics
- **Auto-updates**: Built-in update mechanism
- **Small installer**: Can create a stub installer that downloads components

### Prerequisites

1. Node.js 18+ installed
2. Windows development environment
3. Code signing certificate (optional, for production)

## Step 1: Install Electron Dependencies

```bash
cd /path/to/fixmate-ai
pnpm add -D electron electron-builder
pnpm add electron-squirrel-startup
```

## Step 2: Create Electron Main Process

Create `electron/main.js`:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
    title: 'FixMate AI',
    backgroundColor: '#f8fafc'
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Auto-update handlers
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});
```

Create `electron/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Expose system APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // System information
  getSystemInfo: async () => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      cpu: {
        model: cpus[0].model,
        cores: cpus.length,
        usage: await getCPUUsage()
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        used: Math.round((totalMem - freeMem) / 1024 / 1024),
        usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100)
      },
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname()
    };
  },

  // Get startup programs (Windows only)
  getStartupPrograms: async () => {
    if (process.platform !== 'win32') return [];
    
    try {
      const { stdout } = await execPromise(
        'wmic startup get caption,command,location'
      );
      return parseStartupPrograms(stdout);
    } catch (error) {
      console.error('Failed to get startup programs:', error);
      return [];
    }
  },

  // Get driver information (Windows only)
  getDrivers: async () => {
    if (process.platform !== 'win32') return [];
    
    try {
      const { stdout } = await execPromise(
        'driverquery /v /fo csv'
      );
      return parseDrivers(stdout);
    } catch (error) {
      console.error('Failed to get drivers:', error);
      return [];
    }
  },

  // Get security status (Windows only)
  getSecurityStatus: async () => {
    if (process.platform !== 'win32') return null;
    
    try {
      // Check Windows Defender status
      const { stdout: defenderStatus } = await execPromise(
        'powershell "Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled | ConvertTo-Json"'
      );
      
      // Check firewall status
      const { stdout: firewallStatus } = await execPromise(
        'netsh advfirewall show allprofiles state'
      );
      
      return {
        antivirus: JSON.parse(defenderStatus),
        firewall: firewallStatus.includes('ON')
      };
    } catch (error) {
      console.error('Failed to get security status:', error);
      return null;
    }
  },

  // Update handlers
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  restartApp: () => {
    ipcRenderer.send('restart-app');
  }
});

// Helper functions
async function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return Math.round(100 - (100 * totalIdle / totalTick));
}

function parseStartupPrograms(output) {
  const lines = output.split('\n').slice(1);
  return lines
    .filter(line => line.trim())
    .map(line => {
      const parts = line.split(/\s{2,}/);
      return {
        name: parts[0]?.trim(),
        command: parts[1]?.trim(),
        location: parts[2]?.trim()
      };
    });
}

function parseDrivers(csvOutput) {
  const lines = csvOutput.split('\n').slice(1);
  return lines
    .filter(line => line.trim())
    .map(line => {
      const parts = line.split(',').map(p => p.replace(/"/g, ''));
      return {
        name: parts[0],
        displayName: parts[1],
        type: parts[2],
        startMode: parts[3]
      };
    });
}
```

## Step 3: Configure Electron Builder

Add to `package.json`:

```json
{
  "name": "fixmate-ai",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "pnpm build && electron-builder",
    "electron:build:win": "pnpm build && electron-builder --win --x64"
  },
  "build": {
    "appId": "com.fixmate.ai",
    "productName": "FixMate AI",
    "copyright": "Copyright © 2025 FixMate AI",
    "directories": {
      "output": "release",
      "buildResources": "assets"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "assets/icon.ico",
      "publisherName": "FixMate AI",
      "verifyUpdateCodeSignature": false
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "FixMate AI",
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico",
      "installerHeaderIcon": "assets/icon.ico",
      "deleteAppDataOnUninstall": true,
      "runAfterFinish": true,
      "artifactName": "FixMate-AI-Setup-${version}.exe",
      "differentialPackage": true
    },
    "publish": {
      "provider": "generic",
      "url": "https://your-update-server.com/updates"
    }
  }
}
```

## Step 4: Create Small Stub Installer

For a small installer that downloads components during installation, use **NSIS Web Installer**:

Create `installer.nsi`:

```nsis
; FixMate AI Stub Installer
!define PRODUCT_NAME "FixMate AI"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "FixMate AI"
!define PRODUCT_WEB_SITE "https://fixmate.ai"
!define DOWNLOAD_URL "https://your-cdn.com/fixmate-ai-full.exe"

!include "MUI2.nsh"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "FixMate-AI-Setup-Stub.exe"
InstallDir "$PROGRAMFILES64\FixMate AI"

; Modern UI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  
  ; Download full installer
  NSISdl::download "${DOWNLOAD_URL}" "$TEMP\fixmate-full.exe"
  Pop $R0
  
  StrCmp $R0 "success" +3
    MessageBox MB_OK "Download failed: $R0"
    Quit
  
  ; Run full installer
  ExecWait "$TEMP\fixmate-full.exe"
  Delete "$TEMP\fixmate-full.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\FixMate AI.exe"
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\FixMate AI.exe"
SectionEnd
```

## Step 5: Build the Installer

### Development Build

```bash
pnpm electron:dev
```

### Production Build

```bash
# Build full installer
pnpm electron:build:win

# This creates:
# - release/FixMate-AI-Setup-1.0.0.exe (full installer, ~150MB)
# - release/FixMate-AI-1.0.0.exe (unpacked app)
```

### Create Stub Installer

```bash
# Install NSIS (Windows)
choco install nsis

# Compile stub installer
makensis installer.nsi

# This creates:
# - FixMate-AI-Setup-Stub.exe (~5MB)
```

## Step 6: Auto-Update Configuration

The app checks for updates from the URL specified in `package.json` under `publish.url`.

Create an update server endpoint that returns:

```json
{
  "version": "1.0.1",
  "files": [
    {
      "url": "FixMate-AI-Setup-1.0.1.exe",
      "sha512": "...",
      "size": 157286400
    }
  ],
  "path": "FixMate-AI-Setup-1.0.1.exe",
  "sha512": "...",
  "releaseDate": "2025-01-15T10:00:00.000Z"
}
```

## Alternative: Progressive Web App (PWA)

For a lighter approach without Electron:

1. **Add PWA manifest** (`public/manifest.json`):

```json
{
  "name": "FixMate AI",
  "short_name": "FixMate",
  "description": "Your intelligent PC troubleshooting assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Add service worker** for offline support
3. **Users install via browser** (Chrome: Install App button)

## Deployment Checklist

- [ ] Create application icon (icon.ico)
- [ ] Add code signing certificate (for trusted installer)
- [ ] Set up update server (for auto-updates)
- [ ] Upload full installer to CDN
- [ ] Test installer on clean Windows machine
- [ ] Configure Windows Defender exclusions (if needed)
- [ ] Create uninstaller
- [ ] Add crash reporting (e.g., Sentry)

## Distribution

1. **Direct Download**: Host installer on your website
2. **Microsoft Store**: Package as MSIX
3. **GitHub Releases**: Use GitHub as update server
4. **Custom Update Server**: Host on your infrastructure

## Security Considerations

- **Code Signing**: Sign the installer to avoid Windows SmartScreen warnings
- **HTTPS**: Always use HTTPS for update downloads
- **Checksum Verification**: Verify SHA-512 checksums for updates
- **Permissions**: Request minimal Windows permissions

## Troubleshooting

### Installer too large?

- Use NSIS web installer (stub)
- Enable differential updates
- Compress assets with 7zip

### Auto-update not working?

- Check `publish.url` in package.json
- Verify update server returns correct JSON
- Check network connectivity

### Windows Defender blocking?

- Add code signing certificate
- Submit to Microsoft for reputation building
- Add installer to exclusions during testing

## Next Steps

1. Build the Electron app
2. Create installer
3. Test on multiple Windows versions
4. Set up auto-update infrastructure
5. Deploy to production

For questions or issues, refer to:
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
