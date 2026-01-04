# onClick Crash Investigation Report

## Summary
**Critical Bug:** Any button with an onClick handler crashes the Vite dev server after the **second click**, regardless of component complexity or implementation.

## Test Results

### Test 1: Simple Button (No Toast)
- **First click:** ✅ Works (state updates, console log appears)
- **Second click:** ❌ **CRASHES** (blank page, server connection lost)
- **Pattern:** Crash occurs AFTER first successful state update

### Test 2: Simple Button (With Toast)
- **First click:** ✅ Works (state updates, console log appears)
- **Second click:** ❌ **CRASHES** (blank page, server connection lost)
- **Pattern:** Same crash behavior with or without toast notifications

### Test 3: OptimizerDashboard Buttons
- **Any button click:** ❌ **IMMEDIATE CRASH**
- **Pattern:** More complex component crashes even faster

## Root Cause Analysis

### What We Know:
1. **NOT a React error** - No React error boundaries triggered
2. **NOT specific to OptimizerDashboard** - Simple test component also crashes
3. **NOT related to toast library** - Crashes with or without Sonner
4. **NOT the onClick handler itself** - First click always works
5. **IS a Vite dev server crash** - Console shows "[vite] server connection lost"
6. **IS related to re-renders** - Crash happens after first state update

### Possible Causes:
1. **Hot Module Replacement (HMR) bug** - Vite's HMR might be crashing on state updates
2. **React 19 incompatibility** - New React version might have issues with current Vite setup
3. **Memory leak** - State updates might trigger memory issues
4. **Build configuration issue** - Something in vite.config or tsconfig causing problems
5. **Dependency conflict** - Package version mismatch causing crashes

## Console Evidence
```
[log] Button clicked successfully!
[log] [vite] server connection lost. Polling for restart...
```

The button click executes successfully, but then the Vite server immediately crashes.

## Impact
- **All interactive features broken** (Clean Now, Create Backup, Optimize, etc.)
- **App unusable for end users** - Cannot perform any actions
- **Cannot package as EXE** - Core functionality doesn't work

## Recommended Next Steps

### Immediate Actions:
1. **Check Vite configuration** - Review vite.config.ts for issues
2. **Test with Vite production build** - See if issue is dev-server specific
3. **Downgrade React** - Try React 18 to rule out React 19 issues
4. **Disable HMR** - Test with HMR disabled to isolate the problem
5. **Check package versions** - Look for known issues with current dependency versions

### Long-term Solutions:
1. **Upgrade/downgrade Vite** - Try different Vite versions
2. **Rebuild from template** - Start fresh with known-working template
3. **Switch to different dev server** - Try webpack or other bundlers
4. **Report bug to Vite team** - If confirmed as Vite bug

## Test Component Code
Location: `/home/ubuntu/pc-doctor/client/src/pages/TestButton.tsx`

Simple button with useState that crashes on second click.

## Status
🔴 **CRITICAL BUG** - Blocks all development and deployment
