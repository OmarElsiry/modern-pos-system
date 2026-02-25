# Feature Specification: Performance Optimization & Bundle Size Reduction

**Feature Branch**: `003-performance-optimization`
**Created**: 2026-02-09
**Status**: Draft
**Input**: User request: "Keep the same design, but reduce application size or increase its performance."

## 1. Context & Assumptions

- **Product Type**: Desktop Point of Sale (POS) Electron application (React + Tailwind v4)
- **Target Users**: Store owners wanting faster startup, smaller installations
- **Business Goals**:
  - **Performance**: Faster application startup and runtime responsiveness
  - **Distribution**: Smaller installer/portable package for easier deployment
  - **Resource Efficiency**: Lower memory footprint and faster IPC operations

## 2. Current State Analysis

### Bundle & Package Sizes

| Asset | Current Size | Target | Reduction |
|-------|--------------|--------|-----------|
| React Bundle (index.js) | 830 KB | < 400 KB | ~50% |
| CSS Bundle (style.css) | 64 KB | < 40 KB | ~38% |
| ASAR Package | 125 MB | < 60 MB | ~52% |
| node_modules | 929 MB | - | dev only |
| Release folder | 2.2 GB | < 300 MB | ~86% |

### Identified Optimization Opportunities

| ID | Issue | Impact | Category |
|----|-------|--------|----------|
| P-01 | **No code splitting** | HIGH | Bundle Size |
| P-02 | **Full Recharts included** | HIGH | Bundle Size |
| P-03 | **Full Lucide icons bundled** | MEDIUM | Bundle Size |
| P-04 | **No tree-shaking for Radix UI** | MEDIUM | Bundle Size |
| P-05 | **Unused CSS in bundle** | LOW | Bundle Size |
| P-06 | **No lazy loading for screens** | MEDIUM | Performance |
| P-07 | **Full date-fns library imported** | MEDIUM | Bundle Size |
| P-08 | **No image optimization** | LOW | Asset Size |
| P-09 | **ASAR contains dev artifacts** | HIGH | Package Size |
| P-10 | **No build caching configured** | MEDIUM | Build Time |

### Dependencies Analysis (Heaviest Contributors)

| Package | Estimated Bundle Impact | Optimization Strategy |
|---------|------------------------|----------------------|
| recharts | ~200 KB | Lazy load, tree-shake |
| lucide-react | ~150 KB | Import only used icons |
| date-fns | ~80 KB | Import specific functions |
| @radix-ui/* | ~60 KB | Already tree-shakeable |
| html2canvas | ~50 KB | Lazy load |
| jspdf | ~100 KB | Lazy load |

## 3. User Scenarios & Testing

### User Story 1 - Fast Application Startup (Priority: P1)

As a Store Owner, I want the POS application to start quickly so that my cashiers can begin transactions immediately.

**Independent Test**:
1. Measure cold startup time (from double-click to interactive UI)
2. Current: ~5-8 seconds → Target: < 3 seconds
3. Use Performance API to log `DOMContentLoaded` and `First Contentful Paint`

---

### User Story 2 - Small Distribution Package (Priority: P1)

As an IT Administrator, I want a compact installer so that I can distribute to multiple stores quickly over limited bandwidth.

**Independent Test**:
1. Build portable package using `npm run dist:win`
2. Measure total size in `release/portable`
3. Current: ~800 MB → Target: < 200 MB

---

### User Story 3 - Memory Efficiency (Priority: P2)

As a user running on older hardware, I want the app to use less memory so that I can run other software alongside it.

**Independent Test**:
1. Launch app and navigate to all screens
2. Measure memory in Task Manager
3. Current: ~300-400 MB → Target: < 200 MB

---

### User Story 4 - Fast Screen Navigation (Priority: P1)

As a Cashier, I want instant screen transitions so that I can switch between POS and reports without delays.

**Independent Test**:
1. Click navigation items and measure transition time
2. Target: < 100ms for cached screens
3. No visible loading spinner for static screens

## 4. Requirements

### Functional Requirements

- **PO-001**: Build system MUST implement code splitting for route-based chunks
- **PO-002**: Heavy dependencies (recharts, jspdf, html2canvas) MUST be lazy-loaded
- **PO-003**: Icon imports MUST use named imports from lucide-react (no barrel imports)
- **PO-004**: date-fns MUST use subpath imports (e.g., `date-fns/format`)
- **PO-005**: Production build MUST enable minification with terser
- **PO-006**: CSS MUST be purged of unused classes
- **PO-007**: Electron build MUST exclude dev dependencies from ASAR
- **PO-008**: Build MUST use persistent caching for faster rebuilds

### Non-Functional Requirements

- **NFR-001**: No visual changes to the current design
- **NFR-002**: All existing functionality MUST continue working
- **NFR-003**: Build time MUST not increase by more than 20%
- **NFR-004**: Source maps MUST still be available for debugging

## 5. Success Criteria

- **SC-001**: Main bundle (index.js) < 400 KB gzipped
- **SC-002**: Cold startup time < 3 seconds (measured)
- **SC-003**: Portable package < 200 MB
- **SC-004**: ASAR package < 60 MB
- **SC-005**: All E2E tests continue to pass
- **SC-006**: No visual regression in UI screenshots
- **SC-007**: Memory usage < 200 MB after 10 minutes idle

## 6. Out of Scope

- UI redesign (maintaining current design as requested)
- Electron version upgrade (may introduce breaking changes)
- Database migration or schema changes
- New feature additions
