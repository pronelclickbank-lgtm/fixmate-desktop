import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  Power, 
  HardDrive, 
  Bell, 
  Save,
  Zap,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export default function AutomaticPage() {
  const { toast } = useToast();
  
  // Fetch current settings
  const { data: settings, refetch } = trpc.automatic.getSettings.useQuery();
  
  // Local state
  const [scheduleEnabled, setScheduleEnabled] = useState(settings?.scheduleEnabled ?? false);
  const [scheduleFrequency, setScheduleFrequency] = useState(settings?.scheduleFrequency ?? 'weekly');
  const [optimizeOnStartup, setOptimizeOnStartup] = useState(settings?.optimizeOnStartup ?? false);
  const [lowDiskSpaceEnabled, setLowDiskSpaceEnabled] = useState(settings?.lowDiskSpaceEnabled ?? false);
  const [diskSpaceThreshold, setDiskSpaceThreshold] = useState(settings?.diskSpaceThreshold ?? 10);
  const [autoBackup, setAutoBackup] = useState(settings?.autoBackup ?? true);
  const [optimizationProfile, setOptimizationProfile] = useState(settings?.optimizationProfile ?? 'balanced');
  
  // Save settings mutation
  const saveSettingsMutation = trpc.automatic.saveSettings.useMutation({
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Automatic optimization settings have been updated successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    saveSettingsMutation.mutate({
      scheduleEnabled,
      scheduleFrequency,
      optimizeOnStartup,
      lowDiskSpaceEnabled,
      diskSpaceThreshold,
      autoBackup,
      optimizationProfile,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Automatic Optimization
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure automatic cleaning and optimization schedules to keep your system running smoothly.
        </p>
      </div>

      {/* Scheduled Optimization */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Clock className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Scheduled Cleaning</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically run system optimization at regular intervals
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-enabled" className="text-base">Enable scheduled optimization</Label>
              <Switch
                id="schedule-enabled"
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </div>
            
            {scheduleEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-500/30">
                <Label className="text-sm text-muted-foreground">Frequency</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <Button
                      key={freq}
                      variant={scheduleFrequency === freq ? 'default' : 'outline'}
                      onClick={() => setScheduleFrequency(freq)}
                      className="capitalize"
                    >
                      {freq}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Optimize on Startup */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Power className="h-6 w-6 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Optimize on Startup</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Run quick optimization when Windows starts
                </p>
              </div>
              <Switch
                id="optimize-startup"
                checked={optimizeOnStartup}
                onCheckedChange={setOptimizeOnStartup}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Low Disk Space Auto-Cleanup */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <HardDrive className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Low Disk Space Alert</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically clean when disk space is low
                </p>
              </div>
              <Switch
                id="low-disk-enabled"
                checked={lowDiskSpaceEnabled}
                onCheckedChange={setLowDiskSpaceEnabled}
              />
            </div>
            
            {lowDiskSpaceEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-orange-500/30">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Trigger when free space is below
                  </Label>
                  <span className="text-lg font-semibold text-orange-400">
                    {diskSpaceThreshold}%
                  </span>
                </div>
                <Slider
                  value={[diskSpaceThreshold]}
                  onValueChange={(value) => setDiskSpaceThreshold(value[0])}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 10-15% for optimal performance
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Optimization Profile */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Zap className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Optimization Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose how aggressive automatic optimization should be
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={optimizationProfile === 'quick' ? 'default' : 'outline'}
                onClick={() => setOptimizationProfile('quick')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Zap className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">Quick</div>
                  <div className="text-xs text-muted-foreground">~2 min</div>
                </div>
              </Button>
              
              <Button
                variant={optimizationProfile === 'balanced' ? 'default' : 'outline'}
                onClick={() => setOptimizationProfile('balanced')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Shield className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">Balanced</div>
                  <div className="text-xs text-muted-foreground">~5 min</div>
                </div>
              </Button>
              
              <Button
                variant={optimizationProfile === 'deep' ? 'default' : 'outline'}
                onClick={() => setOptimizationProfile('deep')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <SettingsIcon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">Deep</div>
                  <div className="text-xs text-muted-foreground">~10 min</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Auto Backup */}
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Automatic Backup</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create system restore point before optimization
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
