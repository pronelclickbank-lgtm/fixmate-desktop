import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, CheckCircle2, XCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LicenseSettings() {
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);

  const activateMutation = trpc.adminDashboard.activateLicense.useMutation({
    onSuccess: (data) => {
      setLicenseStatus(data);
      toast({
        title: "License Activated",
        description: "Your license has been successfully activated!",
      });
      setLicenseKey("");
    },
    onError: (error) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Invalid license key or activation failed",
        variant: "destructive",
      });
    },
  });

  // Generate device ID on mount
  useEffect(() => {
    const generateDeviceId = () => {
      // In a real desktop app, this would use hardware identifiers
      // For now, generate a unique ID based on browser fingerprint
      const nav = navigator as any;
      const screen = window.screen;
      const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
      ].join("|");

      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }

      const deviceId = `DEVICE-${Math.abs(hash).toString(16).toUpperCase()}`;
      setDeviceId(deviceId);
    };

    generateDeviceId();
  }, []);

  const handleActivate = () => {
    if (!licenseKey.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a license key",
        variant: "destructive",
      });
      return;
    }

    // Get user email from context (you'll need to implement this)
    const userEmail = "user@example.com"; // Replace with actual user email from auth context

    activateMutation.mutate({
      licenseKey: licenseKey.trim(),
      deviceId,
      userEmail,
    });
  };

  const copyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Device ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLicenseKey = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    // Split into groups of 4
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join("-");
  };

  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    if (formatted.length <= 24) {
      // Max length: XXXX-XXXX-XXXX-XXXX-XXXX (24 chars)
      setLicenseKey(formatted);
    }
  };

  const getLicenseStatusBadge = () => {
    if (!licenseStatus) return null;

    const { isValid, daysRemaining } = licenseStatus;

    if (!isValid) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-500">
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">License Settings</h1>
        <p className="text-muted-foreground">
          Manage your FixMate AI license and subscription
        </p>
      </div>

      <div className="grid gap-6">
        {/* Device ID Card */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>
              Your unique device identifier for license activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="deviceId" className="text-sm font-medium mb-2 block">
                  Device ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="deviceId"
                    value={deviceId}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyDeviceId}
                    title="Copy Device ID"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You'll need this Device ID when purchasing or activating a license
            </p>
          </CardContent>
        </Card>

        {/* License Activation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Activate License
            </CardTitle>
            <CardDescription>
              Enter your license key to activate FixMate AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="licenseKey" className="text-sm font-medium mb-2 block">
                License Key
              </Label>
              <Input
                id="licenseKey"
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={handleLicenseKeyChange}
                className="font-mono text-sm"
                disabled={activateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format: XXXX-XXXX-XXXX-XXXX-XXXX (20 characters)
              </p>
            </div>

            <Button
              onClick={handleActivate}
              disabled={activateMutation.isPending || licenseKey.length < 19}
              className="w-full"
            >
              {activateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Activate License
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* License Status Card */}
        {licenseStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>License Status</span>
                {getLicenseStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">License Type</Label>
                  <p className="text-lg font-medium capitalize">
                    {licenseStatus.subscriptionPeriod || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Days Remaining</Label>
                  <p className="text-lg font-medium">
                    {licenseStatus.daysRemaining || 0} days
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expiration Date</Label>
                  <p className="text-lg font-medium">
                    {licenseStatus.expirationDate
                      ? new Date(licenseStatus.expirationDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="text-lg font-medium">
                    {licenseStatus.isValid ? "Active" : "Expired"}
                  </p>
                </div>
              </div>

              {licenseStatus.daysRemaining <= 7 && licenseStatus.isValid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your license will expire in {licenseStatus.daysRemaining} days. Please renew to
                    continue using FixMate AI.
                  </AlertDescription>
                </Alert>
              )}

              {!licenseStatus.isValid && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your license has expired. Please purchase a new license to continue using
                    FixMate AI.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Purchase a license from our website using your Device ID
            </p>
            <p>
              • Enter the license key you received via email
            </p>
            <p>
              • Contact support if you encounter any issues
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
