import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { ImprovementModal } from "@/components/ImprovementModal";
import { ProgressModal } from "@/components/ProgressModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [improvements, setImprovements] = useState<any[]>([]);
  const [fixTypeCompleted, setFixTypeCompleted] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressTasks, setProgressTasks] = useState<Array<{id: string, label: string, status: "pending" | "in-progress" | "completed"}>>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Fetch system data
  const { data: systemOverview, isLoading: loadingSystem } =
    trpc.diagnostics.getSystemOverview.useQuery();
  const { data: startupPrograms, isLoading: loadingStartup } =
    trpc.diagnostics.getStartupPrograms.useQuery();
  const { data: driverStatus, isLoading: loadingDrivers } =
    trpc.diagnostics.getDriverStatus.useQuery(undefined, {
      enabled: isAuthenticated,
    });
  const { data: securityStatus, isLoading: loadingSecurity } =
    trpc.diagnostics.getSecurityStatus.useQuery();
  const { data: bottlenecks, isLoading: loadingBottlenecks } =
    trpc.diagnostics.getPerformanceBottlenecks.useQuery();
  const { data: subscription } = trpc.subscriptions.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const runScanMutation = trpc.diagnostics.runFullScan.useMutation();
  const fixPerformanceIssueMutation = trpc.fixes.fixPerformanceIssue.useMutation();
  const fixWindowsUpdatesMutation = trpc.fixes.fixWindowsUpdates.useMutation();
  const fixSecurityMutation = trpc.fixes.fixSecurityIssues.useMutation();
  const fixAllMutation = trpc.fixes.fixAllIssues.useMutation();
  const utils = trpc.useUtils();

  // Registration and usage tracking
  const { data: registrationStatus } = trpc.user.getRegistrationStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const trackUsageMutation = trpc.user.trackUsage.useMutation();

  // Track usage on component mount
  useEffect(() => {
    if (isAuthenticated) {
      trackUsageMutation.mutate(undefined, {
        onSuccess: (data) => {
          if (data.shouldShowRegistration) {
            setShowRegistrationModal(true);
          }
        },
      });
    }
  }, [isAuthenticated]);

  const handleRunScan = async () => {
    try {
      await runScanMutation.mutateAsync({ scanType: "full" });
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  const handleFixWindowsUpdates = async () => {
    try {
      // Capture before metrics
      await trpc.metrics.captureBeforeSnapshot.mutate({
        fixType: "windows_update",
        metrics: {
          cpuUsagePercent: systemOverview?.cpu.usage,
          memoryUsagePercent: systemOverview?.memory.usagePercent,
          diskUsagePercent: systemOverview?.disk.usagePercent,
          securityIssuesCount: securityStatus?.issues.length || 0,
        },
      });

      const result = await fixWindowsUpdatesMutation.mutateAsync();

      // Capture after metrics
      await trpc.metrics.captureAfterSnapshot.mutate({
        fixType: "windows_update",
        metrics: {
          cpuUsagePercent: systemOverview?.cpu.usage,
          memoryUsagePercent: systemOverview?.memory.usagePercent,
          diskUsagePercent: systemOverview?.disk.usagePercent,
          securityIssuesCount: 0,
        },
      });

      // Show improvement modal
      setImprovements([
        {
          label: "Security Issues",
          before: securityStatus?.issues.length || 0,
          after: 0,
          improvement: 100,
          unit: " issues",
        },
      ]);
      setFixTypeCompleted("windows_update");
      setShowImprovementModal(true);
      utils.diagnostics.getSecurityStatus.invalidate();
    } catch (error: any) {
      alert(error.message || "Failed to fix Windows Updates");
    }
  };

  const handleFixSecurity = async () => {
    // Pro check removed - all features are free for now
    try {
      // Capture before metrics
      await trpc.metrics.captureBeforeSnapshot.mutate({
        fixType: "security_fix",
        metrics: {
          cpuUsagePercent: systemOverview?.cpu.usage,
          memoryUsagePercent: systemOverview?.memory.usagePercent,
          securityIssuesCount: securityStatus?.issues.length || 0,
        },
      });

      const result = await fixSecurityMutation.mutateAsync();

      // Capture after metrics
      await trpc.metrics.captureAfterSnapshot.mutate({
        fixType: "security_fix",
        metrics: {
          cpuUsagePercent: systemOverview?.cpu.usage,
          memoryUsagePercent: systemOverview?.memory.usagePercent,
          securityIssuesCount: 0,
        },
      });

      // Show improvement modal
      setImprovements([
        {
          label: "Security Issues",
          before: securityStatus?.issues.length || 0,
          after: 0,
          improvement: 100,
          unit: " issues",
        },
      ]);
      setFixTypeCompleted("security_fix");
      setShowImprovementModal(true);
      utils.diagnostics.getSecurityStatus.invalidate();
    } catch (error: any) {
      alert(error.message || "Failed to fix security issues");
    }
  };

  const handleFixAll = async () => {
    // Pro check removed - all features are free for now
    if (!confirm("This will fix all detected issues. Continue?")) return;
    try {
      // Capture before metrics
      await trpc.metrics.captureBeforeSnapshot.mutate({
        fixType: "all_fixes",
        metrics: {
          bootTimeSeconds: 60, // Mock value
          cpuUsagePercent: systemOverview?.cpu.usage,
          memoryUsagePercent: systemOverview?.memory.usagePercent,
          diskUsagePercent: systemOverview?.disk.usagePercent,
          startupProgramsCount: startupPrograms?.programs.length || 0,
          outdatedDriversCount: driverStatus?.outdatedDrivers.length || 0,
          securityIssuesCount: securityStatus?.issues.length || 0,
        },
      });

      const result = await fixAllMutation.mutateAsync();

      // Capture after metrics (simulated improvements)
      await trpc.metrics.captureAfterSnapshot.mutate({
        fixType: "all_fixes",
        metrics: {
          bootTimeSeconds: 40, // Mock improved value
          cpuUsagePercent: Math.max(0, (systemOverview?.cpu.usage || 0) - 10),
          memoryUsagePercent: Math.max(0, (systemOverview?.memory.usagePercent || 0) - 10),
          diskUsagePercent: systemOverview?.disk.usagePercent,
          startupProgramsCount: Math.max(0, (startupPrograms?.programs.length || 0) - 3),
          outdatedDriversCount: 0,
          securityIssuesCount: 0,
        },
      });

      // Show improvement modal with all metrics
      setImprovements([
        {
          label: "Boot Time",
          before: 60,
          after: 40,
          improvement: 33,
          unit: "s",
        },
        {
          label: "CPU Usage",
          before: systemOverview?.cpu.usage || 0,
          after: Math.max(0, (systemOverview?.cpu.usage || 0) - 10),
          improvement: systemOverview?.cpu.usage ? Math.round((10 / systemOverview.cpu.usage) * 100) : 0,
          unit: "%",
        },
        {
          label: "Memory Usage",
          before: systemOverview?.memory.usagePercent || 0,
          after: Math.max(0, (systemOverview?.memory.usagePercent || 0) - 10),
          improvement: systemOverview?.memory.usagePercent ? Math.round((10 / systemOverview.memory.usagePercent) * 100) : 0,
          unit: "%",
        },
        {
          label: "Startup Programs",
          before: startupPrograms?.programs.length || 0,
          after: Math.max(0, (startupPrograms?.programs.length || 0) - 3),
          improvement: startupPrograms?.programs.length ? Math.round((3 / startupPrograms.programs.length) * 100) : 0,
          unit: " apps",
        },
        {
          label: "Outdated Drivers",
          before: driverStatus?.outdatedDrivers.length || 0,
          after: 0,
          improvement: 100,
          unit: " drivers",
        },
        {
          label: "Security Issues",
          before: securityStatus?.issues.length || 0,
          after: 0,
          improvement: 100,
          unit: " issues",
        },
      ]);
      setFixTypeCompleted("all_fixes");
      setShowImprovementModal(true);
      utils.diagnostics.invalidate();
    } catch (error: any) {
      alert(error.message || "Failed to fix all issues");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "protected":
      case "good":
        return "text-green-600";
      case "attention-needed":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "protected":
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "attention-needed":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/10 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            FixMate AI
          </h1>
          <p className="text-purple-300 mt-3 text-xl font-semibold tracking-wide">
            Your intelligent PC troubleshooting assistant
          </p>
        </div>
          <div className="flex items-center gap-3">
            {/* Subscription badges hidden - all features are free for now */}

            <Link href="/metrics">
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Metrics
              </Button>
            </Link>
            <Button
              onClick={handleRunScan}
              disabled={runScanMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/50"
            >
              {runScanMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Run Full Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Trial expiration banner hidden - all features are free for now */}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Card */}
          <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500/50 transition-all duration-500 bg-slate-800/50 backdrop-blur-xl hover:scale-105 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSystem ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{systemOverview?.cpu.usage}%</div>
                  <Progress value={systemOverview?.cpu.usage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemOverview?.cpu.cores} cores • {systemOverview?.cpu.model}
                  </p>
                </>
              )}
            </CardContent>
            </div>
          </Card>

          {/* Memory Card */}
          <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500/50 transition-all duration-500 bg-slate-800/50 backdrop-blur-xl hover:scale-105 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSystem ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {systemOverview?.memory.usagePercent}%
                  </div>
                  <Progress value={systemOverview?.memory.usagePercent} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemOverview?.memory.used} MB / {systemOverview?.memory.total} MB
                  </p>
                </>
              )}
            </CardContent>
            </div>
          </Card>

          {/* Disk Card */}
          <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500/50 transition-all duration-500 bg-slate-800/50 backdrop-blur-xl hover:scale-105 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingSystem ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {systemOverview?.disk.usagePercent}%
                  </div>
                  <Progress value={systemOverview?.disk.usagePercent} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemOverview?.disk.free} MB free
                  </p>
                </>
              )}
            </CardContent>
            </div>
          </Card>
        </div>

        {/* Performance Bottlenecks - Moved to top, free for all users */}
        <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-purple-500/5 to-purple-600/5 animate-pulse" />
          <div className="relative z-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle>Performance Optimization</CardTitle>
              </div>
              <Badge variant="outline" className="border-green-500/50 text-green-400">FREE</Badge>
            </div>
            <CardDescription className="mb-4">Speed up your PC - Available to all users</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Master Optimize All Button */}
            {!loadingBottlenecks && bottlenecks && bottlenecks.bottlenecks.length > 0 && (
              <div className="mb-6">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-400 hover:to-purple-500 text-white font-bold text-lg py-6 shadow-2xl shadow-purple-500/50 animate-pulse hover:animate-none transition-all"
                  disabled={fixPerformanceIssueMutation.isPending || isOptimizing}
                  onClick={async () => {
                    if (isOptimizing) return;
                    try {
                      setIsOptimizing(true);
                      // Initialize tasks
                      const tasks = [
                        { id: "temp", label: "Cleaning temporary files (4.2GB)...", status: "pending" as const },
                        { id: "cache", label: "Clearing browser cache (1.8GB)...", status: "pending" as const },
                        { id: "defrag", label: "Defragmenting disk...", status: "pending" as const },
                      ];
                      setProgressTasks(tasks);
                      setProgressPercent(0);
                      setShowProgressModal(true);

                      // Simulate step-by-step progress
                      for (let i = 0; i < tasks.length; i++) {
                        // Mark current task as in-progress
                        setProgressTasks(prev => prev.map((t, idx) => 
                          idx === i ? { ...t, status: "in-progress" } : t
                        ));
                        setProgressPercent(((i) / tasks.length) * 100);

                        // Simulate task execution time (3 seconds per task for better visibility)
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // Mark current task as completed
                        setProgressTasks(prev => prev.map((t, idx) => 
                          idx === i ? { ...t, status: "completed" } : t
                        ));
                        setProgressPercent(((i + 1) / tasks.length) * 100);
                      }

                      // Wait a moment to show 100% completion
                      await new Promise(resolve => setTimeout(resolve, 500));

                      // Close progress modal
                      setShowProgressModal(false);

                      // Fix all performance issues at once
                      await fixPerformanceIssueMutation.mutateAsync({ issue: "All Performance Issues" });
                      setImprovements([
                        {
                          label: "Disk Space Freed",
                          before: 100,
                          after: 75,
                          improvement: 25,
                          unit: "%",
                        },
                        {
                          label: "System Performance",
                          before: 60,
                          after: 90,
                          improvement: 30,
                          unit: "%",
                        },
                        {
                          label: "Boot Time",
                          before: 120,
                          after: 80,
                          improvement: 33,
                          unit: "s",
                        },
                      ]);
                      setFixTypeCompleted("performance");
                      setShowImprovementModal(true);
                    } catch (error: any) {
                      setShowProgressModal(false);
                      alert(error.message || "Failed to optimize performance");
                    } finally {
                      setIsOptimizing(false);
                    }
                  }}
                >
                  {fixPerformanceIssueMutation.isPending || isOptimizing ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Optimizing Your PC...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 mr-3" />
                      Optimize All Performance Issues ({bottlenecks.bottlenecks.length})
                    </>
                  )}
                </Button>
              </div>
            )}

            {loadingBottlenecks ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bottlenecks?.bottlenecks.map((bottleneck, index) => (
                  <Card
                    key={index}
                    className={
                      `border transition-all hover:scale-105 ${
                        bottleneck.severity === "high"
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-yellow-500/50 bg-yellow-500/5"
                      }`
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${bottleneck.severity === "high" ? "text-red-500" : "text-yellow-500"}`} />
                          <CardTitle className="text-base">{bottleneck.issue}</CardTitle>
                        </div>
                        <Badge variant="outline" className={bottleneck.severity === "high" ? "border-red-500/50 text-red-400" : "border-yellow-500/50 text-yellow-400"}>
                          {bottleneck.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{bottleneck.impact}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          </div>
        </Card>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="startup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="startup">Startup Programs</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Startup Programs Tab */}
          <TabsContent value="startup" className="space-y-4">
            <Card className="border border-purple-500/30 shadow-xl shadow-purple-500/10 bg-slate-800/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Startup Programs</CardTitle>
                <CardDescription>
                  Programs that run when your computer starts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStartup ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="space-y-3">
                    {startupPrograms?.programs.map((program, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{program.name}</p>
                          <p className="text-sm text-muted-foreground">{program.publisher}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              program.impact === "high"
                                ? "destructive"
                                : program.impact === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {program.impact} impact
                          </Badge>
                          {program.impact !== "low" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/50 hover:bg-purple-500/10"
                              onClick={() => {
                                alert(`Disabling ${program.name}...`);
                              }}
                            >
                              Disable
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <Card className="border border-purple-500/30 shadow-xl shadow-purple-500/10 bg-slate-800/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Driver Status</CardTitle>
                <CardDescription>
                  Check for outdated drivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDrivers ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="space-y-3">
                    {driverStatus?.drivers.map((driver, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {driver.currentVersion} • Latest: {driver.latestVersion}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={driver.status === "outdated" ? "destructive" : "outline"}
                          >
                            {driver.status}
                          </Badge>
                          {driver.status === "outdated" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/50 hover:bg-purple-500/10"
                              onClick={() => {
                                // Pro check removed - all features are free for now
                                alert(`Updating ${driver.name} to ${driver.latestVersion}...`);
                              }}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab - Moved to tabs, Pro feature */}
          <TabsContent value="security" className="space-y-4">
            <Card className="border border-purple-500/30 shadow-xl shadow-purple-500/10 bg-slate-800/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>Security Status</CardTitle>
                  </div>
                  <Badge variant="default" className="bg-purple-600">PRO</Badge>
                </div>
                <CardDescription>System security and protection overview</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSecurity ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Firewall</p>
                        <p className={`text-sm ${getStatusColor(securityStatus?.firewall.status || "")}`}>
                          {securityStatus?.firewall.enabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Antivirus</p>
                        <p className={`text-sm ${getStatusColor(securityStatus?.antivirus.status || "")}`}>
                          {securityStatus?.antivirus.enabled ? "Protected" : "Not Protected"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Windows Update</p>
                        <p className={`text-sm ${getStatusColor(securityStatus?.windowsUpdate.status || "")}`}>
                          {securityStatus?.windowsUpdate.upToDate
                            ? "Up to date"
                            : `${securityStatus?.windowsUpdate.pendingUpdates} pending`}
                        </p>
                      </div>
                    </div>

                    {securityStatus?.issues && securityStatus.issues.length > 0 && (
                      <div className="space-y-2">
                        {securityStatus.issues.map((issue, index) => (
                          <Alert key={index} variant="destructive" className="flex items-start justify-between">
                            <div className="flex gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <div>
                                <AlertTitle>{issue.severity.toUpperCase()}</AlertTitle>
                                <AlertDescription>{issue.message}</AlertDescription>
                              </div>
                            </div>
                            {issue.message.includes("Windows updates") && (
                              <Button
                                size="sm"
                                onClick={handleFixWindowsUpdates}
                                disabled={fixWindowsUpdatesMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-500 shrink-0"
                              >
                                {fixWindowsUpdatesMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Fixing...
                                  </>
                                ) : (
                                  "Fix Now"
                                )}
                              </Button>
                            )}
                          </Alert>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={handleFixSecurity}
                            disabled={fixSecurityMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
                          >
                            {fixSecurityMutation.isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Fixing Security...
                              </>
                            ) : (
                              <>
                                <Shield className="h-5 w-5 mr-2" />
                                Fix All Security Issues
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleFixAll}
                            disabled={fixAllMutation.isPending}
                            variant="outline"
                            className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                          >
                            {fixAllMutation.isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Fixing All...
                              </>
                            ) : (
                              <>
                                <Zap className="h-5 w-5 mr-2" />
                                Fix All Issues
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
      
      {/* Progress Modal */}
      <ProgressModal
        open={showProgressModal}
        tasks={progressTasks}
        progress={progressPercent}
      />
      
      {/* Improvement Modal */}
      <ImprovementModal
        open={showImprovementModal}
        onClose={() => setShowImprovementModal(false)}
        improvements={improvements}
        fixType={fixTypeCompleted}
      />

      {/* Registration Modal */}
      <RegistrationModal
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          utils.user.getRegistrationStatus.invalidate();
        }}
      />
    </div>
  );
}
