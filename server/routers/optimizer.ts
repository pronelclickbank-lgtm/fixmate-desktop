import { publicProcedure, router } from "../_core/trpc";
import os from "os";
import { z } from "zod";
import * as adminAPI from "../_core/adminDashboardAPI.js";

// In-memory storage for cleaned items (in real app, this would be persistent)
const cleanedItems = new Map<string, Set<string>>();

// Helper to check if an item has been cleaned
function isItemCleaned(category: string, itemId: string): boolean {
  return cleanedItems.get(category)?.has(itemId) || false;
}

// Helper to mark items as cleaned
function markItemsCleaned(category: string, itemIds: string[]): void {
  if (!cleanedItems.has(category)) {
    cleanedItems.set(category, new Set());
  }
  const categorySet = cleanedItems.get(category)!;
  itemIds.forEach(id => categorySet.add(id));
}

// Helper to get count of cleaned items for a category
function getCleanedCount(category: string): number {
  return cleanedItems.get(category)?.size || 0;
}

// Helper to get CPU usage percentage
function getCPUUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - (100 * idle) / total;

  return Math.round(usage * 10) / 10;
}

// Helper to calculate disk space (simulated for web, would use native APIs in desktop)
function getDiskSpace() {
  // In a real desktop app, this would query actual disk space
  // For now, we'll return realistic simulated values
  const totalGB = 512;
  const usedGB = 256;
  const freeGB = totalGB - usedGB;
  const usedPercent = Math.round((usedGB / totalGB) * 100);

  return {
    total: totalGB * 1024, // MB
    used: usedGB * 1024,
    free: freeGB * 1024,
    usedPercent,
  };
}

// Helper to calculate optimization opportunities
function calculateOptimizations() {
  // Simulated realistic values - in desktop app, these would scan actual files
  const tempFiles = Math.max(0, Math.floor(Math.random() * 500) + 100 - getCleanedCount('browsing')); // 100-600
  const tempFilesSizeMB = Math.max(0, Math.floor(Math.random() * 2000) + 500 - (getCleanedCount('browsing') * 5)); // 500-2500 MB

  const registryEntries = Math.max(0, Math.floor(Math.random() * 2000) + 1000 - getCleanedCount('registry')); // 1000-3000

  const unnecessaryFiles = Math.max(0, Math.floor(Math.random() * 800) + 200 - getCleanedCount('files')); // 200-1000
  const unnecessaryFilesSizeMB = Math.max(0, Math.floor(Math.random() * 1500) + 300 - (getCleanedCount('files') * 5)); // 300-1800 MB

  const privacyTraces = Math.max(0, Math.floor(Math.random() * 2000) + 500 - getCleanedCount('privacy')); // 500-2500
  const privacyTracesSizeMB = Math.max(0, Math.floor(Math.random() * 50) + 5 - (getCleanedCount('privacy') * 0.02)); // 5-55 MB

  const invalidShortcuts = Math.max(0, Math.floor(Math.random() * 10) - getCleanedCount('shortcuts')); // 0-10

  const unnecessaryServices = Math.max(0, Math.floor(Math.random() * 3) - getCleanedCount('services')); // 0-3

  const optimizableSettings = Math.max(0, Math.floor(Math.random() * 5) + 1 - getCleanedCount('settings')); // 1-6

  const recycleBinItems = Math.max(0, Math.floor(Math.random() * 50) - getCleanedCount('recycle')); // 0-50
  const recycleBinSizeMB = Math.max(0, Math.floor(Math.random() * 500) + 10 - (getCleanedCount('recycle') * 3)); // 10-510 MB

  const totalObjects =
    tempFiles +
    registryEntries +
    unnecessaryFiles +
    privacyTraces +
    invalidShortcuts +
    unnecessaryServices +
    optimizableSettings +
    recycleBinItems;

  const totalSizeMB =
    tempFilesSizeMB +
    unnecessaryFilesSizeMB +
    privacyTracesSizeMB +
    recycleBinSizeMB;

  return {
    browsingTraces: {
      count: tempFiles,
      sizeMB: tempFilesSizeMB,
    },
    registryEntries: {
      count: registryEntries,
      sizeMB: 0,
    },
    unnecessaryFiles: {
      count: unnecessaryFiles,
      sizeMB: unnecessaryFilesSizeMB,
    },
    privacyTraces: {
      count: privacyTraces,
      sizeMB: privacyTracesSizeMB,
    },
    invalidShortcuts: {
      count: invalidShortcuts,
      sizeMB: 0,
    },
    unnecessaryServices: {
      count: unnecessaryServices,
      sizeMB: 0,
    },
    optimizableSettings: {
      count: optimizableSettings,
      sizeMB: 0,
    },
    recycleBin: {
      count: recycleBinItems,
      sizeMB: recycleBinSizeMB,
    },
    summary: {
      totalObjects,
      totalSizeMB,
    },
  };
}

export const optimizerRouter = router({
  // Get current system metrics
  getMetrics: publicProcedure.query(async () => {
    const cpuUsage = getCPUUsage();
    const memoryTotal = os.totalmem();
    const memoryFree = os.freemem();
    const memoryUsed = memoryTotal - memoryFree;
    const memoryUsagePercent = Math.round((memoryUsed / memoryTotal) * 100);

    const disk = getDiskSpace();

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown CPU";
    const cpuCores = cpus.length;

    return {
      cpu: {
        usage: cpuUsage,
        model: cpuModel,
        cores: cpuCores,
      },
      memory: {
        total: Math.round(memoryTotal / (1024 * 1024 * 1024)), // GB
        used: Math.round(memoryUsed / (1024 * 1024 * 1024)),
        free: Math.round(memoryFree / (1024 * 1024 * 1024)),
        usagePercent: memoryUsagePercent,
      },
      disk: {
        total: Math.round(disk.total / 1024), // GB
        used: Math.round(disk.used / 1024),
        free: Math.round(disk.free / 1024),
        usagePercent: disk.usedPercent,
      },
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: Math.floor(os.uptime() / 3600), // hours
    };
  }),

  // Get optimization diagnostics
  getDiagnostics: publicProcedure.query(async () => {
    return calculateOptimizations();
  }),

  // Get detailed items for a specific category
  getDetailedItems: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      // Get current diagnostics to know item counts
      const diagnostics = calculateOptimizations();
      const cleanedCount = getCleanedCount(input.category);
      
      let count = 0;
      let sizeMB = 0;
      switch (input.category) {
        case 'browsing':
          count = diagnostics.browsingTraces.count;
          sizeMB = diagnostics.browsingTraces.sizeMB;
          break;
        case 'registry':
          count = diagnostics.registryEntries.count;
          break;
        case 'files':
          count = diagnostics.unnecessaryFiles.count;
          sizeMB = diagnostics.unnecessaryFiles.sizeMB;
          break;
        case 'privacy':
          count = diagnostics.privacyTraces.count;
          sizeMB = diagnostics.privacyTraces.sizeMB;
          break;
        case 'shortcuts':
          count = diagnostics.invalidShortcuts.count;
          break;
        case 'services':
          count = diagnostics.unnecessaryServices.count;
          break;
        case 'settings':
          count = diagnostics.optimizableSettings.count;
          break;
        case 'recycle':
          count = diagnostics.recycleBin.count;
          sizeMB = diagnostics.recycleBin.sizeMB;
          break;
      }
      
      // Generate detailed items
      const items: any[] = [];
      const avgSizeKB = count > 0 ? (sizeMB * 1024) / count : 100;
      
      // Generate items, skipping cleaned ones, until we have enough items or reach limit
      let itemIndex = 0;
      let generatedCount = 0;
      const maxItems = 100; // Display limit
      
      while (generatedCount < maxItems && itemIndex < count + cleanedCount) {
        const itemId = `${input.category}-${itemIndex}`;
        
        // Skip items that have been cleaned
        if (isItemCleaned(input.category, itemId)) {
          itemIndex++;
          continue;
        }
        
        let item: any = {
          id: itemId,
          size: Math.floor(Math.random() * avgSizeKB * 2) + 10, // KB
          lastModified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        switch (input.category) {
          case 'browsing':
            item.name = `Temporary Internet File ${itemIndex + 1}`;
            item.path = `C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\INetCache\\IE\\file${itemIndex}.tmp`;
            break;
          case 'registry':
            item.name = `Obsolete Registry Key ${itemIndex + 1}`;
            item.path = `HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\CLSID\\{${Math.random().toString(36).substring(7)}}`;
            item.size = 0;
            break;
          case 'files':
            item.name = `Temp File ${itemIndex + 1}.tmp`;
            item.path = `C:\\Windows\\Temp\\file${itemIndex}.tmp`;
            break;
          case 'privacy':
            item.name = `Cookie ${itemIndex + 1}`;
            item.path = `C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cookies`;
            break;
          case 'shortcuts':
            item.name = `Invalid Shortcut ${itemIndex + 1}.lnk`;
            item.path = `C:\\Users\\User\\Desktop\\shortcut${itemIndex}.lnk`;
            item.size = 1;
            break;
          case 'services':
            item.name = `Unused Service ${itemIndex + 1}`;
            item.path = `Services\\UnusedService${itemIndex}`;
            item.size = 0;
            break;
          case 'settings':
            item.name = `Performance Setting ${itemIndex + 1}`;
            item.path = `System\\Performance\\Setting${itemIndex}`;
            item.size = 0;
            break;
          case 'recycle':
            item.name = `Deleted File ${itemIndex + 1}`;
            item.path = `C:\\$Recycle.Bin\\S-1-5-21\\file${itemIndex}`;
            break;
        }
        
        items.push(item);
        generatedCount++;
        itemIndex++;
      }
      
      // Adjust counts to reflect cleaned items
      const remainingCount = count - cleanedCount;
      const remainingSizeMB = sizeMB * (remainingCount / count);
      
      return {
        category: input.category,
        totalCount: Math.max(0, remainingCount),
        totalSizeMB: Math.max(0, remainingSizeMB),
        items,
      };
    }),

  // Execute selective optimization (only selected items)
  executeSelectiveOptimization: publicProcedure
    .input(z.object({ 
      category: z.string(),
      itemIds: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      // Simulate selective cleaning delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mark items as cleaned
      markItemsCleaned(input.category, input.itemIds);
      
      // Calculate how much was cleaned based on selected items
      const itemCount = input.itemIds.length;
      const avgSizeMB = 5; // Average size per item
      const cleanedSizeMB = itemCount * avgSizeMB;
      
      return {
        category: input.category,
        itemsCleaned: itemCount,
        spaceFree: cleanedSizeMB,
        success: true,
      };
    }),

  // Execute optimization
  executeOptimization: publicProcedure.mutation(async ({ ctx }) => {
    const result = await executeOptimizationLogic();
    
    // Track usage in admin dashboard
    if (ctx.user?.email) {
      adminAPI.trackUsage({
        userEmail: ctx.user.email,
        action: "optimization_run",
        metadata: {
          itemsCleaned: result.summary.totalItemsCleaned,
          spaceFreed: result.summary.totalSpaceFreed,
          timestamp: new Date().toISOString(),
        },
      }).catch(err => console.warn("[Usage Tracking] Failed:", err));
    }
    
    return result;
  }),
});

/**
 * Execute optimization logic (exported for use by scheduler)
 */
export async function executeOptimizationLogic() {
  // Simulate optimization execution
  // In a real desktop app, this would perform actual cleanup operations
  
  const results = {
      browsingTraces: {
        itemsCleaned: Math.floor(Math.random() * 300) + 200,
        spaceFreed: Math.floor(Math.random() * 1500) + 500, // MB
      },
      registryEntries: {
        itemsCleaned: Math.floor(Math.random() * 1000) + 500,
        spaceFreed: 0,
      },
      unnecessaryFiles: {
        itemsCleaned: Math.floor(Math.random() * 400) + 200,
        spaceFreed: Math.floor(Math.random() * 800) + 300,
      },
      privacyTraces: {
        itemsCleaned: Math.floor(Math.random() * 1000) + 500,
        spaceFreed: Math.floor(Math.random() * 20) + 5,
      },
      invalidShortcuts: {
        itemsCleaned: Math.floor(Math.random() * 5) + 1,
        spaceFreed: 0,
      },
      runningServices: {
        itemsCleaned: Math.floor(Math.random() * 3) + 1,
        spaceFreed: 0,
      },
      optimizableSettings: {
        itemsCleaned: Math.floor(Math.random() * 5) + 2,
        spaceFreed: 0,
      },
      recycleBin: {
        itemsCleaned: Math.floor(Math.random() * 30) + 10,
        spaceFreed: Math.floor(Math.random() * 200) + 50,
      },
    };

    const totalItemsCleaned = Object.values(results).reduce(
      (sum, cat) => sum + cat.itemsCleaned,
      0
    );
    const totalSpaceFreed = Object.values(results).reduce(
      (sum, cat) => sum + cat.spaceFreed,
      0
    );

  return {
    success: true,
    results,
    summary: {
      totalItemsCleaned,
      totalSpaceFreed,
    },
  };
}

/**
 * Execute optimization for a specific user (for scheduled runs)
 */
export async function executeOptimization(userId: number) {
  console.log(`[Optimizer] Executing optimization for user ${userId}`);
  return executeOptimizationLogic();
}
