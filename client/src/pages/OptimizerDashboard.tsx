import { OptimizerSidebar } from "@/components/OptimizerSidebar";
import { CircularIcon } from "@/components/CircularIcon";
import SettingsPage from "@/pages/Settings";
import AutomaticPage from "@/pages/AutomaticPage";
import { ExtendedPage } from "@/pages/ExtendedPage";
import { AllModulesPage } from "@/pages/AllModulesPage";
import { Switch } from "@/components/ui/switch";
import { PerformanceGauge } from "@/components/PerformanceGauge";
import { OptimizationProgressModal } from '@/components/OptimizationProgressModal';
import BackupsSection from '@/components/BackupsSection';
import LicenseSettings from '@/pages/LicenseSettings';
import { OptimizationResultsModal } from "@/components/OptimizationResultsModal";
import { OptimizationDetailModal } from "@/components/OptimizationDetailModal";
import { AIChatWidget } from "@/components/AIChatWidget";
import { UpdateChecker } from "@/components/UpdateChecker";
import { UserRegistrationModal } from "@/components/UserRegistrationModal";
import { TrialExpiredBanner } from "@/components/TrialExpiredBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Globe,
  FileKey,
  File,
  Eye,
  Settings,
  Trash2,
  MessageCircle,
  Archive,
  Cpu,
  Monitor,
  HardDrive,
  Minimize2,
  Maximize2,
  Info,
  MousePointer,
  Grid3x3,
  User,
  Link,
  Wrench,
  Check,
  Gauge,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useOptimization } from "@/contexts/OptimizationContext";

interface OptimizationCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  count: number;
  size: string;
  color: "blue" | "cyan" | "green" | "yellow";
  completed?: boolean;
}

const optimizationCards: OptimizationCard[] = [
  {
    id: "browsing",
    title: "Browsing traces",
    subtitle: "",
    icon: <MousePointer className="h-8 w-8" />,
    count: 157,
    size: "17 MB",
    color: "cyan",
  },
  {
    id: "registry",
    title: "Unnecessary",
    subtitle: "Registry entries",
    icon: <Grid3x3 className="h-8 w-8" />,
    count: 1684,
    size: "",
    color: "cyan",
  },
  {
    id: "files",
    title: "Unnecessary",
    subtitle: "files",
    icon: <File className="h-8 w-8" />,
    count: 655,
    size: "516 MB",
    color: "cyan",
  },
  {
    id: "privacy",
    title: "Privacy",
    subtitle: "Traces",
    icon: <User className="h-8 w-8" />,
    count: 1395,
    size: "12 MB",
    color: "cyan",
  },
  {
    id: "shortcuts",
    title: "Invalid",
    subtitle: "shortcuts",
    icon: <Link className="h-8 w-8" />,
    count: 3,
    size: "",
    color: "cyan",
  },
  {
    id: "services",
    title: "Unnecessary",
    subtitle: "running services",
    icon: <Settings className="h-8 w-8" />,
    count: 0,
    size: "",
    color: "green",
    completed: true,
  },
  {
    id: "settings",
    title: "Optimizable",
    subtitle: "Settings",
    icon: <Wrench className="h-8 w-8" />,
    count: 1,
    size: "",
    color: "cyan",
  },
  {
    id: "recycle",
    title: "Recycle bin",
    subtitle: "empty",
    icon: <Trash2 className="h-8 w-8" />,
    count: 9,
    size: "97 MB",
    color: "cyan",
  },
];

export default function OptimizerDashboard() {
  const { shouldOptimize, shouldScan, resetTriggers } = useOptimization();
  const [activeSection, setActiveSection] = useState("optimize");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const optimizationStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ category: string; name: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [automaticMode, setAutomaticMode] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [animatedBlocks, setAnimatedBlocks] = useState(0);
  const hasAnimated = useRef(false);

  // Check registration status on mount
  useEffect(() => {
    const isRegistered = localStorage.getItem("fixmate_registered");
    if (!isRegistered) {
      setShowRegistrationModal(true);
    }
  }, []);

  // Open chat when AI Assistant button is clicked
  useEffect(() => {
    if (activeSection === "ai-chat") {
      setChatOpen(true);
      setActiveSection("optimize"); // Reset to optimize after opening chat
    }
  }, [activeSection]);

  // Initial LED block animation on mount
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      let currentBlock = 0;
      const animationInterval = setInterval(() => {
        currentBlock++;
        setAnimatedBlocks(currentBlock);
        if (currentBlock >= 20) {
          clearInterval(animationInterval);
        }
      }, 50); // 50ms per block = 1 second total animation
      
      return () => clearInterval(animationInterval);
    }
  }, []);
  
  // Fetch real system data
  const { data: metrics, refetch: refetchMetrics } = trpc.optimizer.getMetrics.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  const { data: diagnostics, refetch: refetchDiagnostics } = trpc.optimizer.getDiagnostics.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const executeOptimizationMutation = trpc.optimizer.executeOptimization.useMutation({
    onSuccess: (data) => {
      setOptimizationResults(data);
      setShowResults(true);
      // Refresh diagnostics to show improvements
      setTimeout(() => {
        refetchDiagnostics();
      }, 1000);
    },
  });

  // Listen for AI-triggered optimization
  useEffect(() => {
    if (shouldOptimize && !isOptimizing) {
      handleOptimize();
      resetTriggers();
    }
  }, [shouldOptimize]);

  // Listen for AI-triggered scan
  useEffect(() => {
    if (shouldScan) {
      // Trigger diagnostics refetch
      refetchDiagnostics();
      resetTriggers();
    }
  }, [shouldScan]);

  // Timer-based progress updater
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered, isOptimizing:', isOptimizing);
    if (!isOptimizing || !optimizationStartTimeRef.current) {
      console.log('[DEBUG] Not optimizing or no start time, returning');
      return;
    }
    console.log('[DEBUG] Starting progress interval...');

    const tasks = [
      { name: "Cleaning browsing traces...", duration: 2000 },
      { name: "Removing unnecessary registry entries...", duration: 2000 },
      { name: "Deleting unnecessary files...", duration: 2000 },
      { name: "Clearing privacy traces...", duration: 2000 },
      { name: "Fixing invalid shortcuts...", duration: 1500 },
      { name: "Optimizing services...", duration: 1500 },
      { name: "Applying optimizable settings...", duration: 1500 },
      { name: "Emptying recycle bin...", duration: 1500 },
    ];

    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);

    const interval = setInterval(() => {
      if (!optimizationStartTimeRef.current) return;
      const elapsed = Date.now() - optimizationStartTimeRef.current;
      const progress = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
      console.log('[DEBUG] Progress update:', progress, '%');
      
      // Calculate current task based on elapsed time
      let accumulatedTime = 0;
      let currentTaskName = tasks[0].name;
      for (const task of tasks) {
        if (elapsed < accumulatedTime + task.duration) {
          currentTaskName = task.name;
          break;
        }
        accumulatedTime += task.duration;
      }

      setOptimizationProgress(progress);
      setCurrentTask(currentTaskName);

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100); // Update every 100ms

    progressIntervalRef.current = interval;
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isOptimizing]);

  const handleOptimize = async () => {
    console.log('[DEBUG] handleOptimize called');
    setOptimizationProgress(0);
    setShowResults(false);
    optimizationStartTimeRef.current = Date.now();
    console.log('[DEBUG] Set optimizationStartTimeRef to:', optimizationStartTimeRef.current);
    setIsOptimizing(true);

    const tasks = [
      { name: "Cleaning browsing traces...", duration: 2000 },
      { name: "Removing unnecessary registry entries...", duration: 2000 },
      { name: "Deleting unnecessary files...", duration: 2000 },
      { name: "Clearing privacy traces...", duration: 2000 },
      { name: "Fixing invalid shortcuts...", duration: 1500 },
      { name: "Optimizing services...", duration: 1500 },
      { name: "Applying optimizable settings...", duration: 1500 },
      { name: "Emptying recycle bin...", duration: 1500 },
    ];

    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
    
    // Wait for the total duration
    await new Promise((resolve) => setTimeout(resolve, totalDuration));

    // Execute the actual optimization
    await executeOptimizationMutation.mutateAsync();
    optimizationStartTimeRef.current = null;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsOptimizing(false);
  };

  // Calculate totals from real data
  const totalObjects = diagnostics?.summary.totalObjects || 0;
  const totalSize = diagnostics ? `${diagnostics.summary.totalSizeMB} MB` : "0 MB";

  // Build optimization cards from real data
  const realOptimizationCards: OptimizationCard[] = diagnostics
    ? [
        {
          id: "browsing",
          title: "Browsing traces",
          subtitle: "",
          icon: <MousePointer className="h-8 w-8" />,
          count: diagnostics.browsingTraces.count,
          size: `${diagnostics.browsingTraces.sizeMB} MB`,
          color: "cyan" as const,
        },
        {
          id: "registry",
          title: "Unnecessary",
          subtitle: "Registry entries",
          icon: <Grid3x3 className="h-8 w-8" />,
          count: diagnostics.registryEntries.count,
          size: "",
          color: "cyan" as const,
        },
        {
          id: "files",
          title: "Unnecessary",
          subtitle: "files",
          icon: <File className="h-8 w-8" />,
          count: diagnostics.unnecessaryFiles.count,
          size: `${diagnostics.unnecessaryFiles.sizeMB} MB`,
          color: "cyan" as const,
        },
        {
          id: "privacy",
          title: "Privacy",
          subtitle: "Traces",
          icon: <User className="h-8 w-8" />,
          count: diagnostics.privacyTraces.count,
          size: `${diagnostics.privacyTraces.sizeMB} MB`,
          color: "cyan" as const,
        },
        {
          id: "shortcuts",
          title: "Invalid",
          subtitle: "shortcuts",
          icon: <Link className="h-8 w-8" />,
          count: diagnostics.invalidShortcuts.count,
          size: "",
          color: "cyan" as const,
        },
        {
          id: "services",
          title: "Unnecessary",
          subtitle: "running services",
          icon: <Settings className="h-8 w-8" />,
          count: diagnostics.unnecessaryServices.count,
          size: "",
          color: diagnostics.unnecessaryServices.count === 0 ? ("green" as const) : ("cyan" as const),
          completed: diagnostics.unnecessaryServices.count === 0,
        },
        {
          id: "settings",
          title: "Optimizable",
          subtitle: "Settings",
          icon: <Wrench className="h-8 w-8" />,
          count: diagnostics.optimizableSettings.count,
          size: "",
          color: "cyan" as const,
        },
        {
          id: "recycle",
          title: "Recycle bin",
          subtitle: "empty",
          icon: <Trash2 className="h-8 w-8" />,
          count: diagnostics.recycleBin.count,
          size: `${diagnostics.recycleBin.sizeMB} MB`,
          color: "cyan" as const,
        },
      ]
    : optimizationCards;

  const cpuInfo = metrics
    ? `${metrics.cpu.model} (${metrics.cpu.cores} cores)`
    : "Intel Core i7-9700K CPU";
  const osInfo = metrics
    ? metrics.platform === "win32"
      ? "Windows 11"
      : metrics.platform === "darwin"
      ? "macOS"
      : "Linux"
    : "Windows 11";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <OptimizerSidebar activeItem={activeSection} onItemClick={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border p-6 bg-gradient-to-b from-background to-background/95">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Large Info Icon with Blue Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 p-4 rounded-2xl shadow-2xl shadow-blue-500/50">
                <Info className="h-12 w-12 text-white" />
              </div>
            </div>
            
            {/* Center: Optimize and Analyze Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                {isOptimizing ? "Optimizing..." : "Optimize"}
              </Button>
              <Button
                onClick={() => {
                  refetchMetrics();
                  refetchDiagnostics();
                }}
                variant="outline"
                size="lg"
                className="border-2 border-blue-500/50 hover:bg-blue-500/10 font-semibold px-8 py-6 text-lg transition-all hover:scale-105"
              >
                Analyze
              </Button>
            </div>
            
            {/* Right: Circular Speedometer Gauges */}
            <div className="relative flex gap-3">
              {/* CPU Speedometer */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30, 41, 59)" strokeWidth="8" />
                    {/* Progress arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={`url(#cpuGradient)`}
                      strokeWidth="8"
                      strokeDasharray={`${(metrics?.cpu.usage || 0) * 2.827} 282.7`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                        <stop offset="100%" stopColor="rgb(34, 211, 238)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                      {Math.round(metrics?.cpu.usage || 0)}%
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground font-semibold tracking-wider">CPU</div>
              </div>
              
              {/* RAM Speedometer */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30, 41, 59)" strokeWidth="8" />
                    {/* Progress arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={`url(#ramGradient)`}
                      strokeWidth="8"
                      strokeDasharray={`${(metrics?.memory.usedPercent || 0) * 2.827} 282.7`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="ramGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                        <stop offset="100%" stopColor="rgb(236, 72, 153)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                      {Math.round(metrics?.memory.usedPercent || 0)}%
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground font-semibold tracking-wider">RAM</div>
              </div>
              
              {/* DISK Speedometer */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30, 41, 59)" strokeWidth="8" />
                    {/* Progress arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={`url(#diskGradient)`}
                      strokeWidth="8"
                      strokeDasharray={`${(metrics?.disk.usedPercent || 0) * 2.827} 282.7`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="diskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(251, 146, 60)" />
                        <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                      {Math.round(metrics?.disk.usedPercent || 0)}%
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground font-semibold tracking-wider">DISK</div>
              </div>
            </div>
            
            {/* Settings Icon - Absolute Top Right Corner */}
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 hover:bg-primary/10 z-20"
              onClick={() => setActiveSection("settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Trial Expired Banner */}
          <TrialExpiredBanner />
          
          <div className="p-6 flex-1 flex flex-col">
          {activeSection === 'optimize' && (
            <>
              <div className="grid grid-cols-4 gap-4 flex-1">
              {realOptimizationCards.map((card) => (
                <Card
                  key={card.id}
                  className="p-5 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCard({ category: card.id, name: `${card.title} ${card.subtitle}`.trim() });
                    setShowDetailModal(true);
                  }}
                >
                  <CircularIcon
                    icon={card.icon}
                    count={card.count}
                    color={card.color}
                    completed={card.completed}
                  />
                  <div className="mt-3 text-center">
                    <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                    {card.subtitle && (
                      <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    )}
                    {card.size && (
                      <p className="text-xs text-muted-foreground mt-0.5">{card.size}</p>
                    )}
                  </div>
                </Card>
              ))}
              </div>
              
              {/* Bottom Status Bar */}
              <div className="mt-4 pt-2 border-t border-slate-700/30">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${automaticMode ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                      <span>Automatic: {automaticMode ? 'on' : 'off'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span>{osInfo}</span>
                    <span>{cpuInfo}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeSection === 'analysis' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">System Analysis</h2>
              <p className="text-muted-foreground mb-6">Comprehensive analysis of your PC's health and performance.</p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">CPU Performance</h3>
                  <p className="text-sm text-muted-foreground">Current usage: {metrics?.cpu.usage?.toFixed(1) ?? '0.0'}%</p>
                  <p className="text-sm text-muted-foreground">Cores: {metrics?.cpu.cores ?? 0}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Memory Status</h3>
                  <p className="text-sm text-muted-foreground">Used: {metrics?.memory.used?.toFixed(1) ?? '0.0'} GB</p>
                  <p className="text-sm text-muted-foreground">Total: {metrics?.memory.total?.toFixed(1) ?? '0.0'} GB</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Disk Space</h3>
                  <p className="text-sm text-muted-foreground">Free: {metrics?.disk.free?.toFixed(1) ?? '0.0'} GB</p>
                  <p className="text-sm text-muted-foreground">Total: {metrics?.disk.total?.toFixed(1) ?? '0.0'} GB</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">System Info</h3>
                  <p className="text-sm text-muted-foreground">{osInfo}</p>
                  <p className="text-sm text-muted-foreground">{cpuInfo}</p>
                </Card>
              </div>
            </div>
          )}
          
          {activeSection === 'clean' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Clean System</h2>
                  <p className="text-muted-foreground">Remove temporary files, cache, and unnecessary data.</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleOptimize}
                  disabled={isOptimizing || totalObjects === 0}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isOptimizing ? 'Cleaning...' : 'Clean All Now'}
                </Button>
              </div>
              <div className="space-y-4">
                {realOptimizationCards.slice(0, 4).map((card) => (
                  <Card key={card.id} className="p-6 flex items-center justify-between hover:bg-card/80 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{card.title} {card.subtitle}</h3>
                        <p className="text-sm text-muted-foreground">{card.count} items • {card.size}</p>
                      </div>
                    </div>
                    <Button>Clean Now</Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'backups' && (
            <BackupsSection />
          )}
          
          {activeSection === 'license' && (
            <LicenseSettings />
          )}
          
          {activeSection === 'inform' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">System Information</h2>
              <p className="text-muted-foreground mb-6">Detailed information about your PC.</p>
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Hardware</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processor:</span>
                      <span>{cpuInfo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory:</span>
                      <span>{metrics?.memory.total?.toFixed(1) ?? '0.0'} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span>{metrics?.disk.total?.toFixed(1) ?? '0.0'} GB</span>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Software</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating System:</span>
                      <span>{osInfo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FixMate AI Version:</span>
                      <span>26</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeSection === 'automatic' && (
            <div className="max-w-6xl">
              <AutomaticPage />
            </div>
          )}
          
          {activeSection === 'extended' && (
            <div className="max-w-6xl">
              <ExtendedPage />
            </div>
          )}
          
          {activeSection === 'modules' && <AllModulesPage />}
          
          {activeSection === 'ai-chat' && (
            <div className="h-full flex items-center justify-center">
              <Card className="p-8 max-w-2xl text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">AI Chat Assistance</h2>
                <p className="text-muted-foreground mb-6">Get instant help with PC troubleshooting and optimization.</p>
                <p className="text-sm text-muted-foreground mb-4">Click the chat button in the bottom-right corner to start a conversation with our AI assistant.</p>
                <Button size="lg" className="mt-4">Open Chat Widget</Button>
              </Card>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <SettingsPage />
          )}
          </div>
        </div>
      </div>
      
      {/* Optimization Progress Modal */}
      <OptimizationProgressModal
        isOpen={isOptimizing}
        progress={optimizationProgress}
        currentTask={currentTask}
      />
      
      {/* Optimization Results Modal */}
      <OptimizationResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={optimizationResults}
      />
      
      {/* Optimization Detail Modal */}
      {selectedCard && (
        <OptimizationDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          category={selectedCard.category}
          categoryName={selectedCard.name}
        />
      )}

      {/* AI Chat Widget */}
      <AIChatWidget 
        externalOpen={chatOpen}
        onExternalOpenChange={setChatOpen}
      />

      {/* User Registration Modal */}
      <UserRegistrationModal
        open={showRegistrationModal}
        onRegistrationComplete={() => setShowRegistrationModal(false)}
        onClose={() => setShowRegistrationModal(false)}
      />
    </div>
  );
}
