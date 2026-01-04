import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpdateInfo {
  version: string;
  date: string;
  body: string;
}

export function TauriAutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState(false);

  // Check for updates on mount
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Check if running in Tauri
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        console.log('Not running in Tauri, skipping update check');
        return;
      }

      const { checkUpdate } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await checkUpdate();
      
      if (update?.available) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version,
          date: update.date || new Date().toISOString(),
          body: update.body || 'New version available'
        });
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    }
  };

  const downloadAndInstall = async () => {
    try {
      setDownloading(true);
      setError(null);

      const { checkUpdate } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await checkUpdate();
      
      if (!update?.available) {
        setError('No update available');
        setDownloading(false);
        return;
      }

      // Download with progress tracking
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            setDownloadProgress(0);
            break;
          case 'Progress':
            if (event.data.contentLength) {
              const progress = (event.data.chunkLength / event.data.contentLength) * 100;
              setDownloadProgress(Math.round(progress));
            }
            break;
          case 'Finished':
            setDownloadProgress(100);
            setInstalled(true);
            break;
        }
      });

      // Relaunch app after 2 seconds
      setTimeout(async () => {
        await relaunch();
      }, 2000);

    } catch (err) {
      console.error('Failed to download update:', err);
      setError(err instanceof Error ? err.message : 'Failed to download update');
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      setUpdateAvailable(false);
      setUpdateInfo(null);
      setError(null);
    }
  };

  if (!updateAvailable && !error) {
    return null;
  }

  return (
    <Dialog open={updateAvailable || !!error} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {installed ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Update Installed
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                Update Error
              </>
            ) : (
              <>
                <Download className="h-5 w-5 text-blue-500" />
                Update Available
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {installed ? (
              'The update has been installed successfully. The app will restart in a moment.'
            ) : error ? (
              error
            ) : updateInfo ? (
              <>
                A new version <span className="font-semibold text-foreground">{updateInfo.version}</span> is available.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {!error && !installed && updateInfo && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">What's New</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {updateInfo.body}
              </div>
            </div>

            {downloading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Downloading update...</span>
                  <span className="font-medium">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {installed ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Restarting application...
            </div>
          ) : error ? (
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={handleClose} variant="outline" disabled={downloading}>
                Later
              </Button>
              <Button onClick={downloadAndInstall} disabled={downloading}>
                {downloading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Update Now
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
