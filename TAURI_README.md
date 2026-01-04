# FixMate AI - Tauri Desktop Application

Complete Windows desktop application for PC system optimization with native system access.

## 🎯 Features

### System Analysis
- Real-time CPU, RAM, and disk monitoring
- System information (OS, processor, memory)
- Hardware diagnostics

### Process Management
- View all running processes
- Kill unresponsive processes
- Monitor CPU and memory usage per process

### Startup Programs
- Manage Windows startup programs
- Enable/disable startup entries via Registry
- Performance impact ratings

### Disk Cleanup
- Scan and clean temporary files
- Browser cache cleanup (Chrome, Edge, Firefox)
- Prefetch file cleanup
- Recycle bin management

### Registry Cleanup
- Scan for invalid registry entries
- Clean orphaned file associations
- Remove invalid uninstall entries

### System Optimization
- DNS cache flush
- Network settings optimization
- System services optimization
- Disk defragmentation

### Backup & Restore
- Create Windows System Restore points
- Restore from previous backups
- List all available restore points

## 📦 Project Structure

```
pc-doctor/
├── src-tauri/              # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── commands.rs     # Tauri command definitions
│   │   └── system/         # System modules
│   │       ├── system_info.rs    # System information
│   │       ├── process.rs        # Process management
│   │       ├── startup.rs        # Startup programs
│   │       ├── cleanup.rs        # Disk cleanup
│   │       ├── registry.rs       # Registry operations
│   │       ├── optimization.rs   # System optimization
│   │       └── backup.rs         # Backup/restore
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri configuration
│   └── build.rs            # Build script
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # UI pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities
│   └── dist/               # Built frontend (after build)
├── BUILD_WINDOWS.md        # Build instructions
└── package.json            # Node dependencies
```

## 🚀 Building for Windows

See [BUILD_WINDOWS.md](./BUILD_WINDOWS.md) for detailed instructions.

### Quick Start

1. **Install Prerequisites**
   - Rust: https://rustup.rs/
   - Node.js 18+: https://nodejs.org/
   - Visual Studio Build Tools with C++

2. **Install Dependencies**
   ```powershell
   pnpm install
   ```

3. **Build**
   ```powershell
   pnpm build:frontend
   pnpm tauri:build
   ```

4. **Output**
   - MSI: `src-tauri/target/release/bundle/msi/FixMate AI_1.0.0_x64_en-US.msi`
   - NSIS: `src-tauri/target/release/bundle/nsis/FixMate AI_1.0.0_x64-setup.exe`

## 💻 Development

### Run in Development Mode

```powershell
# Terminal 1: Frontend dev server
pnpm dev:frontend

# Terminal 2: Tauri dev app
pnpm tauri:dev
```

### Frontend Only (Web Mode)
```powershell
pnpm dev
```

## 🔧 Technical Details

### Technologies
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri 2.0
- **System Access**: Windows API, Registry, sysinfo crate
- **Build Size**: ~10-15 MB installer
- **Runtime**: Uses system WebView2 (no Chromium bundle)

### Windows APIs Used
- **Registry**: `winreg` crate for startup programs and registry cleanup
- **Process Management**: `sysinfo` crate for process monitoring
- **File System**: Standard Rust `std::fs` for disk operations
- **System Commands**: PowerShell for restore points and defragmentation

### Security
- Requires Administrator privileges for:
  - Registry modifications
  - System restore point creation
  - Process termination
  - Disk cleanup in system directories

## 📝 Tauri Commands

All Rust functions are exposed to the frontend via Tauri commands:

```typescript
// Example usage in React
import { invoke } from '@tauri-apps/api/tauri';

// Get system info
const info = await invoke('get_system_info');

// Get processes
const processes = await invoke('get_processes');

// Kill a process
await invoke('kill_process', { pid: 1234 });

// Clean temp files
const freedMB = await invoke('clean_temp_files', { 
  paths: ['/path/to/file1', '/path/to/file2'] 
});
```

## 🎨 UI Components

The frontend uses shadcn/ui components:
- Cards for system metrics
- Tables for process lists
- Dialogs for confirmations
- Progress bars for operations
- Toasts for notifications

## 🔄 Auto-Update

Tauri includes built-in auto-update support. To enable:

1. Set up an update server
2. Configure `tauri.conf.json`:
   ```json
   "updater": {
     "active": true,
     "endpoints": ["https://your-server.com/updates/{{target}}/{{current_version}}"],
     "dialog": true,
     "pubkey": "YOUR_PUBLIC_KEY"
   }
   ```

## 📋 System Requirements

### For Building
- Windows 10/11
- Rust 1.70+
- Node.js 18+
- Visual Studio Build Tools
- 4GB RAM minimum

### For Running
- Windows 10/11
- WebView2 Runtime (pre-installed on Windows 11)
- 2GB RAM minimum
- 100MB disk space

## 🐛 Troubleshooting

### Build Errors

**"MSVC not found"**
- Install Visual Studio Build Tools with C++ support

**"WebView2 not found"**
- Install WebView2 Runtime from Microsoft

**"cargo command not found"**
- Restart terminal after installing Rust
- Ensure `~/.cargo/bin` is in PATH

### Runtime Errors

**"Access Denied"**
- Run as Administrator for system operations

**"Registry key not found"**
- Some registry operations require elevated privileges

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Windows
5. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact support at support@fixmate.ai

## 🎯 Roadmap

- [ ] Add scheduled optimization
- [ ] Implement system monitoring dashboard
- [ ] Add driver update checker
- [ ] Include malware scanner integration
- [ ] Add system benchmark tools
- [ ] Cloud backup integration
