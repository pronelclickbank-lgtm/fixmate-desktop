import { cn } from "@/lib/utils";

interface CPUGaugeProps {
  usage: number; // 0-100
  size?: number;
  className?: string;
}

export function CPUGauge({ usage, size = 120, className }: CPUGaugeProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (usage / 100) * circumference;

  // Color-coded zones
  const getColor = (usage: number) => {
    if (usage < 50) return "text-green-500";
    if (usage < 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (usage: number) => {
    if (usage < 50) return "#22c55e"; // green-500
    if (usage < 80) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor(usage)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("text-2xl font-bold transition-colors duration-500", getColor(usage))}>
          {Math.round(usage)}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">CPU</div>
      </div>
    </div>
  );
}
