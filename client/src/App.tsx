import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OptimizationProvider } from "./contexts/OptimizationContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OptimizerDashboard from "./pages/OptimizerDashboard";
import Admin from "./pages/Admin";
import TestButton from "./pages/TestButton";
import LicenseSettings from "./pages/LicenseSettings";
import { TauriAutoUpdater } from "./components/TauriAutoUpdater";


import Pricing from "./pages/Pricing";
import Metrics from "./pages/Metrics";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <Switch>
        <Route path={"/"} component={OptimizerDashboard} />
        <Route path={"/test"} component={TestButton} />
        <Route path={"/old"} component={Dashboard} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/metrics"} component={Metrics} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/home"} component={Home} />
        <Route path={"/license"} component={LicenseSettings} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <OptimizationProvider>
          <TooltipProvider>
            <Toaster />
            <TauriAutoUpdater />
            <Router />
          </TooltipProvider>
        </OptimizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
