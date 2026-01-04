# Auto-Updater Quick Start (5 Minutes)

Get automatic updates working in 5 simple steps.

---

## Step 1: Generate Keys (1 minute)

```bash
# On your Windows PC
npm install -g @tauri-apps/cli
tauri signer generate -w ~/.tauri/fixmate-ai.key
```

**Output:**
```
Private: C:\Users\YourName\.tauri\fixmate-ai.key
Public: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6...
```

**Save both!** You'll need them in the next steps.

---

## Step 2: Add Public Key (30 seconds)

Edit `src-tauri/tauri.conf.json`:

```json
{
  "updater": {
    "pubkey": "PASTE_YOUR_PUBLIC_KEY_HERE"
  }
}
```

Replace `YOUR_USERNAME` in the `endpoints` URL with your GitHub username.

---

## Step 3: Add GitHub Secrets (1 minute)

1. Go to: `https://github.com/YOUR_USERNAME/fixmate-ai/settings/secrets/actions`
2. Click **New repository secret**
3. Add secret:
   - **Name:** `TAURI_SIGNING_PRIVATE_KEY`
   - **Value:** Contents of `~/.tauri/fixmate-ai.key` file

```bash
# Get private key contents:
type C:\Users\YourName\.tauri\fixmate-ai.key
```

4. Add second secret:
   - **Name:** `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - **Value:** Leave empty

---

## Step 4: Push to GitHub (1 minute)

```bash
git add .
git commit -m "Add auto-updater"
git push origin main
```

---

## Step 5: Create First Release (1 minute)

```bash
# Make sure version is 1.0.0 in both:
# - package.json
# - src-tauri/tauri.conf.json

git tag v1.0.0
git push origin v1.0.0
```

**Done!** GitHub Actions will build and create the release.

---

## Testing Updates

### Release v1.0.1:

1. **Bump version** in `package.json` and `tauri.conf.json` to `1.0.1`
2. **Commit:** `git commit -m "Release v1.0.1"`
3. **Tag:** `git tag v1.0.1`
4. **Push:** `git push origin v1.0.1`

### Test:

1. Install v1.0.0 on Windows
2. Open the app
3. **Update dialog appears!** 🎉
4. Click "Update Now"
5. App downloads and restarts with v1.0.1

---

## What Users See

**Update Dialog:**
- ✅ "Update Available: v1.0.1"
- ✅ Release notes (from GitHub)
- ✅ Download progress bar
- ✅ "Later" or "Update Now" buttons

**After clicking "Update Now":**
- ✅ Downloads in background
- ✅ Progress: 0% → 100%
- ✅ "Restarting application..."
- ✅ App reopens with new version

---

## Troubleshooting

### "Signature verification failed"

**Fix:** Public key in `tauri.conf.json` doesn't match private key in GitHub secrets.

**Solution:** Regenerate keys and update both places.

### Update dialog doesn't appear

**Fix:** Release version must be **higher** than installed version.

**Solution:** Check versions in `package.json` and `tauri.conf.json`.

### "latest.json not found"

**Fix:** GitHub Actions didn't complete successfully.

**Solution:** Check Actions tab for errors.

---

## Full Documentation

See `TAURI_AUTO_UPDATER.md` for:
- Detailed troubleshooting
- Silent updates
- Version numbering best practices
- Security considerations

---

**That's it!** Your app now updates automatically. 🚀
