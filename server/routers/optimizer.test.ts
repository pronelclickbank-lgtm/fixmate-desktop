import { describe, it, expect } from "vitest";
import { optimizerRouter } from "./optimizer";

describe("Optimizer - Selective Cleaning", () => {
  it("should return detailed items for a category", async () => {
    const caller = optimizerRouter.createCaller({});
    
    const result = await caller.getDetailedItems({ category: "browsing" });
    
    expect(result).toBeDefined();
    expect(result.category).toBe("browsing");
    expect(result.totalCount).toBeGreaterThanOrEqual(0);
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    
    // Check item structure
    if (result.items.length > 0) {
      const item = result.items[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.path).toBeDefined();
      expect(item.size).toBeGreaterThanOrEqual(0);
      expect(item.lastModified).toBeDefined();
    }
  });

  it("should execute selective optimization for selected items", async () => {
    const caller = optimizerRouter.createCaller({});
    
    const itemIds = ["test-browsing-0", "test-browsing-1", "test-browsing-2"];
    
    const result = await caller.executeSelectiveOptimization({
      category: "browsing",
      itemIds,
    });
    
    expect(result.success).toBe(true);
    expect(result.category).toBe("browsing");
    expect(result.itemsCleaned).toBe(3);
    expect(result.spaceFree).toBeGreaterThan(0);
  });

  it("should not return cleaned items in subsequent detail queries", async () => {
    const caller = optimizerRouter.createCaller({});
    
    // Clean specific items with unique IDs
    const cleanedIds = ["test-files-100", "test-files-101", "test-files-102"];
    await caller.executeSelectiveOptimization({
      category: "files",
      itemIds: cleanedIds,
    });
    
    // Get items after cleaning
    const result = await caller.getDetailedItems({ category: "files" });
    
    // Cleaned items should not be in the list
    const returnedIds = result.items.map(item => item.id);
    cleanedIds.forEach(cleanedId => {
      expect(returnedIds).not.toContain(cleanedId);
    });
  });

  it("should handle empty item selection gracefully", async () => {
    const caller = optimizerRouter.createCaller({});
    
    const result = await caller.executeSelectiveOptimization({
      category: "browsing",
      itemIds: [],
    });
    
    expect(result.success).toBe(true);
    expect(result.itemsCleaned).toBe(0);
    expect(result.spaceFree).toBe(0);
  });

  it("should return valid diagnostics data", async () => {
    const caller = optimizerRouter.createCaller({});
    
    const diagnostics = await caller.getDiagnostics();
    
    expect(diagnostics).toBeDefined();
    expect(diagnostics.browsingTraces).toBeDefined();
    expect(diagnostics.browsingTraces.count).toBeGreaterThanOrEqual(0);
    expect(diagnostics.browsingTraces.sizeMB).toBeGreaterThanOrEqual(0);
    
    expect(diagnostics.registryEntries).toBeDefined();
    expect(diagnostics.registryEntries.count).toBeGreaterThanOrEqual(0);
    
    expect(diagnostics.unnecessaryFiles).toBeDefined();
    expect(diagnostics.unnecessaryFiles.count).toBeGreaterThanOrEqual(0);
    expect(diagnostics.unnecessaryFiles.sizeMB).toBeGreaterThanOrEqual(0);
    
    expect(diagnostics.summary).toBeDefined();
    expect(diagnostics.summary.totalObjects).toBeGreaterThanOrEqual(0);
    expect(diagnostics.summary.totalSizeMB).toBeGreaterThanOrEqual(0);
  });


});
