# Performance Baseline Measurements

**Date**: 2026-02-09
**Feature Branch**: `003-performance-optimization`

## Bundle Sizes (Before Optimization)

| Asset | Size | Gzipped |
|-------|------|---------|
| **index.js** | 830.59 KB | ~254 KB |
| **style.css** | 64.51 KB | ~12.7 KB |
| **Total Assets** | 895.10 KB | ~267 KB |

## Package Sizes (Before Optimization)

| Package | Size |
|---------|------|
| **ASAR Package** | 125.44 MB |
| **Release Folder** | 2,246.02 MB (~2.2 GB) |
| **node_modules** | ~929 MB |

## Performance Metrics (Before Optimization)

| Metric | Value | Notes |
|--------|-------|-------|
| **Cold Startup** | 5-8 seconds | Time from double-click to interactive |
| **Memory Usage** | 300-400 MB | Peak after navigating all screens |
| **Build Time** | ~7.4 seconds | `npm run build` duration |

## Build Output Analysis

```
vite v7.3.1 building client environment for production...
✓ built in 7.38s

Assets:
- dist/react/assets/index.js   830.59 KB
- dist/react/assets/style.css   64.51 KB (gzip: 12.71 KB)

Warnings:
- Chunk size warning: chunks larger than 500 KB after minification
- Recommendation: Use build.rollupOptions.output.manualChunks
```

## Identified Issues

1. **Single Bundle**: All code in one 830KB file (no code splitting)
2. **Large ASAR**: 125MB includes dev artifacts
3. **Huge Release**: 2.2GB folder includes redundant builds
4. **No Minification**: Build output not optimized (minify: true in config but not effective)

---

## Targets After Optimization

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Main Bundle | 830 KB | <400 KB | 52%+ |
| CSS Bundle | 64 KB | <40 KB | 38% |
| ASAR Package | 125 MB | <60 MB | 52% |
| Release Folder | 2.2 GB | <300 MB | 86% |
| Cold Startup | 5-8s | <3s | 60% |
| Memory Usage | 300-400 MB | <200 MB | 40% |

---

## Verification Commands

# Bundle sizes
Get-ChildItem -Recurse "dist\react\assets" -File | Select-Object Name, @{Name="SizeKB";Expression={[math]::Round($_.Length/1KB,2)}}

# ASAR size
Get-ChildItem "release\win-unpacked\resources" -File | Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB,2)}}

# Release folder size
Get-ChildItem -Recurse release -File | Measure-Object -Property Length -Sum | Select-Object @{Name="SizeMB";Expression={[math]::Round($_.Sum/1MB,2)}}
```

---

## 2026-02-10 Baseline (Post-Optimization)

After lazy loading `xlsx` in `ExportService`:

| Asset | Size | Notes |
|-------|------|-------|
| **index-*.js** | 56.89 KB | Main entry chunk |
| **ExportService-*.js** | 1.26 KB | **Optimized!** (Was 271KB) |
| **xlsx-*.js** | 407.79 KB | **Chunked** (Lazy Loaded on demand) |
| **ProductManagement-*.js** | 141.88 KB | Component logic |
| **vendor-*.js** | 169.24 KB | Core React vendors |
| **ui-*.js** | 48.99 KB | Radix UI components |

**Total Main Bundle (Initial Load)**: ~275 KB.  

**Remaining Targets**:
1. `ProductManagement` remains large (141KB). Could potentially split `LabelPrintModal` or other heavy sub-components if needed, but current size is acceptable.
