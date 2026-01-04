import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CircularIconProps {
  icon: React.ReactNode;
  count?: number;
  size?: string;
  className?: string;
  completed?: boolean;
  color?: "blue" | "cyan" | "green" | "yellow";
}

const colorClasses = {
  blue: "border-blue-500 text-blue-400",
  cyan: "border-cyan-500 text-cyan-400",
  green: "border-green-500 text-green-400 bg-green-500/10",
  yellow: "border-yellow-500 text-yellow-400",
};

export function CircularIcon({
  icon,
  count,
  size = "h-24 w-24",
  className,
  completed = false,
  color = "cyan",
}: CircularIconProps) {
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className={cn(
          "rounded-full border-2 flex items-center justify-center relative",
          size,
          completed ? colorClasses.green : colorClasses[color],
          className
        )}
      >
        {completed ? (
          <Check className="h-8 w-8" />
        ) : (
          <div className="text-3xl">{icon}</div>
        )}
        
        {/* Circular progress ring (optional) */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
        </svg>
      </div>
      
      {count !== undefined && (
        <div className={cn("text-2xl font-bold", completed ? "text-green-400" : "text-cyan-400")}>
          {count}
        </div>
      )}
    </div>
  );
}
