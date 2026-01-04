import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface OptimizationProgressModalProps {
  isOpen: boolean;
  progress: number;
  currentTask: string;
}

export function OptimizationProgressModal({
  isOpen,
  progress,
  currentTask,
}: OptimizationProgressModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Optimization Progress</DialogTitle>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          
          <div className="w-full space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Optimizing Your PC</h3>
              <p className="text-sm text-muted-foreground">{currentTask}</p>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm font-medium text-primary">{progress}%</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
