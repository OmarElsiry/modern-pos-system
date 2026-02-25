# Testing Guide - Blank Page Fix

## The Issue

You're seeing a blank page because the app needs to be rebuilt and repackaged.

## Steps to Fix and Test

### Step 1: Close the Running App

1. Close the POS app if it's running
2. Make sure no `نظام الكاشير.exe` process is running in Task Manager

### Step 2: Clean and Rebuild

```powershell
# Clean the release folder
Remove-Item -Path release\win-unpacked -Recurse -Force

# Rebuild the app
npm run build

# Repackage
npx electron-builder --win --dir
```

### Step 3: Run the New Build

1. Go to `release\win-unpacked\`
2. Run `نظام الكاشير.exe`
3. **DevTools will open automatically** - check for errors in the Console tab

## What Changed

I made these fixes:

1. ✅ **Added DevTools** - Now opens automatically to see errors
2. ✅ **Updated Vite config** - Better asset handling for Electron
3. ✅ **Enabled Node Integration** - Required for database access

## Expected Behavior

When you run the app now:
- A window should open
- **DevTools (Console) will open on the right side**
- Check the Console tab for any errors
- The app should load with the POS interface

## If You Still See Blank Page

### Check DevTools Console

Look for errors like:
- `Failed to load resource` - Path issue
- `Cannot find module` - Missing dependency
- `Uncaught Error` - JavaScript error

### Common Fixes

**Error: "Failed to load module"**
```powershell
# The JavaScript file path might be wrong
# Check dist/react/index.html and verify paths
```

**Error: "Cannot find module 'better-sqlite3'"**
```powershell
# Rebuild native modules
cd release\win-unpacked\resources\app.asar.unpacked
npm rebuild better-sqlite3
```

**Error: "Database file not found"**
- This is normal on first run
- The app will create the database automatically

## Alternative: Test in Development Mode

If the packaged version doesn't work, test in development:

```powershell
# Terminal 1: Start React dev server
npm run dev:react

# Terminal 2: Start Electron
npm run dev:electron
```

This will help identify if it's a build issue or code issue.

## Debug Information to Share

If it still doesn't work, please share:

1. **Console errors** from DevTools (screenshot or copy text)
2. **Network tab** - any failed requests?
3. **Does dev mode work?** (`npm run dev`)

## Quick Test Script

Save this as `test-app.ps1` and run it:

```powershell
# Close any running instances
Get-Process | Where-Object {$_.ProcessName -like "*نظام*"} | Stop-Process -Force

# Clean
Remove-Item -Path release\win-unpacked -Recurse -Force -ErrorAction SilentlyContinue

# Build
npm run build

# Package
npx electron-builder --win --dir

# Run
Start-Process "release\win-unpacked\نظام الكاشير.exe"

Write-Host "App started! Check for DevTools window."
Write-Host "Look for errors in the Console tab."
```

## What to Look For

When the app opens with DevTools:

✅ **Good signs:**
- No red errors in Console
- Network tab shows assets loaded (200 status)
- Elements tab shows React components

❌ **Bad signs:**
- Red errors in Console
- 404 errors in Network tab
- Empty Elements tab (just `<div id="root"></div>`)

## Next Steps

1. Close the current app
2. Run the rebuild commands above
3. Check DevTools Console for errors
4. Share any error messages you see

The DevTools will help us identify exactly what's wrong!
