import { cn } from "@/lib/utils";

interface PerformanceGaugeProps {
  value: number; // 0-100
  label: string;
  size?: number;
  className?: string;
}

export function PerformanceGauge({ value, label, size = 80, className }: PerformanceGaugeProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Color-coded zones
  const getColor = (val: number) => {
    if (val < 50) return "text-green-500";
    if (val < 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (val: number) => {
    if (val < 50) return "#22c55e"; // green-500
    if (val < 80) return "#eab308"; // yellow-500
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
          strokeWidth="6"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor(value)}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("text-lg font-bold transition-colors duration-500", getColor(value))}>
          {Math.round(value)}%
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}
