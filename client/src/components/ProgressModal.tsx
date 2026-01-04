import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface OptimizationTask {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed";
}

interface ProgressModalProps {
  open: boolean;
  tasks: OptimizationTask[];
  progress: number;
}

export function ProgressModal({ open, tasks, progress }: ProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl border border-purple-500/30 bg-slate-900/95 backdrop-blur-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Optimizing Your PC...
          </DialogTitle>
          <p className="text-purple-300 text-sm mt-2">
            Please wait while we improve your system performance
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  task.status === "completed"
                    ? "border-green-500/50 bg-green-500/10"
                    : task.status === "in-progress"
                    ? "border-purple-500/50 bg-purple-500/10 animate-pulse"
                    : "border-slate-700/50 bg-slate-800/30"
                }`}
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
                ) : task.status === "in-progress" ? (
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    task.status === "completed"
                      ? "text-green-400"
                      : task.status === "in-progress"
                      ? "text-purple-300"
                      : "text-muted-foreground"
                  }`}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
