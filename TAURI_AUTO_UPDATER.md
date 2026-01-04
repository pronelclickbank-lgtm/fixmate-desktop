# Tauri Auto-Updater Setup Guide

This guide explains how to set up automatic updates for your FixMate AI desktop application using Tauri's built-in updater.

---

## 🎯 How It Works

1. **User opens app** → App checks GitHub Releases for new version
2. **Update found** → Dialog shows with "What's New" and download button
3. **User clicks "Update Now"** → Downloads installer in background with progress bar
4. **Download complete** → App automatically restarts with new version

**Zero user friction!** Updates happen seamlessly in the background.

---

## 🔐 Step 1: Generate Signing Keys

Updates must be cryptographically signed to prevent tampering. Generate keys **once** and store securely.

### On Your Local Windows PC:

```bash
# Install Tauri CLI if not already installed
npm install -g @tauri-apps/cli

# Generate signing keys
tauri signer generate -w ~/.tauri/fixmate-ai.key
```

**Output:**
```
Your keypair was generated successfully
Private: C:\Users\YourName\.tauri\fixmate-ai.key (Keep this secret!)
Public: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFCQ0RFRjEyMzQ1Njc4OTAKUndSV...
```

**⚠️ IMPORTANT:**
- **Private key** (`fixmate-ai.key`) - Keep secret! Never commit to Git!
- **Public key** - Add to `tauri.conf.json` (safe to commit)

---

## 🔧 Step 2: Configure Tauri

### Update `src-tauri/tauri.conf.json`:

```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/YOUR_USERNAME/fixmate-ai/releases/latest/download/latest.json"
    ],
    "dialog": true,
    "pubkey": "PASTE_YOUR_PUBLIC_KEY_HERE"
  }
}
```

**Replace:**
- `YOUR_USERNAME` - Your GitHub username
- `PASTE_YOUR_PUBLIC_KEY_HERE` - The public key from Step 1

---

## 🔑 Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

| Secret Name | Value |
|-------------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | Contents of `~/.tauri/fixmate-ai.key` file |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Leave empty (unless you set a password) |

**How to get private key contents:**

```bash
# Windows
type C:\Users\YourName\.tauri\fixmate-ai.key

# macOS/Linux
cat ~/.tauri/fixmate-ai.key
```

Copy the entire output and paste into GitHub secret.

---

## 📦 Step 4: Release a New Version

### Create a Version Tag:

```bash
# Bump version in package.json and tauri.conf.json first
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin v1.0.1
```

### What Happens Automatically:

1. ✅ GitHub Actions builds the .exe
2. ✅ Signs the installer with your private key
3. ✅ Generates `latest.json` manifest
4. ✅ Creates GitHub Release with all files
5. ✅ Users get update notification on next app launch

---

## 🧪 Step 5: Test the Update Flow

### Test Scenario:

1. **Install v1.0.0** on your Windows PC
2. **Release v1.0.1** using the steps above
3. **Open v1.0.0 app** → Update dialog should appear
4. **Click "Update Now"** → Download progress shows
5. **Wait for completion** → App restarts with v1.0.1

---

## 📋 Update Manifest Format

GitHub Actions automatically generates `latest.json`:

```json
{
  "version": "1.0.1",
  "date": "2024-01-15T10:30:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldSV...",
      "url": "https://github.com/YOUR_USERNAME/fixmate-ai/releases/download/v1.0.1/FixMate-AI_1.0.1_x64-setup.exe"
    }
  }
}
```

This file is automatically uploaded to GitHub Releases and checked by the app.

---

## 🎨 Update Dialog UI

The `TauriAutoUpdater` component provides:

- ✅ **Version number** - Shows new version available
- ✅ **Release notes** - Displays "What's New" from GitHub Release
- ✅ **Download progress** - Real-time progress bar (0-100%)
- ✅ **"Later" button** - User can postpone update
- ✅ **"Update Now" button** - Downloads and installs immediately
- ✅ **Auto-restart** - App restarts after installation

---

## 🔄 Update Frequency

**When updates are checked:**
- ✅ On app startup (every time user opens the app)
- ✅ Manual check via Settings → "Check for Updates" button (optional)

**Update behavior:**
- Non-intrusive dialog (user can click "Later")
- Downloads in background (app remains usable)
- Automatic restart after installation

---

## 🛠️ Troubleshooting

### "Update check failed"

**Possible causes:**
1. No internet connection
2. GitHub Releases not accessible
3. `latest.json` file missing from release

**Solution:** Check GitHub Releases page - ensure `latest.json` exists.

### "Signature verification failed"

**Possible causes:**
1. Public key in `tauri.conf.json` doesn't match private key
2. Installer wasn't signed during build
3. GitHub secret `TAURI_SIGNING_PRIVATE_KEY` is incorrect

**Solution:** Regenerate keys and update both `tauri.conf.json` and GitHub secrets.

### "Download failed"

**Possible causes:**
1. Installer file URL is incorrect in `latest.json`
2. File was deleted from GitHub Releases
3. Network issue during download

**Solution:** Verify installer exists at the URL in `latest.json`.

### Update dialog doesn't appear

**Possible causes:**
1. App version in `tauri.conf.json` is same or higher than release
2. `updater.active` is false in `tauri.conf.json`
3. Not running in Tauri (running in browser instead)

**Solution:** 
- Ensure release version is higher than installed version
- Check `tauri.conf.json` has `"active": true`
- Build and run as Tauri app, not web browser

---

## 📊 Version Numbering

Use **Semantic Versioning** (semver):

- **Major** (v2.0.0) - Breaking changes
- **Minor** (v1.1.0) - New features, backward compatible
- **Patch** (v1.0.1) - Bug fixes only

**Update both files:**
1. `package.json` → `"version": "1.0.1"`
2. `src-tauri/tauri.conf.json` → `"version": "1.0.1"`

---

## 🚀 Advanced: Silent Updates

For enterprise deployments, you can skip the dialog and update silently:

```json
{
  "updater": {
    "active": true,
    "dialog": false,  // No user prompt
    "endpoints": ["..."],
    "pubkey": "..."
  }
}
```

**Behavior:** Updates download and install automatically without user interaction.

---

## 📝 Release Checklist

Before releasing a new version:

- [ ] Bump version in `package.json`
- [ ] Bump version in `src-tauri/tauri.conf.json`
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Commit changes: `git commit -m "Release vX.X.X"`
- [ ] Create tag: `git tag vX.X.X`
- [ ] Push tag: `git push origin vX.X.X`
- [ ] Wait for GitHub Actions to complete (~5-8 minutes)
- [ ] Verify `latest.json` exists in GitHub Release
- [ ] Test update on older version

---

## 🔗 Useful Links

- [Tauri Updater Documentation](https://v2.tauri.app/plugin/updater/)
- [Tauri Signer CLI](https://v2.tauri.app/reference/cli/#signer)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)

---

## 💡 Tips

1. **Test updates frequently** - Don't wait until production to test
2. **Keep private key secure** - Store in password manager, never commit
3. **Backup private key** - Losing it means regenerating and redistributing app
4. **Write clear release notes** - Users see them in update dialog
5. **Monitor GitHub Actions** - Ensure builds succeed before announcing updates
6. **Use pre-releases** - Test with beta users before stable release

---

## 🎯 Next Steps

1. ✅ Generate signing keys
2. ✅ Add public key to `tauri.conf.json`
3. ✅ Add private key to GitHub secrets
4. ✅ Create first release (v1.0.0)
5. ✅ Bump version and release v1.0.1
6. ✅ Test update flow

**Your app now updates automatically!** 🚀
