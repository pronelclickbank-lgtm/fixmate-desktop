/**
 * Admin Dashboard API Client
 * Connects to external admin dashboard for user management, licensing, and analytics
 */

const ADMIN_DASHBOARD_URL = "https://pcdoctor-dash-gkqdsdzm.manus.space/api/trpc";

interface RegisterUserInput {
  email: string;
  username?: string;
  phone?: string;
  planType?: string;
}

interface ActivateLicenseInput {
  licenseKey: string;
  deviceId: string;
  userEmail: string;
}

interface TrackUsageInput {
  userEmail: string;
  action: string;
  metadata?: Record<string, any>;
}

/**
 * Register a new user in the admin dashboard
 */
export async function registerUser(input: RegisterUserInput) {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.registerUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          email: input.email,
          username: input.username || input.email.split("@")[0],
          phone: input.phone,
          planType: input.planType || "free",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data?.json || data;
  } catch (error) {
    console.error("[Admin Dashboard] Registration error:", error);
    throw error;
  }
}

/**
 * Activate a license key
 */
export async function activateLicense(input: ActivateLicenseInput) {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.activateLicense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          licenseKey: input.licenseKey,
          deviceId: input.deviceId,
          userEmail: input.userEmail,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`License activation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data?.json || data;
  } catch (error) {
    console.error("[Admin Dashboard] License activation error:", error);
    throw error;
  }
}

/**
 * Track user usage/activity
 */
export async function trackUsage(input: TrackUsageInput) {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.trackUsage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          userEmail: input.userEmail,
          action: input.action,
          metadata: input.metadata || {},
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[Admin Dashboard] Usage tracking failed: ${response.statusText}`);
      return { success: false };
    }

    const data = await response.json();
    return data.result?.data?.json || { success: true };
  } catch (error) {
    console.warn("[Admin Dashboard] Usage tracking error:", error);
    // Don't throw - usage tracking failures shouldn't break the app
    return { success: false };
  }
}

/**
 * Get feature flags from admin dashboard
 */
export async function getFeatureFlags() {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.getFeatureFlags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feature flags: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data?.json || [];
  } catch (error) {
    console.error("[Admin Dashboard] Feature flags error:", error);
    return [];
  }
}

/**
 * Check for app updates
 */
export async function checkForUpdates(currentVersion: string) {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.checkUpdates?input=${encodeURIComponent(JSON.stringify({ json: { currentVersion } }))}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Update check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data?.json || { updateAvailable: false };
  } catch (error) {
    console.error("[Admin Dashboard] Update check error:", error);
    return { updateAvailable: false };
  }
}

/**
 * Get user notifications
 */
export async function getNotifications(userEmail: string) {
  try {
    const response = await fetch(`${ADMIN_DASHBOARD_URL}/api.getNotifications?input=${encodeURIComponent(JSON.stringify({ json: { userEmail } }))}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data?.json || [];
  } catch (error) {
    console.error("[Admin Dashboard] Notifications error:", error);
    return [];
  }
}
