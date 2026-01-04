import { ReactNode, useState } from "react";
import { isFeatureLocked } from "@/lib/trialTracking";
import { LicenseActivationModal } from "./LicenseActivationModal";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureLockProps {
  featureName: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that locks features after trial expires
 * Shows upgrade modal when locked features are clicked
 */
export function FeatureLock({ featureName, children, className }: FeatureLockProps) {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const { toast } = useToast();
  const isLocked = isFeatureLocked(featureName);

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      
      toast({
        title: "Premium Feature",
        description: "This feature requires a license. Your 6-month trial has expired.",
        variant: "default",
      });
      
      setShowLicenseModal(true);
    }
  };

  const handleLicenseSuccess = () => {
    // Reload the page to update feature access
    window.location.reload();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`relative ${className || ""}`}
        onClick={handleClick}
        style={{ cursor: "not-allowed" }}
      >
        {/* Overlay with lock icon */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Premium Feature</p>
            <p className="text-xs text-muted-foreground">Click to upgrade</p>
          </div>
        </div>
        
        {/* Dimmed content */}
        <div className="opacity-30 pointer-events-none">
          {children}
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
