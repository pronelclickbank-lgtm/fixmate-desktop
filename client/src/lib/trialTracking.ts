/**
 * Trial Tracking System
 * Manages 6-month trial period and 4-hour registration reminders
 */

const STORAGE_KEYS = {
  INSTALLATION_DATE: 'fixmate_installation_date',
  LAST_REGISTRATION_PROMPT: 'fixmate_last_registration_prompt',
  REGISTERED: 'fixmate_registered',
  LICENSE_KEY: 'fixmate_license_key',
  USER_EMAIL: 'fixmate_user_email',
  USER_NAME: 'fixmate_user_name',
  USER_PHONE: 'fixmate_user_phone',
};

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000; // Approximate 6 months

export interface TrialStatus {
  isTrialActive: boolean;
  isRegistered: boolean;
  hasLicense: boolean;
  daysRemaining: number;
  shouldShowRegistrationPrompt: boolean;
  installationDate: Date | null;
}

/**
 * Initialize trial tracking on first app launch
 */
export function initializeTrialTracking(): void {
  const installationDate = localStorage.getItem(STORAGE_KEYS.INSTALLATION_DATE);
  
  if (!installationDate) {
    // First time user - set installation date
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.INSTALLATION_DATE, now);
    console.log('[Trial] First launch detected, installation date set:', now);
  }
}

/**
 * Get current trial status
 */
export function getTrialStatus(): TrialStatus {
  const installationDateStr = localStorage.getItem(STORAGE_KEYS.INSTALLATION_DATE);
  const isRegistered = localStorage.getItem(STORAGE_KEYS.REGISTERED) === 'true';
  const hasLicense = !!localStorage.getItem(STORAGE_KEYS.LICENSE_KEY);
  
  if (!installationDateStr) {
    // Should not happen if initializeTrialTracking was called
    return {
      isTrialActive: true,
      isRegistered: false,
      hasLicense: false,
      daysRemaining: 180,
      shouldShowRegistrationPrompt: false,
      installationDate: null,
    };
  }

  const installationDate = new Date(installationDateStr);
  const now = new Date();
  const timeSinceInstallation = now.getTime() - installationDate.getTime();
  const daysElapsed = Math.floor(timeSinceInstallation / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, 180 - daysElapsed);
  
  // Trial is active if less than 6 months OR has license
  const isTrialActive = timeSinceInstallation < SIX_MONTHS_MS || hasLicense;

  return {
    isTrialActive,
    isRegistered,
    hasLicense,
    daysRemaining,
    shouldShowRegistrationPrompt: shouldShowRegistrationPrompt(),
    installationDate,
  };
}

/**
 * Check if registration prompt should be shown (every 4 hours if not registered)
 */
export function shouldShowRegistrationPrompt(): boolean {
  const isRegistered = localStorage.getItem(STORAGE_KEYS.REGISTERED) === 'true';
  
  if (isRegistered) {
    return false; // Already registered, don't show prompt
  }

  const installationDateStr = localStorage.getItem(STORAGE_KEYS.INSTALLATION_DATE);
  const lastPromptStr = localStorage.getItem(STORAGE_KEYS.LAST_REGISTRATION_PROMPT);
  
  if (!installationDateStr) {
    return false; // Not initialized yet
  }

  const installationDate = new Date(installationDateStr);
  const now = new Date();
  const timeSinceInstallation = now.getTime() - installationDate.getTime();

  // Don't show prompt in first 4 hours
  if (timeSinceInstallation < FOUR_HOURS_MS) {
    return false;
  }

  // If never prompted before, show it now
  if (!lastPromptStr) {
    return true;
  }

  // Check if 4 hours passed since last prompt
  const lastPrompt = new Date(lastPromptStr);
  const timeSinceLastPrompt = now.getTime() - lastPrompt.getTime();
  
  return timeSinceLastPrompt >= FOUR_HOURS_MS;
}

/**
 * Mark that registration prompt was shown
 */
export function markRegistrationPromptShown(): void {
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.LAST_REGISTRATION_PROMPT, now);
  console.log('[Trial] Registration prompt shown at:', now);
}

/**
 * Mark user as registered
 */
export function markUserRegistered(name: string, email: string, phone?: string): void {
  localStorage.setItem(STORAGE_KEYS.REGISTERED, 'true');
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
  if (phone) {
    localStorage.setItem(STORAGE_KEYS.USER_PHONE, phone);
  }
  console.log('[Trial] User registered:', email);
}

/**
 * Store license key
 */
export function storeLicenseKey(licenseKey: string): void {
  localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, licenseKey);
  console.log('[Trial] License key stored');
}

/**
 * Get stored license key
 */
export function getLicenseKey(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LICENSE_KEY);
}

/**
 * Check if feature should be locked (after 6 months without license)
 */
export function isFeatureLocked(featureName: string): boolean {
  const status = getTrialStatus();
  
  // If has license, nothing is locked
  if (status.hasLicense) {
    return false;
  }

  // If trial is active (within 6 months), nothing is locked
  if (status.isTrialActive) {
    return false;
  }

  // Trial expired and no license - lock premium features
  const premiumFeatures = [
    'optimize',
    'analyze',
    'clean',
    'extended',
    'automatic',
    'backups',
    'ai-assistant',
  ];

  return premiumFeatures.includes(featureName.toLowerCase());
}

/**
 * Get user info from storage
 */
export function getUserInfo(): { name: string | null; email: string | null; phone: string | null } {
  return {
    name: localStorage.getItem(STORAGE_KEYS.USER_NAME),
    email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL),
    phone: localStorage.getItem(STORAGE_KEYS.USER_PHONE),
  };
}
