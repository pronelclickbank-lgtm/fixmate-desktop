import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Shield,
  Loader2,
  ArrowLeft,
  Home,
  Download,
} from "lucide-react";
import { Link } from "wouter";

export default function Metrics() {
  const { isAuthenticated } = useAuth();
  const { data: comparison, isLoading } = trpc.metrics.getPerformanceComparison.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const renderMetricCard = (
    title: string,
    icon: React.ReactNode,
    before: number | null,
    after: number | null,
    improvement: number | null,
    unit: string
  ) => {
    const hasImprovement = improvement !== null && improvement > 0;
    const hasData = before !== null && after !== null;

    return (
      <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              {hasImprovement && (
                <Badge className="bg-green-600 hover:bg-green-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {improvement}% Better
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Before Fix</p>
                    <p className="text-2xl font-bold text-red-400">
                      {before}
                      {unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">After Fix</p>
                    <p className="text-2xl font-bold text-green-400">
                      {after}
                      {unit}
                    </p>
                  </div>
                </div>
                {hasImprovement && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Improvement</span>
                      <span className="text-green-400 font-semibold">{improvement}%</span>
                    </div>
                    <Progress value={Math.min(improvement, 100)} className="h-2" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available yet</p>
            )}
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/10 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Navigation Header */}
      <div className="relative z-20 bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              FixMate AI
            </span>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">
            Performance Metrics
          </h1>
          <p className="text-purple-300 text-xl font-semibold">
            See how much your PC has improved after fixes
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
          </div>
        ) : !comparison?.hasData ? (
          <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl">
            <CardContent className="py-20 text-center space-y-4">
              <Zap className="h-16 w-16 text-purple-400 mx-auto" />
              <h3 className="text-2xl font-bold text-purple-300">No Metrics Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Run a fix operation to start tracking your PC's performance improvements. We'll
                capture before and after metrics automatically.
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 mt-4">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-purple-500/5 to-purple-600/5 animate-pulse" />
              <div className="relative z-10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Overall Improvement</CardTitle>
                      <CardDescription>
                        Last fix: {comparison.afterSnapshot?.fixType || "All fixes"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">Boot Time</p>
                      <p className="text-3xl font-bold text-green-400">
                        {comparison.improvements?.bootTime?.improvement || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Faster</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <p className="text-3xl font-bold text-green-400">
                        {comparison.improvements?.cpuUsage?.improvement || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Reduced</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <p className="text-3xl font-bold text-green-400">
                        {comparison.improvements?.memoryUsage?.improvement || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Freed</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">Security</p>
                      <p className="text-3xl font-bold text-green-400">
                        {comparison.improvements?.securityIssues?.improvement || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Fixed</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMetricCard(
                "Boot Time",
                <Clock className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.bootTime?.before || null,
                comparison.improvements?.bootTime?.after || null,
                comparison.improvements?.bootTime?.improvement || null,
                "s"
              )}
              {renderMetricCard(
                "CPU Usage",
                <Cpu className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.cpuUsage?.before || null,
                comparison.improvements?.cpuUsage?.after || null,
                comparison.improvements?.cpuUsage?.improvement || null,
                "%"
              )}
              {renderMetricCard(
                "Memory Usage",
                <MemoryStick className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.memoryUsage?.before || null,
                comparison.improvements?.memoryUsage?.after || null,
                comparison.improvements?.memoryUsage?.improvement || null,
                "%"
              )}
              {renderMetricCard(
                "Disk Usage",
                <HardDrive className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.diskUsage?.before || null,
                comparison.improvements?.diskUsage?.after || null,
                comparison.improvements?.diskUsage?.improvement || null,
                "%"
              )}
              {renderMetricCard(
                "Startup Programs",
                <Zap className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.startupPrograms?.before || null,
                comparison.improvements?.startupPrograms?.after || null,
                comparison.improvements?.startupPrograms?.improvement || null,
                " apps"
              )}
              {renderMetricCard(
                "Security Issues",
                <Shield className="h-5 w-5 text-purple-400" />,
                comparison.improvements?.securityIssues?.before || null,
                comparison.improvements?.securityIssues?.after || null,
                comparison.improvements?.securityIssues?.improvement || null,
                " issues"
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
