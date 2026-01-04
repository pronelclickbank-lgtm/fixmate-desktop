import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface MetricImprovement {
  label: string;
  before: number | null;
  after: number | null;
  improvement: number | null;
  unit: string;
}

interface ImprovementModalProps {
  open: boolean;
  onClose: () => void;
  improvements: MetricImprovement[];
  fixType: string;
}

export function ImprovementModal({ open, onClose, improvements, fixType }: ImprovementModalProps) {
  const hasImprovements = improvements.some((m) => m.improvement && m.improvement > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border border-purple-500/30 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Fix Complete!
              </DialogTitle>
              <p className="text-purple-300 text-sm mt-1">
                {fixType === "all_fixes"
                  ? "All issues have been resolved"
                  : "Your PC has been optimized"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {hasImprovements ? (
            <>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-green-400 mb-2">🎉 Performance Improved!</p>
                <p className="text-muted-foreground">
                  Here's how much better your PC is performing now
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {improvements.map((metric, index) => {
                  if (!metric.improvement || metric.improvement <= 0) return null;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-purple-500/30 bg-slate-800/50 backdrop-blur-sm hover:scale-105 transition-transform"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-300">{metric.label}</span>
                        <Badge className="bg-green-600 hover:bg-green-500">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {metric.improvement}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Before</p>
                          <p className="text-lg font-bold text-red-400">
                            {metric.before}
                            {metric.unit}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-muted-foreground">After</p>
                          <p className="text-lg font-bold text-green-400">
                            {metric.after}
                            {metric.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-semibold text-purple-300">
                ✅ All fixes have been applied successfully
              </p>
              <p className="text-muted-foreground mt-2">
                Your system is now more secure and optimized
              </p>
            </div>
          )}

          {/* Upsell notification for free performance optimization */}
          {fixType === "performance" && (
            <div className="p-4 rounded-lg border-2 border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-purple-800/30 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-purple-300 mb-1">Want Complete PC Health?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've optimized performance! Upgrade to Pro for <strong className="text-purple-400">complete protection</strong>:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                    <li>✓ <strong className="text-purple-300">Startup Optimization</strong> - Speed up boot time</li>
                    <li>✓ <strong className="text-purple-300">Driver Updates</strong> - Keep hardware running smoothly</li>
                    <li>✓ <strong className="text-purple-300">Security Fixes</strong> - Protect against threats</li>
                  </ul>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 gap-2 w-full">
                      <Sparkles className="h-4 w-4" />
                      Upgrade to Pro Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-purple-500/20">
            <Button variant="outline" onClick={onClose} className="border-purple-500/30">
              Close
            </Button>
            <Link href="/metrics">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 gap-2">
                <TrendingUp className="h-4 w-4" />
                View Full Report
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
