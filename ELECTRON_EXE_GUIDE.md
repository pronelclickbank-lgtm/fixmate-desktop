# FixMate AI - Electron .exe Setup Guide

## Overview

This guide explains how to create a Windows .exe installer for FixMate AI using Electron. The .exe will be a **thin client** that connects to your hosted Manus backend, keeping the installer small while maintaining full functionality with admin dashboard control.

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Windows .exe      │         │   Manus Hosted       │
│   (Electron App)    │────────▶│   Backend Server     │
│                     │  HTTPS  │                      │
│   - UI Only         │◀────────│   - Database         │
│   - ~50-80 MB       │         │   - Business Logic   │
└─────────────────────┘         │   - Admin Dashboard  │
                                └──────────────────────┘
```

**Key Points:**
- The .exe contains only the frontend (React UI)
- All data and logic remain on your Manus server
- Admin dashboard controls all features remotely
- Users must have internet connection to use the app

---

## Prerequisites

### On Your Local Windows PC:

1. **Node.js 18+** - Download from https://nodejs.org
2. **Git** - Download from https://git-scm.com
3. **Code Editor** - VS Code recommended
4. **Windows 10/11** - Required for building .exe

---

## Step-by-Step Setup

### Step 1: Publish Your Manus Website

1. Go to your Manus dashboard
2. Click **"Publish"** button (top-right)
3. Note your published URL (e.g., `https://your-app.manus.space`)
4. **Important:** Keep this URL - you'll need it in Step 4

### Step 2: Download Project Files

1. In Manus, go to **Management UI → Code** panel
2. Click **"Download All Files"**
3. Extract the ZIP to `C:\FixMateAI\` on your PC

### Step 3: Install Electron Dependencies

Open Command Prompt or PowerShell:

```bash
cd C:\FixMateAI
npm install electron electron-builder --save-dev
```

### Step 4: Create Electron Main Process

Create `electron-main.js` in the project root:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Your published Manus URL
const BACKEND_URL = 'https://your-app.manus.space'; // ← CHANGE THIS!

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'build-resources/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    autoHideMenuBar: true,
    title: 'FixMate AI - PC Doctor'
  });

  // Load your hosted Manus website
  mainWindow.loadURL(BACKEND_URL);

  // Optional: Open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
```

**⚠️ IMPORTANT:** Replace `https://your-app.manus.space` with your actual published URL from Step 1!

### Step 5: Update package.json

Add these sections to your `package.json`:

```json
{
  "name": "fixmate-ai",
  "version": "1.0.0",
  "description": "FixMate AI - PC Optimization Tool",
  "main": "electron-main.js",
  "scripts": {
    "electron": "electron .",
    "build:exe": "electron-builder --win --x64",
    "build:installer": "electron-builder --win --x64 --ia32"
  },
  "build": {
    "appId": "com.fixmate.pcoptimizer",
    "productName": "FixMate AI",
    "directories": {
      "output": "dist",
      "buildResources": "build-resources"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ],
      "icon": "build-resources/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "FixMate AI"
    }
  }
}
```

### Step 6: Create App Icon

1. Create folder: `C:\FixMateAI\build-resources\`
2. You need an `.ico` file (256x256 recommended)
3. Use an online converter to convert PNG → ICO:
   - Upload your `client/public/icon-512.png`
   - Convert to `.ico` format
   - Save as `build-resources/icon.ico`

**Online converters:**
- https://convertio.co/png-ico/
- https://icoconvert.com/

### Step 7: Test Electron App Locally

```bash
cd C:\FixMateAI
npm run electron
```

This opens the app in a window. Verify:
- ✅ App loads your published website
- ✅ All features work (System analysis, Clean, Optimize, etc.)
- ✅ Admin dashboard controls are effective
- ✅ No console errors

### Step 8: Build the .exe Installer

```bash
cd C:\FixMateAI
npm run build:installer
```

**Build time:** 5-10 minutes

**Output location:** `C:\FixMateAI\dist\`

**Files created:**
- `FixMate AI Setup 1.0.0.exe` (~50-80 MB) - **This is your installer!**
- `FixMate AI Setup 1.0.0.exe.blockmap` (metadata file)

### Step 9: Test the Installer

1. Navigate to `C:\FixMateAI\dist\`
2. Double-click `FixMate AI Setup 1.0.0.exe`
3. Follow installation wizard
4. Launch FixMate AI from Start Menu
5. Verify all features work

---

## File Size Optimization

### Current Size: ~50-80 MB

To reduce further:

#### Option 1: Single Architecture (saves ~20 MB)

In `package.json`, change:

```json
"arch": ["x64"]  // Remove "ia32" for 64-bit only
```

#### Option 2: Portable .exe (no installer)

Change target to `portable`:

```json
"target": ["portable"]
```

Creates a single .exe (~50 MB) with no installation needed.

#### Option 3: Use ASAR Archive

Add to `package.json`:

```json
"asar": true
```

Compresses app resources (~5-10 MB savings).

---

## Distribution

### Method 1: Direct Download

1. Upload `FixMate AI Setup 1.0.0.exe` to:
   - Your website
   - Google Drive / Dropbox
   - GitHub Releases
2. Share download link with users

### Method 2: Auto-Update (Advanced)

Use `electron-updater` for automatic updates:

```bash
npm install electron-updater --save
```

Configure in `electron-main.js`:

```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
});
```

Host updates on GitHub Releases or your own server.

---

## Admin Dashboard Control

### How It Works:

1. **User installs .exe** on their Windows PC
2. **.exe loads your Manus website** (the published URL)
3. **All features are controlled by your backend:**
   - System analysis data
   - Optimization settings
   - License validation
   - Backup management
4. **You control everything** from Manus dashboard:
   - Update features → users see changes immediately
   - Modify settings → affects all installed apps
   - View analytics → see all user activity

### Admin Dashboard Features:

- **Database Panel:** View all registered users
- **Settings Panel:** Configure app behavior
- **Analytics:** Monitor usage statistics
- **Secrets Panel:** Update API keys without rebuilding .exe

### Making Changes:

1. Edit code in Manus
2. Save checkpoint
3. Click "Publish"
4. **All installed .exe apps update automatically** (they load the new published URL)

**No need to rebuild or redistribute the .exe!**

---

## Troubleshooting

### Issue: "Windows protected your PC" warning

**Cause:** .exe is not code-signed

**Solutions:**
1. **For testing:** Click "More info" → "Run anyway"
2. **For distribution:** Purchase code signing certificate ($100-400/year)
   - Providers: DigiCert, Sectigo, GlobalSign
   - Sign .exe with `electron-builder` + certificate

### Issue: App shows blank white screen

**Causes:**
- Wrong BACKEND_URL in `electron-main.js`
- Website not published
- Internet connection issue

**Fix:**
1. Verify published URL is correct
2. Check internet connection
3. Open DevTools (uncomment line in electron-main.js)

### Issue: Features not working

**Cause:** Backend API issues

**Fix:**
1. Check Manus dashboard for errors
2. Verify database connection
3. Check browser console in DevTools

### Issue: .exe file too large

**Cause:** Electron framework overhead

**Solutions:**
- Use single architecture (x64 only)
- Enable ASAR compression
- Consider PWA instead (0 MB installer)

---

## Security Considerations

### ✅ Safe:
- User data stays on your secure Manus server
- HTTPS encryption for all communication
- No local data storage in .exe

### ⚠️ Important:
- Users need internet to use the app
- If Manus server is down, app won't work
- Protect your published URL from DDoS

### 🔒 Recommendations:
1. Use environment variables for sensitive URLs
2. Implement rate limiting on backend
3. Add authentication for all API endpoints
4. Monitor server logs for suspicious activity

---

## Cost Breakdown

| Item | Cost | Required? |
|------|------|-----------|
| Node.js | Free | Yes |
| Electron | Free | Yes |
| Manus Hosting | Subscription | Yes |
| Code Signing Certificate | $100-400/year | No (recommended for distribution) |
| Icon Converter | Free | Yes |

**Total to get started: $0** (assuming you have Manus subscription)

---

## Comparison: .exe vs PWA

| Feature | Electron .exe | PWA (Browser Install) |
|---------|--------------|----------------------|
| **Installer Size** | 50-80 MB | 0 MB (installs from browser) |
| **Installation** | Download + run .exe | Click "Install" in browser |
| **Updates** | Automatic (loads published URL) | Automatic |
| **Offline** | No (needs internet) | Partial (cached content) |
| **Desktop Icon** | Yes | Yes |
| **Start Menu** | Yes | Yes |
| **Code Signing** | $100-400/year | Not needed |
| **Distribution** | Upload .exe file | Just share URL |
| **User Trust** | May show security warning | Browser-trusted |

**Recommendation:** Try PWA first. Only build .exe if users specifically request it.

---

## Next Steps

1. ✅ Publish your Manus website
2. ✅ Follow Steps 1-9 above
3. ✅ Test installer on clean Windows PC
4. ✅ Share with beta testers
5. ✅ Consider code signing for wider distribution
6. ✅ Set up auto-update mechanism
7. ✅ Monitor user feedback and server logs

---

## Support

**For Manus platform issues:**
- Visit: https://help.manus.im

**For Electron issues:**
- Docs: https://www.electronjs.org/docs
- Community: https://github.com/electron/electron

**For this project:**
- Check your Manus dashboard logs
- Review browser DevTools console
- Verify published URL is accessible

---

## Summary

You now have a complete guide to create a Windows .exe installer that:
- ✅ Installs like a native app
- ✅ Stays small (50-80 MB)
- ✅ Connects to your Manus backend
- ✅ Controlled entirely from admin dashboard
- ✅ Updates automatically when you publish changes
- ✅ Works on Windows 10/11 (64-bit and 32-bit)

The key advantage: **You control everything from Manus. No need to rebuild or redistribute the .exe when you make changes!**
