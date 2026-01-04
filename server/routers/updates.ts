import { publicProcedure, router } from "../_core/trpc";
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

// Read current version from version.json
function getCurrentVersion() {
  try {
    const versionPath = join(process.cwd(), "version.json");
    const versionData = JSON.parse(readFileSync(versionPath, "utf-8"));
    return versionData;
  } catch (error) {
    console.error("Error reading version.json:", error);
    return {
      version: "1.0.0",
      releaseDate: new Date().toISOString().split("T")[0],
      releaseNotes: "Initial release",
    };
  }
}

// Compare semantic versions (e.g., "1.2.3" vs "1.2.4")
function compareVersions(current: string, latest: string): number {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return 1; // Update available
    if (latestPart < currentPart) return -1; // Current is newer
  }

  return 0; // Same version
}

export const updatesRouter = router({
  // Public endpoint to get latest version info (for update checking)
  getLatestVersion: publicProcedure.query(() => {
    // This endpoint serves the latest version information
    // Update this when releasing new versions
    return {
      version: "1.0.0",
      releaseDate: "2025-12-26",
      releaseNotes: "Initial release of PC Doctor - System optimization and troubleshooting tool",
      downloadUrl: "https://github.com/your-repo/pc-doctor/releases/latest/download/pc-doctor-setup.exe",
      minVersion: "1.0.0", // Minimum supported version
      critical: false, // Whether this is a critical security update
    };
  }),

  // Get current version
  getCurrentVersion: publicProcedure.query(() => {
    return getCurrentVersion();
  }),

  // Check for updates
  checkForUpdates: publicProcedure
    .input(
      z.object({
        currentVersion: z.string(),
      })
    )
    .query(async ({ input }) => {
      // In a real app, this would fetch from a remote server
      // For now, we'll simulate checking against a "latest" version
      const currentVersionData = getCurrentVersion();
      
      // Simulate remote version check
      // In production, you would fetch from: https://your-domain.com/api/latest-version.json
      const latestVersion = {
        version: "1.0.0", // This would come from remote server
        releaseDate: "2025-12-26",
        releaseNotes: "Initial release",
        downloadUrl: "https://your-domain.com/downloads/pc-doctor-latest.exe",
      };

      const comparison = compareVersions(input.currentVersion, latestVersion.version);

      return {
        hasUpdate: comparison > 0,
        currentVersion: input.currentVersion,
        latestVersion: latestVersion.version,
        releaseDate: latestVersion.releaseDate,
        releaseNotes: latestVersion.releaseNotes,
        downloadUrl: latestVersion.downloadUrl,
      };
    }),
});
