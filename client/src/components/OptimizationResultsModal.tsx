import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface OptimizationResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    summary: {
      totalItemsCleaned: number;
      totalSpaceFreed: number;
    };
  } | null;
}

export function OptimizationResultsModal({
  isOpen,
  onClose,
  results,
}: OptimizationResultsModalProps) {
  if (!results) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Optimization Complete!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your PC has been successfully optimized
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {results.summary.totalItemsCleaned}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Items Cleaned</p>
            </div>
            
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {results.summary.totalSpaceFreed} MB
              </p>
              <p className="text-sm text-muted-foreground mt-1">Space Freed</p>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-center text-green-600 dark:text-green-400">
              ✓ Your system is now running more efficiently
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full" size="lg">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
