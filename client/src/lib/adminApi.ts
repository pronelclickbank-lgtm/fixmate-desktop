/**
 * Admin Dashboard API Client
 * Connects PC Doctor app with the standalone admin dashboard
 * Base URL: https://pcdoctor-dash-gkqdsdzm.manus.space
 */

const ADMIN_API_BASE_URL = "https://pcdoctor-dash-gkqdsdzm.manus.space/api/trpc";

export interface LicenseActivationResult {
  success: boolean;
  expirationDate?: string;
  daysRemaining?: number;
}

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  releaseType: string;
  changelog: string;
  downloadUrl: string;
  fileSize: number;
  isMandatory: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  redirectUrl?: string;
  createdAt: string;
}

export interface FeatureFlag {
  flagKey: string;
  flagName: string;
  isEnabled: boolean;
  rolloutPct: number;
}

interface TrpcResponse<T> {
  result: {
    data: T;
  };
}

/**
 * Register user in admin dashboard
 */
export async function registerUser(
  email: string,
  username: string,
  phone?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users.register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        phone,
        plan_type: "free",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to register user:", error);
    return false;
  }
}

/**
 * Activate license key
 */
export async function activateLicense(
  licenseKey: string,
  deviceId: string,
  userEmail: string
): Promise<LicenseActivationResult> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/licenses.activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey,
        deviceId,
        userEmail,
      }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const data: TrpcResponse<LicenseActivationResult> = await response.json();
    return data.result.data;
  } catch (error) {
    console.error("Failed to activate license:", error);
    return { success: false };
  }
}

/**
 * Check for app updates
 */
export async function checkForUpdates(
  currentVersion: string
): Promise<UpdateInfo | null> {
  try {
    const input = encodeURIComponent(
      JSON.stringify({ json: { currentVersion } })
    );
    const response = await fetch(
      `${ADMIN_API_BASE_URL}/appUpdates.getLatest?input=${input}`
    );

    if (!response.ok) {
      return null;
    }

    const data: TrpcResponse<UpdateInfo> = await response.json();
    return data.result.data;
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return null;
  }
}

/**
 * Fetch notifications for user
 */
export async function getNotifications(
  userEmail: string
): Promise<Notification[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { userEmail } }));
    const response = await fetch(
      `${ADMIN_API_BASE_URL}/notifications.getForUser?input=${input}`
    );

    if (!response.ok) {
      return [];
    }

    const data: TrpcResponse<Notification[]> = await response.json();
    return data.result.data;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

/**
 * Get all feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/featureFlags.getAll`);

    if (!response.ok) {
      return [];
    }

    const data: TrpcResponse<FeatureFlag[]> = await response.json();
    return data.result.data;
  } catch (error) {
    console.error("Failed to fetch feature flags:", error);
    return [];
  }
}

/**
 * Track usage increment
 */
export async function trackUsage(userEmail: string): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users.incrementUsage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to track usage:", error);
    return false;
  }
}
