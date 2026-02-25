# Tasks: JOECASHIER Seller Readiness

This document outlines the specific, actionable tasks required to transform JOECASHIER into a market-ready web application hosted on Vercel.

## 📋 Phase 1: Setup & Environment Recognition
Goal: Prepare the project for dual-target execution (Electron + Web).

- [X] T001 Create environment detection utility in `src/utils/env.ts`
- [X] T002 Add `web-build` script to `package.json` for Vercel deployment
- [X] T003 Ensure `.vercel` is added to `.gitignore`

## 📋 Phase 2: Foundational Data Abstraction
Goal: Decouple business logic from SQLite to enable web-native databases.

- [X] T004 [P] Define generic `BaseRepository<T>` interface in `src/repositories/types.ts`
- [X] T005 [P] Create `WebProductRepository` mock/stub in `src/repositories/web/WebProductRepository.ts`
- [X] T006 Implement repository factory in `src/repositories/Factory.ts` to switch between SQLite and Web based on `platform`

## 📋 Phase 3: User Story 1 - Desktop-Native Feature Fallbacks
Goal: Ensure the app remains functional in a browser without Electron APIs.

- [X] T007 [US1] Update `src/services/PrintService.ts` to use `window.print()` if `electronAPI` is undefined
- [X] T008 [US1] Wrap all `window.electronAPI` calls in `src/services` with existence checks
- [X] T009 [US1] Implement browser-safe "Save as PDF" using browser print dialog fallback

## 📋 Phase 4: User Story 2 - Vercel Hosting & Build
Goal: Successfully deploy a functional web preview.

- [X] T010 [US2] Configure `vite.config.ts` to handle `mode === 'web'` without Electron plugins
- [X] T011 [US2] Create basic `vercel.json` for SPA routing configuration
- [X] T012 [P] [US2] Create public landing page for the Vercel app in `index.html` (if distinct)

## 📋 Phase 5: User Story 3 - Marketing Assets & Strategy
Goal: Create the documentation and guides to convince buyers.

- [X] T013 [US3] Finalize `SALES_README.md` with links to features and demo
- [X] T014 [US3] Generate a "Screenshot Guide" document identifying high-value UI regions for capture
- [X] T015 [US3] Create a `MARKET_ANALYSIS.md` doc detailing the "Why us" vs Shopify pricing

## 📋 Phase 6: Polish & Verification
- [X] T016 Verify `npm run build` works for web target without errors
- [ ] T017 Cross-browser test (Chrome, Safari, Edge) for layout consistency
- [ ] T018 Audit bundle size to ensure fast web loading on Vercel

## 🔗 Dependencies
- T001 → T006
- T006 → T007, T010
- T013 → T015

## ⚡ Parallel Opportunities
- [T004, T005] Can be built simultaneously.
- [T013, T014, T015] Documentation tasks can be done independently of code changes.
- [T007, T008] Can be updated in parallel to refactoring.

## 🚀 Implementation Strategy
1. **Infrastructure First**: Get the environment detection working first (T001).
2. **Graceful Degradation**: Fix printing and API calls so the app doesn't white-screen in browser (T007-T009).
3. **Deployment**: Deploy a "Read-only/Mock" version to Vercel to show the UI (T010-T011).
4. **Sales Assets**: Finalize the README while the build is processing.
