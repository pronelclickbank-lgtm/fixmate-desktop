# Persistent Desktop AI Chat Widget Guide

This guide explains how to create an **always-visible AI chat widget** that stays on the Windows desktop even when the main FixMate AI application is closed, with animated optimization/fix/speedup icons to attract user attention.

## Overview

The persistent widget will:
- ✅ Stay visible on desktop at all times (always-on-top)
- ✅ Run in background via system tray
- ✅ Show animated icons (🔧 fixing, ⚡ speedup, 🛡️ optimization)
- ✅ Display emoji animations to catch attention
- ✅ Auto-start with Windows
- ✅ Allow quick access to AI chat without opening main app

## Architecture

```
┌─────────────────────────────────────┐
│   Windows Desktop                    │
│                                      │
│                      ┌──────────────┐│
│                      │ AI Widget    ││
│                      │ (Overlay)    ││
│                      │              ││
│                      │ 🔧⚡🛡️       ││
│                      │ [Chat Here]  ││
│                      └──────────────┘│
│                                      │
│  System Tray: [FixMate Icon]        │
└─────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Update Electron Main Process

Create `electron/main.js` with overlay window support:

```javascript
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let overlayWindow; // Persistent AI chat widget
let tray;

// Create the main application window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
    title: 'FixMate AI'
  });

  mainWindow.loadURL('http://localhost:3000'); // or production build

  mainWindow.on('close', (event) => {
    // Don't quit app, just hide main window
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Create the persistent overlay widget (AI chat)
function createOverlayWidget() {
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 500,
    x: 20, // Position from right edge
    y: 100, // Position from bottom
    frame: false, // No window frame
    transparent: true, // Transparent background
    alwaysOnTop: true, // Always stay on top
    skipTaskbar: true, // Don't show in taskbar
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the widget HTML
  overlayWindow.loadFile(path.join(__dirname, '../dist/widget.html'));

  // Make widget draggable
  overlayWindow.setIgnoreMouseEvents(false);

  // Keep widget always visible
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

// Create system tray icon
function createTray() {
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open FixMate AI',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createMainWindow();
        }
      }
    },
    {
      label: 'Toggle AI Widget',
      click: () => {
        if (overlayWindow) {
          if (overlayWindow.isVisible()) {
            overlayWindow.hide();
          } else {
            overlayWindow.show();
          }
        } else {
          createOverlayWidget();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Start on Boot',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          openAsHidden: true // Start minimized to tray
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('FixMate AI - Your PC Assistant');
  tray.setContextMenu(contextMenu);

  // Double-click tray icon to show main window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      createMainWindow();
    }
  });
}

// App initialization
app.whenReady().then(() => {
  createTray();
  createOverlayWidget(); // Start with widget visible
  
  // Optionally create main window (or start hidden)
  // createMainWindow();
});

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// IPC handlers for widget interactions
ipcMain.on('minimize-widget', () => {
  if (overlayWindow) {
    overlayWindow.minimize();
  }
});

ipcMain.on('close-widget', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

ipcMain.on('open-main-app', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createMainWindow();
  }
});
```

### Step 2: Create Widget HTML

Create `client/widget.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FixMate AI Widget</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: transparent;
      overflow: hidden;
    }

    .widget-container {
      width: 400px;
      height: 500px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(6, 182, 212, 0.95));
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .widget-header {
      padding: 15px 20px;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      -webkit-app-region: drag;
    }

    .widget-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }

    .widget-controls {
      display: flex;
      gap: 8px;
      -webkit-app-region: no-drag;
    }

    .control-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .animation-container {
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      flex: 1;
    }

    .emoji-animation {
      font-size: 80px;
      animation: bounce 1.5s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .action-text {
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      animation: fadeInOut 3s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .icon-row {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }

    .action-icon {
      font-size: 40px;
      animation: rotate 3s linear infinite;
    }

    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .chat-button {
      padding: 15px 40px;
      background: white;
      color: #8b5cf6;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
      margin-top: 20px;
    }

    .chat-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .quick-stats {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    .stat-item {
      flex: 1;
      text-align: center;
      color: white;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="widget-header">
      <div class="widget-title">
        <div class="status-indicator"></div>
        <span>FixMate AI</span>
      </div>
      <div class="widget-controls">
        <button class="control-btn" onclick="minimizeWidget()">−</button>
        <button class="control-btn" onclick="closeWidget()">×</button>
      </div>
    </div>

    <div class="animation-container">
      <div class="emoji-animation" id="emoji">👨‍💻</div>
      <div class="action-text" id="actionText">Optimizing Your PC...</div>
      
      <div class="icon-row">
        <div class="action-icon">🔧</div>
        <div class="action-icon">⚡</div>
        <div class="action-icon">🛡️</div>
      </div>

      <button class="chat-button" onclick="openChat()">
        💬 Chat with AI
      </button>

      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-value">45%</div>
          <div class="stat-label">CPU</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">50%</div>
          <div class="stat-label">RAM</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">Good</div>
          <div class="stat-label">Health</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Rotate through different actions
    const actions = [
      { emoji: '👨‍💻', text: 'Optimizing Your PC...' },
      { emoji: '🔧', text: 'Fixing Issues...' },
      { emoji: '⚡', text: 'Speeding Up System...' },
      { emoji: '🛡️', text: 'Protecting Your PC...' },
      { emoji: '🚀', text: 'Boosting Performance...' }
    ];

    let currentIndex = 0;

    function updateAnimation() {
      const action = actions[currentIndex];
      document.getElementById('emoji').textContent = action.emoji;
      document.getElementById('actionText').textContent = action.text;
      currentIndex = (currentIndex + 1) % actions.length;
    }

    // Change animation every 3 seconds
    setInterval(updateAnimation, 3000);

    function minimizeWidget() {
      if (window.electronAPI) {
        window.electronAPI.send('minimize-widget');
      }
    }

    function closeWidget() {
      if (window.electronAPI) {
        window.electronAPI.send('close-widget');
      }
    }

    function openChat() {
      if (window.electronAPI) {
        window.electronAPI.send('open-main-app');
      }
    }

    // Update stats from system (if available)
    if (window.electronAPI) {
      setInterval(async () => {
        const stats = await window.electronAPI.getSystemInfo();
        if (stats) {
          document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = 
            Math.round(stats.cpu.usage) + '%';
          document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = 
            stats.memory.usagePercent + '%';
        }
      }, 5000);
    }
  </script>
</body>
</html>
```

### Step 3: Update Preload Script

Update `electron/preload.js` to add IPC communication:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const validChannels = ['minimize-widget', 'close-widget', 'open-main-app'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  getSystemInfo: async () => {
    // Return system info (implement based on your needs)
    return {
      cpu: { usage: 45 },
      memory: { usagePercent: 50 }
    };
  }
});
```

### Step 4: Build Configuration

Update `package.json`:

```json
{
  "build": {
    "extraResources": [
      {
        "from": "client/widget.html",
        "to": "dist/widget.html"
      },
      {
        "from": "assets/tray-icon.png",
        "to": "assets/tray-icon.png"
      }
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "runAfterFinish": true,
      "installerIcon": "assets/icon.ico"
    }
  }
}
```

### Step 5: Create Assets

You'll need these image assets:

1. **icon.ico** (256x256) - Main application icon
2. **tray-icon.png** (16x16, 32x32) - System tray icon

## Features

### ✅ Always Visible
- Widget stays on top of all windows
- Visible across all virtual desktops
- Transparent background with blur effect

### ✅ Animated Attention-Grabbing
- Rotating emoji animations (👨‍💻, 🔧, ⚡, 🛡️, 🚀)
- Pulsing status indicator
- Bouncing animations
- Rotating action icons

### ✅ System Tray Integration
- Runs in background even when main app is closed
- Right-click tray icon for options
- Double-click to open main app

### ✅ Auto-Start
- Option to start with Windows
- Starts minimized to tray
- Widget appears automatically

### ✅ Quick Access
- Click "Chat with AI" to open main app
- Shows real-time system stats
- Draggable to reposition

## Testing

1. **Build the app**:
   ```bash
   pnpm electron:build:win
   ```

2. **Install and run**:
   - Install the generated `.exe`
   - Widget should appear on desktop
   - Check system tray for icon

3. **Test features**:
   - Drag widget to different positions
   - Close main app (widget stays visible)
   - Right-click tray icon for menu
   - Enable "Start on Boot"

## Customization

### Change Widget Position

In `createOverlayWidget()`:
```javascript
overlayWindow = new BrowserWindow({
  x: screen.getPrimaryDisplay().workAreaSize.width - 420, // Right side
  y: screen.getPrimaryDisplay().workAreaSize.height - 520, // Bottom
  // ...
});
```

### Change Animations

Edit `client/widget.html`:
```javascript
const actions = [
  { emoji: '🎯', text: 'Your Custom Text...' },
  // Add more actions
];
```

### Change Colors

Update CSS in `widget.html`:
```css
.widget-container {
  background: linear-gradient(135deg, 
    rgba(YOUR_COLOR_1), 
    rgba(YOUR_COLOR_2));
}
```

## Troubleshooting

### Widget not appearing?
- Check if `overlayWindow` is created in `main.js`
- Verify `widget.html` path is correct
- Check console for errors

### Widget behind other windows?
- Ensure `alwaysOnTop: true` is set
- Try `setAlwaysOnTop(true, 'screen-saver')`

### Tray icon not showing?
- Verify `tray-icon.png` exists
- Check icon path in `createTray()`

### Auto-start not working?
- Run app as administrator once
- Check Windows Task Manager > Startup

## Production Deployment

1. **Code sign the executable** (prevents Windows warnings)
2. **Test on clean Windows machine**
3. **Create installer with NSIS**
4. **Distribute via website or Microsoft Store**

## Security Notes

- Widget runs with same permissions as main app
- No elevated privileges required
- All data stays local (unless AI chat is used)
- System tray icon indicates app is running

---

**Result**: Users will always see the FixMate AI widget on their desktop with eye-catching animations, making it easy to access AI support anytime! 🚀
