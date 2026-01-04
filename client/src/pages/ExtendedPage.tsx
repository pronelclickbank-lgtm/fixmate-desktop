import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export function ExtendedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [impactFilter, setImpactFilter] = useState<string>("all");

  // Fetch startup programs
  const { data: programs, isLoading, refetch } = trpc.startup.getPrograms.useQuery();
  
  // Toggle program mutation
  const toggleMutation = trpc.startup.toggleProgram.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggle = (programId: number, currentStatus: boolean) => {
    toggleMutation.mutate({ programId, enabled: !currentStatus });
  };

  // Filter programs
  const filteredPrograms = programs?.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImpact = impactFilter === "all" || program.impact.toLowerCase() === impactFilter;
    return matchesSearch && matchesImpact;
  });

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "low":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "high":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      case "high":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Extended Tools
        </h1>
        <p className="text-slate-400 mt-2">
          Advanced system optimization and management tools for power users
        </p>
      </div>

      {/* Startup Program Manager */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Startup Program Manager</h2>
            <p className="text-sm text-slate-400">Manage programs that run when Windows starts</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-white"
          >
            <option value="all">All Impact Levels</option>
            <option value="low">Low Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="high">High Impact</option>
          </select>
        </div>

        {/* Programs Table */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading startup programs...</div>
        ) : filteredPrograms && filteredPrograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Program</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Publisher</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Impact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Startup Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-white">{program.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{program.path}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{program.publisher}</td>
                    <td className="py-4 px-4">
                      <Badge variant={program.enabled ? "default" : "secondary"} className="text-xs">
                        {program.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(program.impact)}`}>
                        {getImpactIcon(program.impact)}
                        {program.impact}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-sm">{program.startupType}</td>
                    <td className="py-4 px-4 text-right">
                      <Switch
                        checked={program.enabled}
                        onCheckedChange={() => handleToggle(program.id, program.enabled)}
                        disabled={toggleMutation.isPending}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            {searchQuery || impactFilter !== "all" 
              ? "No programs match your filters" 
              : "No startup programs found"}
          </div>
        )}

        {/* Summary */}
        {filteredPrograms && filteredPrograms.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between text-sm">
            <div className="text-slate-400">
              Showing {filteredPrograms.length} of {programs?.length} programs
            </div>
            <div className="flex gap-4 text-slate-400">
              <span>
                <span className="text-green-400 font-semibold">
                  {programs?.filter(p => p.impact.toLowerCase() === "low").length}
                </span> Low Impact
              </span>
              <span>
                <span className="text-yellow-400 font-semibold">
                  {programs?.filter(p => p.impact.toLowerCase() === "medium").length}
                </span> Medium Impact
              </span>
              <span>
                <span className="text-red-400 font-semibold">
                  {programs?.filter(p => p.impact.toLowerCase() === "high").length}
                </span> High Impact
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
