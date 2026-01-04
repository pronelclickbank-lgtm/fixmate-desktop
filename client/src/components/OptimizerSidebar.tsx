import { cn } from "@/lib/utils";
import {
  Search,
  Sparkles,
  Zap,
  Grid3x3,
  Trash2,
  Gauge,
  Info,
  Archive,
  MessageCircle,
  Key,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { id: "analysis", label: "System analysis", icon: <Search className="h-5 w-5" /> },
  { id: "extended", label: "Extended", icon: <Sparkles className="h-5 w-5" /> },
  { id: "automatic", label: "Automatic", icon: <Zap className="h-5 w-5" /> },
  { id: "modules", label: "All modules", icon: <Grid3x3 className="h-5 w-5" /> },
  { id: "clean", label: "Clean", icon: <Trash2 className="h-5 w-5" /> },
  { id: "optimize", label: "Optimize", icon: <Gauge className="h-5 w-5" />, active: true },
  { id: "inform", label: "Inform", icon: <Info className="h-5 w-5" /> },
  { id: "backups", label: "Backups", icon: <Archive className="h-5 w-5" /> },
  { id: "license", label: "License", icon: <Key className="h-5 w-5" /> },
  { id: "ai-chat", label: "AI Assistant", icon: <MessageCircle className="h-6 w-6" /> },
];

interface OptimizerSidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function OptimizerSidebar({ activeItem = "optimize", onItemClick }: OptimizerSidebarProps) {
  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary">Fix</span>Mate AI
        </h1>
        <p className="text-xs text-muted-foreground mt-1">26</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative",
              item.id === "ai-chat"
                ? "bg-gradient-to-r from-cyan-600/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 animate-pulse font-bold"
                : activeItem === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === "ai-chat" && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
