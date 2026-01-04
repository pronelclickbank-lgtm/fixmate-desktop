import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Loader2, File, HardDrive, Trash2 } from "lucide-react";

interface OptimizationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryName: string;
  onOptimizationComplete?: () => void;
}

export function OptimizationDetailModal({
  isOpen,
  onClose,
  category,
  categoryName,
  onOptimizationComplete,
}: OptimizationDetailModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const utils = trpc.useUtils();
  const selectiveOptimizeMutation = trpc.optimizer.executeSelectiveOptimization.useMutation();
  
  const { data, isLoading } = trpc.optimizer.getDetailedItems.useQuery(
    { category },
    { enabled: isOpen }
  );

  // Reset selection when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen && data) {
      // Select all by default
      setSelectedItems(new Set(data.items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [isOpen, data]);

  const handleSelectAll = () => {
    if (data) {
      setSelectedItems(new Set(data.items.map(item => item.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const formatSize = (sizeKB: number) => {
    if (sizeKB === 0) return "N/A";
    if (sizeKB < 1024) return `${sizeKB} KB`;
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const selectedCount = selectedItems.size;
  const selectedSizeKB = data?.items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.size, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <File className="h-5 w-5 text-primary" />
            {categoryName} - Detailed View
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="flex flex-col gap-4">
            {/* Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{data.totalCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">{formatSize(data.totalSizeMB * 1024)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected</p>
                  <p className="text-2xl font-bold text-primary">{selectedCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected Size</p>
                  <p className="text-2xl font-bold text-primary">{formatSize(selectedSizeKB)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
                <Button
                  onClick={async () => {
                    if (selectedCount === 0) return;
                    
                    setIsOptimizing(true);
                    try {
                      await selectiveOptimizeMutation.mutateAsync({
                        category,
                        itemIds: Array.from(selectedItems),
                      });
                      
                      // Refresh diagnostics data
                      await utils.optimizer.getDiagnostics.invalidate();
                      
                      // Call completion callback
                      onOptimizationComplete?.();
                      
                      onClose();
                    } catch (error) {
                      console.error("Selective optimization failed:", error);
                    } finally {
                      setIsOptimizing(false);
                    }
                  }}
                  disabled={selectedCount === 0 || isOptimizing}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Clean Selected ({selectedCount})
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Items List */}
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-2">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium truncate">{item.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {item.path}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatSize(item.size)}
                        </span>
                        <span>Modified: {formatDate(item.lastModified)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
