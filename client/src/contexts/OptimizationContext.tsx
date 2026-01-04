import { createContext, useContext, useState, ReactNode } from "react";

interface OptimizationContextType {
  triggerOptimization: () => void;
  triggerScan: () => void;
  shouldOptimize: boolean;
  shouldScan: boolean;
  resetTriggers: () => void;
}

const OptimizationContext = createContext<OptimizationContextType | undefined>(undefined);

export function OptimizationProvider({ children }: { children: ReactNode }) {
  const [shouldOptimize, setShouldOptimize] = useState(false);
  const [shouldScan, setShouldScan] = useState(false);

  const triggerOptimization = () => {
    setShouldOptimize(true);
  };

  const triggerScan = () => {
    setShouldScan(true);
  };

  const resetTriggers = () => {
    setShouldOptimize(false);
    setShouldScan(false);
  };

  return (
    <OptimizationContext.Provider
      value={{
        triggerOptimization,
        triggerScan,
        shouldOptimize,
        shouldScan,
        resetTriggers,
      }}
    >
      {children}
    </OptimizationContext.Provider>
  );
}

export function useOptimization() {
  const context = useContext(OptimizationContext);
  if (!context) {
    throw new Error("useOptimization must be used within OptimizationProvider");
  }
  return context;
}
