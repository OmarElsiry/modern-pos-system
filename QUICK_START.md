# Quick Start Guide

## ✅ Working Solution

### Start the App (Recommended)

```bash
npm run dev:electron:watch
```

This starts Electron with the built React app. The app should open immediately.

**Note**: If you make changes to React components, rebuild with:
```bash
npm run build:react
```

### Full Rebuild + Start

```bash
npm run dev:electron
```

Use this when you've made changes to React code.

## Alternative: Browser Development

### Browser Only (For UI Testing)

```bash
npm run dev:react
```

Then open http://localhost:5173 in your browser.

**Note**: Database features won't work, but you can test the UI layout.

## Testing

### Run Playwright Tests

```bash
npm run test:e2e
```

### Interactive Test UI

```bash
npm run test:e2e:ui
```

### Debug Tests

```bash
npm run test:e2e:debug
```

## Building (Currently Has Issues)

```bash
npm run build
```

**Note**: The built version currently fails. See `ELECTRON_FIX_GUIDE.md` for solutions.

## Current Limitations

- ❌ Cannot create production builds (bundling issues)
- ⚠️ Security warnings in development mode
- ⚠️ Database only works in Electron, not browser

## Next Steps

1. Use `npm run dev` for development
2. Read `DIAGNOSIS_SUMMARY.md` for overview
3. Read `ELECTRON_FIX_GUIDE.md` for proper solution
4. Implement IPC bridge for production-ready app

## Troubleshooting

### Port 5173 already in use
```bash
# Kill the process using port 5173
# Then run again
npm run dev
```

### Electron won't start
```bash
# Rebuild Electron binaries
npm rebuild better-sqlite3
```

### Tests fail
```bash
# Make sure dev server is not running
# Then run tests
npm run test:e2e
```

## Documentation

- `DIAGNOSIS_SUMMARY.md` - Overview of all issues
- `DIAGNOSTIC_REPORT.md` - Detailed technical analysis  
- `ELECTRON_FIX_GUIDE.md` - Step-by-step solution guide
- `QUICK_START.md` - This file
