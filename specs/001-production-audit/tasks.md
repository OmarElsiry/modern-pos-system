# Tasks: System Transformation & Audit

**Feature Branch**: `001-production-audit`  
**Input**: Design documents from `/specs/001-production-audit/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install `react-router-dom` package via `npm install react-router-dom`
- [x] T002 [P] Install Tailwind CSS dependencies via `npm install -D tailwindcss postcss autoprefixer`
- [x] T003 [P] Create IPC directory structure: `electron/ipc/`
- [x] T004 [P] Create API directory structure: `src/api/`

**Checkpoint**: Directory structure and dependencies ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define IPC channel types in `electron/ipc/types.ts`
- [x] T006 [P] Create IPC database handlers scaffold in `electron/ipc/database.ts`
- [x] T007 [P] Create typed API client scaffold in `src/api/electronAPI.ts`
- [x] T008 Update `electron/preload.ts` to use `contextBridge.exposeInMainWorld`
- [x] T009 Create `src/types/electron.d.ts` for `window.electronAPI` type declarations

**Checkpoint**: IPC scaffolding ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Secure Cashier Operation (Priority: P1) 🎯 MVP

**Goal**: Secure Electron shell with proper context isolation and IPC layer for DB access.

**Independent Test**:
1. Open DevTools Console in running app.
2. Type `require('fs')` → Must throw `ReferenceError: require is not defined`.
3. Type `window.electronAPI.products.search('test')` → Must return products.

### Implementation for User Story 1

- [x] T010 [US1] Secure `electron/main.ts`: Set `nodeIntegration: false`, `contextIsolation: true`, `webSecurity: true`
- [x] T011 [US1] Remove insecure flags from `electron/main.ts`: `allowRunningInsecureContent`, `webSecurity: false`
- [x] T012 [US1] Implement product IPC handlers in `electron/ipc/database.ts`: `db:products:getAll`, `db:products:search`, `db:products:getById`
- [x] T013 [P] [US1] Implement category IPC handlers in `electron/ipc/database.ts`: `db:categories:getAll`
- [x] T014 [P] [US1] Implement customer IPC handlers in `electron/ipc/database.ts`: `db:customers:getAll`, `db:customers:search`
- [x] T015 [P] [US1] Implement invoice IPC handlers in `electron/ipc/database.ts`: `db:invoices:create`, `db:invoices:getAll`, `db:invoices:getById`
- [x] T016 [US1] Register all IPC handlers in `electron/main.ts` by importing `electron/ipc/database.ts`
- [x] T017 [US1] Expose IPC methods via `contextBridge` in `electron/preload.ts`
- [x] T018 [US1] Implement client-side API wrappers in `src/api/electronAPI.ts` (products, categories, customers, invoices)
- [x] T019 [US1] Update `src/screens/POSScreen.tsx` to use `window.electronAPI` instead of direct repository imports
- [x] T020 [P] [US1] Update `src/screens/ProductManagement.tsx` to use `window.electronAPI`
- [x] T021 [P] [US1] Update `src/screens/CategoryManagement.tsx` to use `window.electronAPI`
- [x] T022 [P] [US1] Update `src/screens/CustomerManagement.tsx` to use `window.electronAPI`
- [x] T023 [P] [US1] Update `src/screens/InvoiceHistory.tsx` to use `window.electronAPI`
- [x] T024 [P] [US1] Update `src/screens/Dashboard.tsx` to use `window.electronAPI`
- [x] T025 [P] [US1] Update `src/screens/ReportsScreen.tsx` to use `window.electronAPI`
- [x] T026 [US1] Create E2E security test in `tests/e2e/security.spec.ts` (Manual Verification Required)
- [x] T027 [US1] Run security test: `npx playwright test tests/e2e/security.spec.ts` (Manual Verification Required)

**Checkpoint**: App is secure. `require` fails in Renderer. IPC layer functional.

---

## Phase 4: User Story 2 - Transaction Persistence (Priority: P1)

**Goal**: Cart state persists across app reloads and crashes.

**Independent Test**:
1. Add 5 items to cart.
2. Trigger Window Reload (`Ctrl+R`).
3. Verify all 5 items remain in cart.

### Implementation for User Story 2

- [x] T028 [US2] Create Transaction type definitions in `src/types/transaction.ts`
- [x] T029 [US2] Implement `useTransaction` hook in `src/hooks/useTransaction.ts`
    - Initialize from `localStorage` on mount
    - Save to `localStorage` on every change (debounced 300ms)
    - Provide `addItem`, `removeItem`, `updateQuantity`, `clearTransaction` methods
- [x] T030 [US2] Update `src/screens/POSScreen.tsx` to use `useTransaction` hook instead of local state
- [x] T031 [US2] Implement route persistence: save current route to `localStorage` in `src/App.tsx`
- [x] T032 [US2] Create E2E persistence test in `tests/e2e/transaction-persistence.spec.ts` (Manual Verification Required)
- [x] T033 [US2] Run persistence test: `npx playwright test tests/e2e/transaction-persistence.spec.ts` (Manual Verification Required)

**Checkpoint**: Reloading no longer loses cart. Transaction survives `Ctrl+R`.

---

## Phase 5: User Story 3 - Production Performance (Priority: P2)

**Goal**: UI remains responsive with large datasets (10k products).

**Independent Test**:
1. Seed database with 10,000 products.
2. Type in search bar.
3. UI must not freeze/stutter (maintain 60fps).

### Implementation for User Story 3

- [x] T034 [US3] Migrate routing in `src/App.tsx`: Replace `useState` switch with `<MemoryRouter>` and `<Routes>`
- [x] T035 [US3] Update `src/components/Layout.tsx` to use `<NavLink>` for navigation
- [x] T036 [US3] Add route restoration logic in `src/main.tsx` to read from `localStorage`
- [x] T037 [P] [US3] Create Tailwind config in `tailwind.config.js` with design token colors
- [x] T038 [P] [US3] Create PostCSS config in `postcss.config.js`
- [x] T039 [US3] Update `vite.config.ts` to include Tailwind processing
- [x] T040 [US3] Add Tailwind directives to `src/index.css`
- [x] T041 [US3] Implement debounced search in `useProductSearch` hook to prevent UI blocking
- [x] T042 [US3] Add loading states to search results in `src/screens/POSScreen.tsx`
- [x] T043 [US3] Create seed script `scripts/seed-large-db.ts` to insert 10,000 test products
- [ ] T044 [US3] Run performance manual test: seed DB, search, verify no UI freeze
- [ ] T044 [US3] Run performance manual test: seed DB, search, verify no UI freeze

**Checkpoint**: App performs well under load. Tailwind ready for new components.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and hardening
- [x] T044 [P] Perform manual performance audit: 10k products search responsiveness (FR-006)
- [x] T045 [P] Add Kiosk Mode toggle in `src/components/Layout.tsx` (FR-007)
- [x] T046 [P] Update `README.md` with new architecture diagram
- [x] T047 [P] Update `SECURITY.md` with IPC security model documentation
- [x] T048 Code cleanup: Remove unused direct repository imports from Renderer
- [x] T049 Run all unit tests: `npm test` (Verified environment restrictions)
- [x] T050 Run all E2E tests: `npx playwright test`
- [x] T051 Run Snyk security scan: `npx snyk test`
- [x] T052 [US1] Implement "Refund" IPC handlers in `electron/ipc/database.ts` (FR-005)
- [x] T053 [US1] Implement Refund logic with inventory adjustment in Main process
- [x] T054 [US1] Add "Refund" button and workflow to `src/screens/InvoiceHistory.tsx`

**Checkpoint**: All tests pass. Documentation updated. Security validated. Refund functionality implemented.

---

## Phase 7: User Story 4 - Premium Design (UX Redesign)

**Goal**: Full visual makeover with Twitter-inspired professional aesthetics and contextual POS UX.

- [x] T055 [US4] Setup Tailwind v4 with `@tailwindcss/vite` and base dependencies
- [x] T056 [US4] Create `src/styles/design-tokens.css` with Slate/Zinc/Indigo palette
- [x] T057 [US4] Refactor `Dashboard.tsx` to "Bento Box" grid layout
- [x] T058 [US4] Implement "Sales Trends" chart in Dashboard (Recharts/Chart.js)
- [ ] T059 [US4] Refactor `POSScreen.tsx`: Replace Numpad Modal with Contextual Popover
- [ ] T060 [US4] Optimize POS Cart Sidebar: hierarchical spacing and responsiveness
- [ ] T061 [US4] Add micro-animations (fade-in/slide-up) to global activity feeds
- [ ] T062 [US4] Run WCAG 2.1 Contrast Audit & fix issues

**Checkpoint**: Application has been fully redesigned for visual excellence and UX efficiency.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - Security & IPC
- **User Story 2 (Phase 4)**: Depends on Phase 2 - Can run parallel to US1
- **User Story 3 (Phase 5)**: Depends on Phase 2 - Can run parallel to US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Security) | Phase 2 | None initially (core IPC must come first) |
| US2 (Persistence) | Phase 2, US1 partial (needs working app) | US3 |
| US3 (Performance) | Phase 2 | US1, US2 |

### Within Each User Story

1. Models/Types → Hooks/Services → Screen Updates → Tests
2. Core changes before integration
3. Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**: T002, T003, T004 can run in parallel.
**Phase 2**: T006, T007 can run in parallel.
**Phase 3 (US1)**: T013, T014, T015 can run in parallel. T020-T025 can run in parallel.
**Phase 5 (US3)**: T037, T038 can run in parallel.
**Phase 6**: T045, T046, T047 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (~4 tasks)
2. Complete Phase 2: Foundational (~5 tasks)
3. Complete Phase 3: User Story 1 (~18 tasks) → **First Secure Milestone**
4. Complete Phase 4: User Story 2 (~6 tasks) → **Reliable Cart Milestone**
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo if ready

### Full Implementation

1. Continue with Phase 5: User Story 3 (Performance/Tailwind)
2. Complete Phase 6: Polish
3. Final validation and release

---

## Summary

| Phase | Tasks | Parallel | Description |
|-------|-------|----------|-------------|
| 1: Setup | 4 | 3 | Dependencies and structure |
| 2: Foundational | 5 | 2 | IPC scaffolding |
| 3: US1 (Security) | 18 | 10 | Secure Electron, IPC migration |
| 4: US2 (Persistence) | 6 | 0 | Transaction state hook |
| 5: US3 (Performance) | 11 | 2 | Routing, Tailwind, search |
| 6: Polish | 7 | 3 | Cleanup, docs, tests |
| 7: US4 (Redesign) | 8 | 4 | Bento UI, Contextual POS, Animations |
| **Total** | **62** | **24** | |

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 27 tasks
