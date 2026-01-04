import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Key, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storeLicenseKey, getTrialStatus, getUserInfo } from "@/lib/trialTracking";

interface LicenseActivationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LicenseActivationModal({ open, onClose, onSuccess }: LicenseActivationModalProps) {
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");

  const validateMutation = trpc.license.validateLicense.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Store license key locally
        storeLicenseKey(licenseKey);
        
        toast({
          title: "License Activated!",
          description: "All features have been unlocked. Enjoy FixMate AI Pro!",
        });
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.message);
        toast({
          title: "Activation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (err) => {
      setError(err.message || "Failed to validate license");
      toast({
        title: "Activation Failed",
        description: err.message || "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!licenseKey.trim()) {
      setError("Please enter a license key");
      return;
    }

    // Get device ID and user info
    const deviceId = getDeviceId();
    const userInfo = getUserInfo();
    const trialStatus = getTrialStatus();

    validateMutation.mutate({
      licenseKey: licenseKey.trim().toUpperCase(),
      deviceId,
      userEmail: userInfo.email || undefined,
      userName: userInfo.name || undefined,
      installationDate: trialStatus.installationDate?.toISOString() || new Date().toISOString(),
    });
  };

  const handleInputChange = (value: string) => {
    // Auto-format license key with dashes
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Add dashes after every 4 characters
    const parts = [];
    for (let i = 0; i < formatted.length; i += 4) {
      parts.push(formatted.slice(i, i + 4));
    }
    
    setLicenseKey(parts.join("-"));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Key className="h-6 w-6 text-primary" />
            Activate License
          </DialogTitle>
          <DialogDescription className="text-base">
            Enter your license key to unlock all premium features
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* License Key Field */}
          <div className="space-y-2">
            <Label htmlFor="licenseKey" className="text-sm font-medium">
              License Key
            </Label>
            <Input
              id="licenseKey"
              placeholder="FMAI-XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={validateMutation.isPending}
              className={error ? "border-destructive" : ""}
              maxLength={24} // FMAI-XXXX-XXXX-XXXX-XXXX = 24 chars
            />
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <X className="h-3 w-3" />
                {error}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the license key you received after purchase
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={validateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={validateMutation.isPending || !licenseKey.trim()}
            >
              {validateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Don't have a license key?</p>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => {
                // TODO: Open purchase page
                window.open("https://fixmate.ai/purchase", "_blank");
              }}
            >
              Purchase License →
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Generate a unique device ID based on browser fingerprint
 */
function getDeviceId(): string {
  // Check if we already have a device ID
  let deviceId = localStorage.getItem("fixmate_device_id");
  
  if (!deviceId) {
    // Generate a new device ID based on browser/system info
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join("|");
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    deviceId = `DEVICE-${Math.abs(hash).toString(16).toUpperCase()}`;
    localStorage.setItem("fixmate_device_id", deviceId);
  }
  
  return deviceId;
}
