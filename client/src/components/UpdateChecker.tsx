import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, RefreshCw } from "lucide-react";

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string;
  downloadUrl: string;
}

export function UpdateChecker({ checkOnMount = true }: { checkOnMount?: boolean }) {
  const [showDialog, setShowDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { data: currentVersionData } = trpc.updates.getCurrentVersion.useQuery();

  const handleCheckForUpdates = async () => {
    if (!currentVersionData) return;

    setIsChecking(true);
    try {
      // Fetch latest version from remote endpoint
      const latestVersionData = await trpc.updates.getLatestVersion.query();
      
      // Compare versions
      const hasUpdate = latestVersionData.version !== currentVersionData.version;
      
      const result: UpdateInfo = {
        hasUpdate,
        currentVersion: currentVersionData.version,
        latestVersion: latestVersionData.version,
        releaseDate: latestVersionData.releaseDate,
        releaseNotes: latestVersionData.releaseNotes,
        downloadUrl: latestVersionData.downloadUrl,
      };

      setUpdateInfo(result);
      if (result.hasUpdate) {
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (checkOnMount && currentVersionData) {
      // Check for updates on mount (app startup)
      handleCheckForUpdates();
    }
  }, [checkOnMount, currentVersionData]);

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, "_blank");
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCheckForUpdates}
        disabled={isChecking || !currentVersionData}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        Check for Updates
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Update Available
            </DialogTitle>
            <DialogDescription>
              A new version of PC Doctor is available!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Current Version</p>
                <p className="text-lg font-semibold">{updateInfo?.currentVersion}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Latest Version</p>
                <p className="text-lg font-semibold text-primary">{updateInfo?.latestVersion}</p>
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground mb-2">Release Date</p>
              <p>{updateInfo?.releaseDate}</p>
            </div>

            <div>
              <p className="font-medium text-muted-foreground mb-2">What's New</p>
              <p className="text-sm">{updateInfo?.releaseNotes}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Later
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
