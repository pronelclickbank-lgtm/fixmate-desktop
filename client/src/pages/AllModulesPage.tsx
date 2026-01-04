import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Cpu, 
  MemoryStick, 
  HardDrive,
  Activity
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = "name" | "pid" | "cpu" | "memory";
type SortOrder = "asc" | "desc";

export function AllModulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("cpu");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch processes with auto-refresh every 3 seconds
  const { data: processes, refetch } = trpc.processes.getProcesses.useQuery(undefined, {
    refetchInterval: 3000,
  });

  // Fetch system summary
  const { data: summary } = trpc.processes.getSystemSummary.useQuery(undefined, {
    refetchInterval: 3000,
  });

  const endProcessMutation = trpc.processes.endProcess.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleEndProcess = (pid: number, name: string) => {
    if (confirm(`Are you sure you want to end process "${name}" (PID: ${pid})?`)) {
      endProcessMutation.mutate({ pid });
    }
  };

  // Filter and sort processes
  const filteredProcesses = processes
    ?.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);
        case "pid":
          return multiplier * (a.pid - b.pid);
        case "cpu":
          return multiplier * (a.cpu - b.cpu);
        case "memory":
          return multiplier * (a.memory - b.memory);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          All Modules
        </h2>
        <p className="text-muted-foreground">
          Real-time process manager and system monitoring
        </p>
      </div>

      {/* System Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Cpu className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPU Usage</p>
              <p className="text-2xl font-bold text-blue-400">
                {summary?.cpuUsage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <MemoryStick className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="text-2xl font-bold text-purple-400">
                {summary?.memoryUsage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <HardDrive className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disk</p>
              <p className="text-2xl font-bold text-orange-400">
                {summary?.diskUsage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processes</p>
              <p className="text-2xl font-bold text-cyan-400">
                {summary?.processCount || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Process Manager */}
      <Card className="bg-slate-900/50 border-slate-800">
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredProcesses?.length || 0} processes
            </div>
          </div>

          {/* Process Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
                  <TableHead className="w-[40%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("name")}
                      className="hover:bg-slate-700/50"
                    >
                      Process Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[15%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("pid")}
                      className="hover:bg-slate-700/50"
                    >
                      PID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[15%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("cpu")}
                      className="hover:bg-slate-700/50"
                    >
                      CPU %
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[15%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("memory")}
                      className="hover:bg-slate-700/50"
                    >
                      Memory (MB)
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses?.map((process) => (
                  <TableRow
                    key={process.pid}
                    className="hover:bg-slate-800/30"
                  >
                    <TableCell className="font-medium">{process.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {process.pid}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          process.cpu > 50
                            ? "text-red-400 font-semibold"
                            : process.cpu > 20
                            ? "text-yellow-400"
                            : "text-green-400"
                        }
                      >
                        {process.cpu.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          process.memory > 500
                            ? "text-red-400 font-semibold"
                            : process.memory > 200
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                        }
                      >
                        {process.memory.toFixed(0)} MB
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEndProcess(process.pid, process.name)}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProcesses?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No processes found matching "{searchQuery}"
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
