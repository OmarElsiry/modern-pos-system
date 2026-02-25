# Implementation Plan: Performance Optimization & Bundle Size Reduction

**Feature Branch**: `003-performance-optimization`
**Created**: 2026-02-09
**Prerequisites**: spec.md ✅, research.md ✅

## Technical Context

| Aspect | Current State | Decision |
|--------|---------------|----------|
| Build Tool | Vite 7.3.1 | Keep, configure for optimization |
| CSS Framework | Tailwind v4 | Enable purge, use lightningcss |
| Bundler Output | Single IIFE bundle | Split into route chunks |
| Minification | Disabled (debug) | Enable terser for production |
| Icon Strategy | Barrel imports | Named imports |
| Lazy Loading | None | Route-based + heavy deps |

## Constitution Check

- ✅ **Library-First**: Not applicable (no new libraries)
- ✅ **Test-First**: Will run E2E after each phase
- ✅ **Simplicity**: Using native Vite/React features
- ✅ **No Breaking Changes**: Design preserved

---

## Phase 0: Baseline Measurement

**Purpose**: Establish metrics baseline for comparison

### Tasks

1. **Measure current bundle sizes**:
   - Run `npm run build` and record file sizes
   - Record: index.js, style.css, total assets
   - Expected: index.js ~830KB, style.css ~64KB

2. **Measure startup time**:
   - Add performance marks in `src/main.tsx`
   - Record Time to Interactive (TTI)
   - Expected: 5-8 seconds

3. **Measure memory usage**:
   - Launch app, navigate all screens
   - Record peak memory in Task Manager
   - Expected: 300-400 MB

4. **Create baseline report**:
   - Save measurements to `specs/003-performance-optimization/baseline.md`

**Output**: baseline.md with quantified metrics

---

## Phase 1: Build Configuration Optimization

**Purpose**: Optimize Vite build settings without code changes

### Tasks

1. **Enable production minification** in `vite.config.electron.ts`:
   ```typescript
   build: {
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true,
         drop_debugger: true,
       },
     },
   }
   ```

2. **Enable CSS minification**:
   ```typescript
   build: {
     cssMinify: 'lightningcss',
   }
   ```

3. **Configure chunk size warnings**:
   ```typescript
   build: {
     chunkSizeWarningLimit: 500, // KB
   }
   ```

4. **Enable build caching**:
   ```typescript
   cacheDir: '.vite-cache',
   ```

5. **Install terser** (if not present):
   ```bash
   npm install -D terser
   ```

**Checkpoint**: Build completes with smaller bundle, no code changes made yet.

---

## Phase 2: Route-Based Code Splitting

**Purpose**: Split application into route-based chunks

### Files to Modify

- `src/App.tsx` - Convert imports to lazy imports
- `src/main.tsx` - Add Suspense wrapper (if not present)

### Implementation

1. **Create loading fallback component** `src/components/LoadingScreen.tsx`:
   - Skeleton loader matching current layout
   - Reuse existing Skeleton component

2. **Convert screen imports to lazy**:
   ```typescript
   // src/App.tsx
   const POSScreen = React.lazy(() => import('./screens/POSScreen'));
   const Dashboard = React.lazy(() => import('./screens/Dashboard'));
   const ProductManagement = React.lazy(() => import('./screens/ProductManagement'));
   const CategoryManagement = React.lazy(() => import('./screens/CategoryManagement'));
   const CustomerManagement = React.lazy(() => import('./screens/CustomerManagement'));
   const InvoiceHistory = React.lazy(() => import('./screens/InvoiceHistory'));
   const ReportsScreen = React.lazy(() => import('./screens/ReportsScreen'));
   const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));
   ```

3. **Wrap routes in Suspense**:
   ```typescript
   <Suspense fallback={<LoadingScreen />}>
     <Routes>...</Routes>
   </Suspense>
   ```

4. **Configure manualChunks** for vendor splitting:
   ```typescript
   rollupOptions: {
     output: {
       manualChunks: {
         'vendor-react': ['react', 'react-dom', 'react-router-dom'],
         'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
         'vendor-charts': ['recharts'],
       },
     },
   }
   ```

**Checkpoint**: Multiple JS chunks created instead of single bundle.

---

## Phase 3: Heavy Dependency Lazy Loading

**Purpose**: Remove heavy dependencies from initial bundle

### Targets

| Dependency | Used In | Strategy |
|------------|---------|----------|
| recharts | Dashboard, Reports | Already lazy via route splitting |
| jspdf | ReceiptPreview | Dynamic import on print |
| html2canvas | ReceiptPreview | Dynamic import on print |

### Implementation

1. **Modify `src/services/PrintService.ts`** (or create if not exists):
   ```typescript
   export async function generateReceiptPDF(receiptElement: HTMLElement) {
     const [html2canvas, jsPDF] = await Promise.all([
       import('html2canvas').then(m => m.default),
       import('jspdf').then(m => m.default),
     ]);
     // ... existing logic
   }
   ```

2. **Update components using print functionality**:
   - Change synchronous imports to use the lazy service
   - Add loading state during PDF generation

**Checkpoint**: jspdf and html2canvas not in initial bundle.

---

## Phase 4: Icon Import Optimization

**Purpose**: Reduce Lucide icons bundle contribution

### Analysis

1. **Inventory all used icons** across the codebase
2. **Create icon index file** `src/components/icons.ts`:
   ```typescript
   // Re-export only used icons
   export { 
     ShoppingCart,
     Plus,
     Trash,
     // ... only icons actually used
   } from 'lucide-react';
   ```

3. **Update all imports** to use the centralized icons file:
   ```typescript
   import { ShoppingCart, Plus } from '@/components/icons';
   ```

4. **Alternative: Use @iconify/react** with on-demand loading:
   - Only loads icons actually rendered
   - Smaller initial footprint
   - Consider as Phase 2 optimization

**Checkpoint**: Icon-related bundle size reduced to ~20KB.

---

## Phase 5: Date-fns Optimization

**Purpose**: Use tree-shakeable imports for date-fns

### Implementation

1. **Find all date-fns imports**:
   ```bash
   grep -r "from 'date-fns'" src/
   ```

2. **Convert to subpath imports**:
   ```typescript
   // Before
   import { format, parseISO, startOfMonth } from 'date-fns';
   
   // After
   import { format } from 'date-fns/format';
   import { parseISO } from 'date-fns/parseISO';
   import { startOfMonth } from 'date-fns/startOfMonth';
   ```

3. **Or use date-fns/esm** (if available in v4):
   - May require bundler configuration

**Checkpoint**: date-fns contribution reduced to used functions only.

---

## Phase 6: Electron Build Optimization

**Purpose**: Reduce ASAR package size

### Implementation

1. **Update package.json build configuration**:
   ```json
   {
     "build": {
       "files": [
         "dist/**/*",
         "package.json",
         "!**/*.map",
         "!**/*.md",
         "!**/*.ts",
         "!**/test/**",
         "!**/tests/**",
         "!**/docs/**",
         "!**/.git/**"
       ],
       "asarUnpack": [
         "node_modules/better-sqlite3/**/*"
       ]
     }
   }
   ```

2. **Clean node_modules before packaging**:
   - Run `npm prune --production` before electron-builder
   - Or use electron-builder's built-in pruning

3. **Exclude source maps from production**:
   ```json
   "build": {
     "files": ["!**/*.map"]
   }
   ```

4. **Create build script** `scripts/build-optimized.js`:
   - Runs production build
   - Prunes dev dependencies
   - Packages with electron-builder

**Checkpoint**: ASAR reduced from 125MB to <60MB.

---

## Phase 7: Validation & Testing

**Purpose**: Verify optimizations work and nothing is broken

### Tasks

1. **Run E2E Test Suite**:
   ```bash
   npx playwright test
   ```

2. **Manual Testing Checklist**:
   - [ ] POS screen loads and functions
   - [ ] Product search works
   - [ ] Invoice creation works
   - [ ] Reports display charts
   - [ ] Receipt printing/PDF works
   - [ ] All navigation works
   - [ ] Dark mode works
   - [ ] Responsive views work

3. **Performance Re-measurement**:
   - Repeat Phase 0 measurements
   - Compare to baseline
   - Document improvements

4. **Visual Regression Check**:
   - Take screenshots of all screens
   - Compare to baseline (if available)
   - Confirm no visual changes

**Output**: validation-report.md with before/after comparisons

---

## Phase 8: Documentation & Cleanup

**Purpose**: Document changes and clean up

### Tasks

1. **Update README.md** with new build commands
2. **Create PERFORMANCE.md** with optimization notes
3. **Update build scripts** in package.json if needed
4. **Remove any temporary files**

---

## Dependencies & Execution Order

| Phase | Depends On | Can Parallel With |
|-------|------------|-------------------|
| 0: Baseline | None | None |
| 1: Build Config | Phase 0 | None |
| 2: Code Splitting | Phase 1 | None |
| 3: Heavy Deps | Phase 2 | Phase 4, 5 |
| 4: Icons | Phase 2 | Phase 3, 5 |
| 5: Date-fns | Phase 2 | Phase 3, 4 |
| 6: Electron | Phase 1 | Phase 3, 4, 5 |
| 7: Validation | All phases | None |
| 8: Docs | Phase 7 | None |

---

## Summary

| Phase | Tasks | Parallel | Expected Impact |
|-------|-------|----------|-----------------|
| 0: Baseline | 4 | 0 | Measurement only |
| 1: Build Config | 5 | 0 | 20-30% bundle reduction |
| 2: Code Splitting | 4 | 0 | 40% initial load reduction |
| 3: Heavy Deps | 2 | 2 | 150KB off initial bundle |
| 4: Icons | 3 | 2 | 130KB off bundle |
| 5: Date-fns | 2 | 2 | 60KB off bundle |
| 6: Electron | 4 | 3 | 50% ASAR reduction |
| 7: Validation | 4 | 0 | Confirmation |
| 8: Docs | 4 | 0 | Maintenance |
| **Total** | **32** | **9** | **60%+ size reduction** |

---

## Risk Mitigation

1. **Git commit after each phase** - Easy rollback
2. **E2E tests as gate** - No regressions
3. **Incremental approach** - Test each optimization separately
4. **Keep production config separate** - Dev experience unchanged
