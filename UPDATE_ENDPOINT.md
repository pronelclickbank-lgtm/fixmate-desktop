# Update Endpoint Documentation

## Overview
The PC Doctor application includes an automatic update checker that fetches the latest version information from a remote server endpoint.

## Endpoint URL

### Development/Local
```
http://localhost:4173/api/trpc/updates.getLatestVersion
```

### Production (Deployed)
```
https://your-deployed-app.manus.space/api/trpc/updates.getLatestVersion
```

## Endpoint Response Format

The endpoint returns JSON with the following structure:

```json
{
  "version": "1.0.0",
  "releaseDate": "2025-12-26",
  "releaseNotes": "Initial release of PC Doctor - System optimization and troubleshooting tool",
  "downloadUrl": "https://github.com/your-repo/pc-doctor/releases/latest/download/pc-doctor-setup.exe",
  "minVersion": "1.0.0",
  "critical": false
}
```

## Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Latest version number (semantic versioning: MAJOR.MINOR.PATCH) |
| `releaseDate` | string | Release date in YYYY-MM-DD format |
| `releaseNotes` | string | Brief description of changes in this version |
| `downloadUrl` | string | Direct download link to the installer (.exe file) |
| `minVersion` | string | Minimum supported version (users below this must update) |
| `critical` | boolean | Whether this is a critical security update (forces update) |

## How to Update Version Information

When releasing a new version:

1. **Update the version endpoint** in `server/routers/updates.ts`:
   ```typescript
   getLatestVersion: publicProcedure.query(() => {
     return {
       version: "1.1.0", // ← Update this
       releaseDate: "2025-12-27", // ← Update this
       releaseNotes: "Bug fixes and performance improvements", // ← Update this
       downloadUrl: "https://github.com/your-repo/pc-doctor/releases/v1.1.0/download/pc-doctor-setup.exe", // ← Update this
       minVersion: "1.0.0",
       critical: false,
     };
   }),
   ```

2. **Update the local version** in `version.json`:
   ```json
   {
     "version": "1.1.0",
     "buildDate": "2025-12-27"
   }
   ```

3. **Rebuild and redeploy** the application:
   ```bash
   pnpm build
   # Deploy to your hosting platform
   ```

4. **Upload the new installer** to your download server (GitHub Releases, S3, etc.)

## Update Check Flow

1. **App Startup**: UpdateChecker component automatically checks for updates
2. **Manual Check**: User clicks "Check for Updates" in Settings → System Info
3. **Version Comparison**: App compares local version with remote version
4. **Update Dialog**: If newer version exists, shows dialog with release notes
5. **Download**: User clicks "Download Update" to get the new installer

## Testing Update Checker

To test the update checker:

1. **Simulate a new version**:
   - Change `version` in `server/routers/updates.ts` to "1.1.0"
   - Keep `version.json` at "1.0.0"
   - Rebuild: `pnpm build && pnpm start`

2. **Open the app** and navigate to Settings → System Info

3. **Click "Check for Updates"** - should show update dialog

4. **Reset** by changing both versions back to "1.0.0"

## Security Considerations

- The endpoint is **public** (no authentication required) for update checking
- Always use **HTTPS** in production to prevent man-in-the-middle attacks
- Verify **download signatures** before executing installers
- Consider implementing **code signing** for the .exe installer

## Future Enhancements

- [ ] Add automatic download and installation (requires elevated permissions)
- [ ] Implement delta updates (only download changed files)
- [ ] Add rollback functionality for failed updates
- [ ] Support multiple release channels (stable, beta, alpha)
- [ ] Add update scheduling (install on next restart)
