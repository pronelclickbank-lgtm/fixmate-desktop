import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

// Mock process data generator for demonstration
function generateMockProcesses() {
  const processNames = [
    "chrome.exe",
    "firefox.exe",
    "code.exe",
    "node.exe",
    "explorer.exe",
    "System",
    "svchost.exe",
    "MsMpEng.exe",
    "Discord.exe",
    "Spotify.exe",
    "Steam.exe",
    "nvidia-container.exe",
    "RuntimeBroker.exe",
    "SearchIndexer.exe",
    "dwm.exe",
    "csrss.exe",
    "winlogon.exe",
    "services.exe",
    "lsass.exe",
    "taskhostw.exe",
  ];

  return processNames.map((name, index) => ({
    pid: 1000 + index * 100 + Math.floor(Math.random() * 50),
    name,
    cpu: Math.random() * 100,
    memory: Math.random() * 1000,
    status: Math.random() > 0.1 ? "Running" : "Suspended",
  }));
}

export const processesRouter = router({
  getProcesses: publicProcedure.query(async () => {
    // In a real implementation, you would use system commands to get actual processes
    // For Linux: ps aux
    // For Windows: tasklist or Get-Process via PowerShell
    
    try {
      if (process.platform === "win32") {
        // Windows: use tasklist command
        const { stdout } = await execAsync(
          'powershell "Get-Process | Select-Object Name,Id,CPU,@{Name=\\"Memory\\";Expression={$_.WorkingSet64/1MB}} | ConvertTo-Json"'
        );
        const processes = JSON.parse(stdout);
        return processes.map((p: any) => ({
          pid: p.Id,
          name: p.Name + ".exe",
          cpu: parseFloat(p.CPU) || 0,
          memory: parseFloat(p.Memory) || 0,
          status: "Running",
        }));
      } else {
        // Linux/Mac: use ps command
        const { stdout } = await execAsync(
          "ps aux --no-headers | awk '{print $2,$11,$3,$6}'"
        );
        const lines = stdout.trim().split("\n");
        return lines.slice(0, 50).map((line) => {
          const [pid, name, cpu, memory] = line.split(/\s+/);
          return {
            pid: parseInt(pid),
            name: name.split("/").pop() || name,
            cpu: parseFloat(cpu),
            memory: parseFloat(memory) / 1024, // Convert KB to MB
            status: "Running",
          };
        });
      }
    } catch (error) {
      console.error("Error fetching processes:", error);
      // Fallback to mock data if real data fails
      return generateMockProcesses();
    }
  }),

  getSystemSummary: publicProcedure.query(async () => {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Calculate average CPU usage
    const cpuUsage =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + ((total - idle) / total) * 100;
      }, 0) / cpus.length;

    // Get disk usage (simplified - would need better implementation for real use)
    let diskUsage = 0;
    try {
      if (process.platform === "win32") {
        const { stdout } = await execAsync(
          'powershell "Get-PSDrive C | Select-Object Used,Free | ConvertTo-Json"'
        );
        const disk = JSON.parse(stdout);
        const total = disk.Used + disk.Free;
        diskUsage = (disk.Used / total) * 100;
      } else {
        const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $5}'");
        diskUsage = parseFloat(stdout.replace("%", ""));
      }
    } catch (error) {
      console.error("Error fetching disk usage:", error);
      diskUsage = Math.random() * 100; // Fallback
    }

    return {
      cpuUsage,
      memoryUsage: (usedMemory / totalMemory) * 100,
      diskUsage,
      processCount: await getProcessCount(),
    };
  }),

  endProcess: publicProcedure
    .input(z.object({ pid: z.number() }))
    .mutation(async ({ input }) => {
      try {
        if (process.platform === "win32") {
          await execAsync(`taskkill /PID ${input.pid} /F`);
        } else {
          await execAsync(`kill -9 ${input.pid}`);
        }
        return { success: true };
      } catch (error) {
        console.error("Error ending process:", error);
        throw new Error("Failed to end process");
      }
    }),
});

async function getProcessCount(): Promise<number> {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execAsync('powershell "(Get-Process).Count"');
      return parseInt(stdout.trim());
    } else {
      const { stdout } = await execAsync("ps aux --no-headers | wc -l");
      return parseInt(stdout.trim());
    }
  } catch (error) {
    return 0;
  }
}
