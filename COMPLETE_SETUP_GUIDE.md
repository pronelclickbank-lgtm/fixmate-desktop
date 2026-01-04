# Complete Setup Guide: From ZIP to Working .exe

This guide walks you through **everything** from downloading the ZIP file to getting your Windows .exe with automatic updates.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Windows PC** (for building and testing)
- ✅ **GitHub account** (free)
- ✅ **Git installed** ([download here](https://git-scm.com/downloads))
- ✅ **Node.js 22+** ([download here](https://nodejs.org/))
- ✅ **Rust** ([download here](https://rustup.rs/))

---

## 🚀 Step-by-Step Instructions

### Step 1: Extract ZIP File (30 seconds)

1. **Extract** the downloaded `pc-doctor.zip` file
2. **Open folder** in File Explorer
3. You should see files like:
   - `package.json`
   - `src-tauri/` folder
   - `client/` folder
   - `.github/` folder
   - Various `.md` documentation files

---

### Step 2: Install Dependencies (2-3 minutes)

Open **Command Prompt** or **PowerShell** in the project folder:

```bash
# Navigate to project folder
cd C:\Users\YourName\Downloads\pc-doctor

# Install pnpm (package manager)
npm install -g pnpm

# Install project dependencies
pnpm install
```

**Wait for installation to complete** (~2-3 minutes, downloads ~500MB)

---

### Step 3: Test the App Locally (1 minute)

```bash
# Run in development mode
pnpm tauri dev
```

**What happens:**
- ✅ App window opens (FixMate AI interface)
- ✅ You can click around and test features
- ✅ Registration modal appears (this is normal)

**Close the app** when done testing (press X or Ctrl+C in terminal).

---

### Step 4: Create GitHub Repository (2 minutes)

1. Go to [github.com](https://github.com) and log in
2. Click **"New repository"** (green button)
3. **Repository name:** `fixmate-ai`
4. **Visibility:** Public (required for free GitHub Actions)
5. **Do NOT** initialize with README (we already have files)
6. Click **"Create repository"**

---

### Step 5: Push Code to GitHub (2 minutes)

In your project folder terminal:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FixMate AI with Tauri and auto-updater"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fixmate-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Refresh your GitHub repository page** - you should see all files uploaded!

---

### Step 6: Generate Update Signing Keys (2 minutes)

**⚠️ IMPORTANT:** This step is required for auto-updates to work securely.

```bash
# Install Tauri CLI globally
npm install -g @tauri-apps/cli

# Generate signing keys
tauri signer generate -w %USERPROFILE%\.tauri\fixmate-ai.key
```

**Output:**
```
Your keypair was generated successfully
Private: C:\Users\YourName\.tauri\fixmate-ai.key
Public: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFCQ0RFRjEyMzQ1Njc4OTAKUndSV...
```

**Copy both values!** You'll need them in the next steps.

---

### Step 7: Add Public Key to Config (1 minute)

1. **Open** `src-tauri/tauri.conf.json` in a text editor
2. **Find** the line: `"pubkey": "WILL_BE_GENERATED"`
3. **Replace** with your public key from Step 6:
   ```json
   "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFCQ0RFRjEyMzQ1Njc4OTAKUndSV..."
   ```
4. **Find** the line: `"https://github.com/YOUR_USERNAME/fixmate-ai/releases/latest/download/latest.json"`
5. **Replace** `YOUR_USERNAME` with your actual GitHub username
6. **Save** the file

**Commit and push:**
```bash
git add src-tauri/tauri.conf.json
git commit -m "Add update signing public key"
git push
```

---

### Step 8: Add Private Key to GitHub Secrets (2 minutes)

1. Go to: `https://github.com/YOUR_USERNAME/fixmate-ai/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add first secret:
   - **Name:** `TAURI_SIGNING_PRIVATE_KEY`
   - **Value:** Get private key contents:
     ```bash
     type %USERPROFILE%\.tauri\fixmate-ai.key
     ```
   - Copy the entire output and paste into GitHub
4. Click **"Add secret"**
5. Add second secret:
   - **Name:** `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - **Value:** Leave empty (just click "Add secret")

---

### Step 9: Create First Release (2 minutes)

```bash
# Create version tag
git tag v1.0.0

# Push tag to GitHub
git push origin v1.0.0
```

**What happens automatically:**
1. ✅ GitHub Actions starts building (you'll get email notification)
2. ✅ Takes ~5-8 minutes to compile Windows .exe
3. ✅ Creates GitHub Release with installers
4. ✅ Generates `latest.json` for auto-updates

---

### Step 10: Download Your .exe (1 minute)

**Option A: From GitHub Releases (Recommended)**

1. Go to: `https://github.com/YOUR_USERNAME/fixmate-ai/releases`
2. Click on **"v1.0.0"** release
3. Download one of:
   - `fixmate-ai.exe` - Standalone executable (~8-15 MB)
   - `FixMate-AI_1.0.0_x64.msi` - MSI installer
   - `FixMate-AI_1.0.0_x64-setup.exe` - NSIS installer (recommended)

**Option B: From Actions Tab**

1. Go to: `https://github.com/YOUR_USERNAME/fixmate-ai/actions`
2. Click on the latest workflow run
3. Scroll to **Artifacts** section
4. Download `fixmate-ai-windows-installer.zip`

---

### Step 11: Install and Test (1 minute)

1. **Run** the downloaded installer
2. **Install** FixMate AI (default location: `C:\Users\YourName\AppData\Local\FixMate AI\`)
3. **Launch** the app from Start Menu or Desktop shortcut
4. **Test** features:
   - ✅ Registration modal appears
   - ✅ Dashboard loads with optimization cards
   - ✅ AI Assistant works
   - ✅ Settings page accessible

---

### Step 12: Test Auto-Updates (5 minutes)

Now let's test that updates work automatically!

#### A. Bump Version

1. **Edit** `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. **Edit** `src-tauri/tauri.conf.json`:
   ```json
   "version": "1.0.1"
   ```

3. **Edit** `CHANGELOG.md` (optional):
   ```markdown
   ## v1.0.1 - 2024-01-15
   - Fixed bug in optimization
   - Improved UI performance
   ```

#### B. Release v1.0.1

```bash
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin v1.0.1
```

#### C. Test Update

1. **Keep v1.0.0 installed** on your PC
2. **Wait** for GitHub Actions to finish building v1.0.1 (~5-8 minutes)
3. **Open** FixMate AI v1.0.0
4. **Update dialog should appear!** 🎉
   - Shows "Update Available: v1.0.1"
   - Shows release notes
   - Shows "Later" and "Update Now" buttons
5. **Click "Update Now"**
6. **Watch** download progress (0% → 100%)
7. **App restarts** automatically with v1.0.1

**Success!** Your app now updates automatically. ✅

---

## 🎯 What You've Accomplished

✅ **Built Windows .exe** from web app  
✅ **Set up GitHub Actions** for automatic builds  
✅ **Configured auto-updates** with signing  
✅ **Tested complete update flow**  
✅ **Ready for distribution** to users  

---

## 📦 Distribution Options

### Option 1: Direct Download (Simple)

Share the GitHub Releases link:
```
https://github.com/YOUR_USERNAME/fixmate-ai/releases/latest
```

Users download and install the .exe directly.

### Option 2: Website Download (Professional)

Create a simple landing page:
```html
<a href="https://github.com/YOUR_USERNAME/fixmate-ai/releases/latest/download/FixMate-AI_1.0.0_x64-setup.exe">
  Download FixMate AI
</a>
```

### Option 3: Microsoft Store (Advanced)

Submit to Microsoft Store for wider distribution (requires $19 developer account).

---

## 🔄 Releasing Updates

Every time you want to release an update:

1. **Bump version** in `package.json` and `tauri.conf.json`
2. **Commit changes:** `git commit -m "Release vX.X.X"`
3. **Create tag:** `git tag vX.X.X`
4. **Push:** `git push origin vX.X.X`
5. **Wait 5-8 minutes** for GitHub Actions
6. **Users get update automatically** on next app launch!

---

## 🐛 Troubleshooting

### "GitHub Actions build failed"

**Check the error logs:**
1. Go to Actions tab
2. Click on failed workflow
3. Read error message

**Common issues:**
- Missing GitHub secrets (Step 8)
- Incorrect public key in `tauri.conf.json` (Step 7)
- Rust not installed on GitHub runner (workflow should handle this)

### "Update dialog doesn't appear"

**Checklist:**
- ✅ Public key in `tauri.conf.json` matches private key in GitHub secrets
- ✅ `latest.json` exists in GitHub Release
- ✅ New version number is **higher** than installed version
- ✅ GitHub username in `endpoints` URL is correct

### "Signature verification failed"

**Solution:** Regenerate keys and update both:
1. `tauri.conf.json` (public key)
2. GitHub secrets (private key)

---

## 📚 Additional Resources

- `AUTO_UPDATER_QUICK_START.md` - Quick reference for updates
- `TAURI_AUTO_UPDATER.md` - Detailed auto-updater docs
- `GITHUB_ACTIONS_BUILD.md` - CI/CD pipeline details
- `QUICK_START_GITHUB_ACTIONS.md` - GitHub Actions reference

---

## 💡 Pro Tips

1. **Test locally first** - Always run `pnpm tauri dev` before releasing
2. **Use semantic versioning** - Major.Minor.Patch (e.g., 1.2.3)
3. **Write release notes** - Users see them in update dialog
4. **Keep private key secure** - Store in password manager
5. **Monitor GitHub Actions** - Get email notifications for build status

---

## 🎉 You're Done!

Your FixMate AI app is now:
- ✅ Built as native Windows .exe
- ✅ Automatically built on GitHub
- ✅ Auto-updating for users
- ✅ Ready for distribution

**Next:** Share your app with users and collect feedback! 🚀
