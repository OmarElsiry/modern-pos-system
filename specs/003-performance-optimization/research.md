# Research: Performance Optimization & Bundle Size Reduction

**Feature Branch**: `003-performance-optimization`
**Created**: 2026-02-09

## Research Areas

### 1. Vite Code Splitting Strategies

**Decision**: Enable route-based code splitting with `React.lazy()` and dynamic imports

**Rationale**:
- Vite natively supports code splitting via dynamic `import()` statements
- React 18's `Suspense` provides excellent loading state management
- Route-based splitting is most effective for multi-screen apps like POS

**Alternatives Considered**:
- Manual chunking via `rollupOptions.manualChunks` - Too brittle, requires maintenance
- Per-component splitting - Overkill for this app size

**Implementation**:
```typescript
// Before
import POSScreen from './screens/POSScreen';

// After
const POSScreen = React.lazy(() => import('./screens/POSScreen'));
```

---

### 2. Recharts Bundle Optimization

**Decision**: Lazy load Recharts only on the Reports/Dashboard screens

**Rationale**:
- Recharts is ~200KB and only used in 2 screens
- POS (primary screen) doesn't need charts
- Lazy loading reduces initial bundle by ~25%

**Alternatives Considered**:
- Replace with lightweight Chart.js - Still large, more work
- Use CSS-only charts - Limited functionality
- Server-side rendering of charts - Overcomplicated for Electron

**Implementation**:
```typescript
// Lazy load the entire Recharts-using component
const ReportsScreen = React.lazy(() => import('./screens/ReportsScreen'));
```

---

### 3. Icon Optimization (Lucide React)

**Decision**: Use direct named imports instead of barrel imports

**Rationale**:
- Barrel imports (`import { Icon } from 'lucide-react'`) include all 1400+ icons
- Direct imports only include used icons (~20 in this app)
- Expected savings: ~130KB

**Alternatives Considered**:
- Switch to Heroicons - Migration effort, similar issue
- Use inline SVGs - Maintenance burden
- Icon sprites - Complex setup for minimal gain

**Implementation**:
```typescript
// Before (imports all icons)
import { ShoppingCart, Plus, Trash } from 'lucide-react';

// After (tree-shakeable)
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash from 'lucide-react/dist/esm/icons/trash';

// Or use @lucide/react which is built for tree-shaking
```

---

### 4. Date-fns Subpath Imports

**Decision**: Use function-specific imports from date-fns

**Rationale**:
- Full `date-fns` import is ~80KB
- Subpath imports only include used functions
- Expected savings: ~60KB

**Implementation**:
```typescript
// Before
import { format, parseISO } from 'date-fns';

// After
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
```

---

### 5. PDF/Canvas Lazy Loading

**Decision**: Lazy load `jspdf` and `html2canvas` on demand

**Rationale**:
- These libraries (~150KB combined) are only used for printing
- Most transactions don't require PDF receipts
- Load on first print request

**Implementation**:
```typescript
async function generatePDF() {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');
  // ... generate PDF
}
```

---

### 6. CSS Optimization

**Decision**: Enable Tailwind's production purge and CSS minification

**Rationale**:
- Tailwind v4 has built-in content detection
- Current 64KB CSS can be reduced to ~20KB
- Vite's cssnano handles minification

**Implementation**:
```typescript
// vite.config.electron.ts
build: {
  cssMinify: 'lightningcss', // Faster than default
  minify: 'terser',
}
```

---

### 7. Electron ASAR Optimization

**Decision**: Configure electron-builder to exclude unnecessary files

**Rationale**:
- ASAR contains 125MB, mostly due to node_modules
- Dev dependencies should be excluded
- Only production runtime needed

**Implementation** (package.json):
```json
{
  "build": {
    "files": [
      "dist/**/*",
      "!node_modules/**/*.md",
      "!node_modules/**/*.ts",
      "!node_modules/**/test/**",
      "!node_modules/**/*.map"
    ],
    "asarUnpack": ["node_modules/better-sqlite3/**/*"]
  }
}
```

---

### 8. Build Performance

**Decision**: Enable Vite's persistent disk cache

**Rationale**:
- Speeds up incremental builds by 50-70%
- No impact on production output

**Implementation**:
```typescript
// vite.config.ts
export default defineConfig({
  cacheDir: '.vite-cache',
  build: {
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

---

## Summary of Expected Savings

| Optimization | Before | After | Savings |
|--------------|--------|-------|---------|
| Code Splitting | 830 KB | ~350 KB initial | 58% |
| Lucide Icons | ~150 KB | ~20 KB | 87% |
| date-fns | ~80 KB | ~20 KB | 75% |
| Lazy load PDF/Canvas | ~150 KB | 0 KB initial | 100% |
| Lazy load Recharts | ~200 KB | 0 KB initial | 100% |
| CSS Purge/Minify | 64 KB | ~20 KB | 69% |
| ASAR Cleanup | 125 MB | ~50 MB | 60% |

**Total Initial Bundle**: ~830 KB → ~300 KB (64% reduction)
**Total ASAR**: 125 MB → ~50 MB (60% reduction)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking imports after refactor | Medium | High | Run full E2E test suite after each change |
| Lazy load flash | Low | Medium | Add skeleton loaders, preload on hover |
| CSS purge removes needed styles | Low | Medium | Use safelist for dynamic classes |
| ASAR exclusion breaks native modules | Medium | High | Test better-sqlite3 specifically |
