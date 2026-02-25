# Implementation Plan: System Transformation & Audit

**Branch**: `001-production-audit` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)

## Summary

This plan addresses critical security vulnerabilities, architectural flaws, and UX gaps identified in the forensic audit. The primary goals are: (1) Secure the Electron shell, (2) Move database operations to the Main process, (3) Persist transaction state, (4) Implement proper routing, (5) Migrate to Tailwind CSS.

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Version** | TypeScript 5.3.3, React 18.2, Electron 40 |
| **Primary Dependencies** | `better-sqlite3`, `react-hot-toast`, `lucide-react`, `recharts` |
| **Storage** | SQLite via `better-sqlite3` (currently Renderer, moving to Main) |
| **Testing** | Jest (unit), Playwright (E2E) |
| **Target Platform** | Windows (primary), with Linux/macOS builds |
| **Project Type** | Electron Desktop App |
| **Performance Goals** | <100ms product search for 10k items, 60fps UI |
| **Constraints** | Offline-first, low-end hardware support |
| **Scale/Scope** | Single-store, single-register, <100k products |

---

## Constitution Check

> *The constitution template is unfilled. Using industry best practices as governance.*

| Gate | Status | Justification |
|------|--------|---------------|
| Security First | ✅ PASS | FR-001 mandates `contextIsolation`. |
| Testability | ✅ PASS | Jest and Playwright are configured. |
| Simplicity | ⚠️ REVIEW | IPC layer adds complexity; justified by security requirement. |

---

## Project Structure

### Documentation (this feature)

```
specs/001-production-audit/
├── spec.md              # Feature Specification
├── research.md          # Phase 0: Technical Decisions
├── plan.md              # This file
├── data-model.md        # Phase 1: Entity Definitions
└── tasks.md             # Phase 2: Task Breakdown (via /speckit-tasks)
```

### Source Code Changes

```
electron/
├── main.ts              # [MODIFY] Secure shell, add IPC handlers
├── preload.ts           # [MODIFY] Expose API via contextBridge
├── ipc/                 # [NEW] IPC handler modules
│   ├── database.ts      # [NEW] DB operation handlers
│   └── types.ts         # [NEW] IPC type definitions

src/
├── api/                 # [NEW] Client-side IPC wrappers
│   └── electronAPI.ts   # [NEW] Typed API client
├── hooks/
│   └── useTransaction.ts # [NEW] Persistence hook for cart state
├── screens/
│   └── POSScreen.tsx    # [MODIFY] Use new hooks, IPC, and routing
├── App.tsx              # [MODIFY] Replace useState routing with Router
└── main.tsx             # [MODIFY] Wrap in RouterProvider

tailwind.config.js       # [NEW] Tailwind configuration
postcss.config.js        # [NEW] PostCSS for Tailwind
```

---

## Phased Implementation

### Phase 1: Security & IPC Layer (Critical)

1.  **Secure Electron Shell**
    - Set `nodeIntegration: false`, `contextIsolation: true`, `webSecurity: true` in `main.ts`.
    - Remove `webSecurity: false` and `allowRunningInsecureContent: true`.

2.  **Create IPC Layer**
    - In `electron/ipc/database.ts`: create `ipcMain.handle` for `db:products:getAll`, `db:products:search`, `db:invoices:create`, etc.
    - In `electron/preload.ts`: use `contextBridge.exposeInMainWorld('electronAPI', { ... })` to expose typed methods.
    - In `src/api/electronAPI.ts`: create typed wrappers like `window.electronAPI.products.search(query)`.

3.  **Migrate Repositories**
    - Move `ProductRepository`, `InvoiceRepository`, `CustomerRepository`, `CategoryRepository` logic to run in Main process IPC handlers.
    - Update Renderer components to call `window.electronAPI.*` instead of direct repository imports.

### Phase 2: Transaction Persistence & Routing

1.  **Transaction Persistence Hook**
    - Create `src/hooks/useTransaction.ts` that:
        - Initializes cart from `localStorage` on mount.
        - Saves cart to `localStorage` on every change (debounced 300ms).
        - Provides `clearTransaction` and `restoreTransaction` methods.

2.  **Router Migration**
    - Install `react-router-dom`.
    - Replace `useState`/`switch` in `App.tsx` with `<MemoryRouter>` and `<Routes>`.
    - Persist last route to `localStorage` and restore on app start.

3.  **Layout Navigation Update**
    - Update `Layout.tsx` sidebar to use `<NavLink>` components.
    - Add "Kiosk Mode" toggle that hides non-POS navigation.

### Phase 3: Tailwind CSS Migration

17.  **Setup Tailwind CSS v4**
    - Install `@tailwindcss/vite` and base v4 dependencies.
    - Create `src/styles/design-tokens.css` with professional palette (Slate/Zinc bases, Indigo/Cyan accents).
    - Update `vite.config.ts` to use `@tailwindcss/vite` plugin.

2.  **Port Design Tokens**
    - Map `--color-primary` → `@theme { --color-brand: ... }`.
    - Implement "Bento Box" grid utilities for dashboard.

3.  **Incremental Component Migration**
    - Start with new components using Tailwind.
    - Gradually refactor existing CSS files to utility classes.

---

### Phase 4: UX Redesign Execution (Visual Excellence)

1.  **Dashboard Transformation (Bento Style)**
    - Refactor `Dashboard.tsx` to use a modern grid layout.
    - Implement "Sales Trends" chart (using Recharts).
    - Smooth slide-up animations for activity feed.

2.  **POS Contextual Refactor**
    - Replace Numpad Modal with an **inline/popover Numpad** in `POSScreen.tsx`.
    - Tighten Cart sidebar spacing; implement hierarchical item display.
    - Add micro-animations for "Add to Cart" and "Delete" actions.

3.  **Global Design System Hardening**
    - Audit all screens for WCAG 2.1 AA contrast compliance.
    - Standardize all icons using `lucide-react`.

---

## Verification Plan

### Automated Tests

1.  **Security Test (E2E)**
    - Verify `window.require` is undefined.
    - **Command**: `npx playwright test tests/e2e/security.spec.ts`

2.  **Persistence Test (E2E)**
    - Add items, reload, verify persistence.
    - **Command**: `npx playwright test tests/e2e/transaction-persistence.spec.ts`

3.  **Accessibility Audit (Automated)**
    - Run Lighthouse CLI or Playwright-Axe on core screens.
    - **Command**: `npm run test:a11y` (or equivalent runner)

### Manual Verification

1.  **Visual "Wow" Check**
    - Verify Dashboard uses Bento Box pattern.
    - Verify POS Numpad is contextual/non-blocking.
    - Check transitions between screens for smoothness.

2.  **RTL/LTR Integrity**
    - Ensure all Arabic text remains aligned and layout doesn't break in RTL.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Tailwind v4 | Performance & Features | v3 is less efficient for large desktop builds. |
| Popover Numpad | UX Flow (FR-008) | Modal is easier to code but breaks cashier rhythm. |
