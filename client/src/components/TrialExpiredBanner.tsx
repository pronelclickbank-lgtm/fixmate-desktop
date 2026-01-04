import { useState } from "react";
import { AlertCircle, X, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LicenseActivationModal } from "./LicenseActivationModal";
import { getTrialStatus } from "@/lib/trialTracking";

export function TrialExpiredBanner() {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const trialStatus = getTrialStatus();

  // Don't show if trial is active or has license
  if (trialStatus.isTrialActive || trialStatus.hasLicense || dismissed) {
    return null;
  }

  const handleLicenseSuccess = () => {
    // Reload page to update trial status
    window.location.reload();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold text-lg">Your 6-Month Trial Has Expired</p>
            <p className="text-sm text-white/90">
              Upgrade to FixMate AI Pro to continue using all optimization features
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowLicenseModal(true)}
            size="lg"
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold"
          >
            <Key className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <LicenseActivationModal
        open={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onSuccess={handleLicenseSuccess}
      />
    </>
  );
}
