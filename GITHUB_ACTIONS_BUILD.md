# GitHub Actions Automatic Build Setup

This document explains how to set up automatic Windows .exe builds using GitHub Actions. Every time you push code, GitHub will automatically compile your Tauri app on Windows servers and create downloadable installers.

---

## 🚀 Quick Start

### 1. Push Your Project to GitHub

```bash
# Initialize git repository (if not already done)
cd /home/ubuntu/pc-doctor
git init
git add .
git commit -m "Initial commit with Tauri setup"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/fixmate-ai.git
git branch -M main
git push -u origin main
```

### 2. Workflow Triggers

The workflow automatically runs when you:
- **Push to main branch** - Builds .exe for testing
- **Create a tag** (e.g., `v1.0.0`) - Builds .exe AND creates GitHub Release
- **Open pull request** - Builds .exe to verify changes
- **Manual trigger** - Click "Run workflow" button in GitHub Actions tab

---

## 📦 What Gets Built

| File Type | Location | Description |
|-----------|----------|-------------|
| **Standalone .exe** | `fixmate-ai.exe` | Single executable (~8-15 MB) |
| **MSI Installer** | `FixMate-AI_x.x.x_x64.msi` | Windows Installer package |
| **NSIS Installer** | `FixMate-AI_x.x.x_x64-setup.exe` | Custom branded installer |

---

## 📥 Download Built Files

### Option 1: From Actions Tab (Every Commit)

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on the latest workflow run
4. Scroll to **Artifacts** section at bottom
5. Download:
   - `fixmate-ai-windows-exe` - Standalone executable
   - `fixmate-ai-windows-msi` - MSI installer
   - `fixmate-ai-windows-installer` - NSIS installer

### Option 2: From Releases (Tagged Versions)

1. Create a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub automatically creates a **Release** with all installers attached

3. Go to **Releases** section on GitHub and download files

---

## 🔐 Optional: Code Signing Setup

To remove Windows SmartScreen warnings, add code signing:

### Step 1: Get a Code Signing Certificate

Purchase from:
- **Sectigo** (~$100/year)
- **DigiCert** (~$400/year)
- **SSL.com** (~$150/year)

### Step 2: Generate Tauri Signing Keys

```bash
# On your local Windows PC
pnpm tauri signer generate -w ~/.tauri/myapp.key
```

This creates:
- `myapp.key` - Private key file
- `myapp.key.pub` - Public key file

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `TAURI_PRIVATE_KEY` | Contents of `myapp.key` file |
| `TAURI_KEY_PASSWORD` | Password you set (if any) |

### Step 4: Update tauri.conf.json

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

---

## 🛠️ Workflow Configuration

### File Location
`.github/workflows/tauri-build.yml`

### Key Features

✅ **Automatic dependency caching** - Faster builds (Rust + Node.js)  
✅ **Multi-format output** - .exe, MSI, NSIS installers  
✅ **Artifact uploads** - Download from Actions tab  
✅ **Automatic releases** - Created on version tags  
✅ **Cross-platform ready** - Easy to add macOS/Linux builds  

### Build Time

- **First build**: ~15-20 minutes (downloads dependencies)
- **Subsequent builds**: ~5-8 minutes (cached dependencies)

---

## 🔄 Creating Releases

### Semantic Versioning

Use version tags to trigger releases:

```bash
# Patch release (bug fixes)
git tag v1.0.1
git push origin v1.0.1

# Minor release (new features)
git tag v1.1.0
git push origin v1.1.0

# Major release (breaking changes)
git tag v2.0.0
git push origin v2.0.0
```

### Release Notes

GitHub automatically generates release notes from commits. To customize:

1. Go to **Releases** tab
2. Click **Edit** on the release
3. Add custom description, screenshots, changelog

---

## 🐛 Troubleshooting

### Build Fails with "Rust not found"

**Solution**: Workflow already includes Rust setup. Check logs for specific error.

### Build Fails with "pnpm command not found"

**Solution**: Workflow uses `pnpm/action-setup@v3`. Verify pnpm version in workflow file.

### Artifacts Not Uploaded

**Solution**: Check build logs for errors. Ensure Tauri build completes successfully.

### MSI/NSIS Installers Missing

**Solution**: These are optional. If missing, check `tauri.conf.json` bundle configuration:

```json
{
  "bundle": {
    "targets": ["msi", "nsis"]
  }
}
```

---

## 📊 Build Status Badge

Add a build status badge to your README.md:

```markdown
![Build Status](https://github.com/YOUR_USERNAME/fixmate-ai/actions/workflows/tauri-build.yml/badge.svg)
```

---

## 🚀 Advanced: Add macOS and Linux Builds

Extend the workflow to build for all platforms:

```yaml
jobs:
  build:
    strategy:
      matrix:
        platform: [windows-latest, ubuntu-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
      # ... same steps as Windows build
```

---

## 📝 Next Steps

1. **Push code to GitHub** - Workflow runs automatically
2. **Check Actions tab** - Monitor build progress
3. **Download artifacts** - Test the .exe on Windows
4. **Create release tag** - Publish official version
5. **Add code signing** - Remove SmartScreen warnings (optional)

---

## 🔗 Useful Links

- [Tauri Documentation](https://tauri.app/v1/guides/building/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-windows)
- [Rust Toolchain Setup](https://www.rust-lang.org/tools/install)

---

## 💡 Tips

- **Free for public repos** - GitHub Actions is free for open source
- **2,000 minutes/month** - Free tier for private repos
- **Parallel builds** - Add matrix strategy for multiple platforms
- **Auto-updates** - Tauri supports automatic app updates from GitHub Releases
