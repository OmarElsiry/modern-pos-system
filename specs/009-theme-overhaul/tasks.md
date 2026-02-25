# Tasks: Global Dark Theme Overhaul (009-theme-overhaul)

## Phase 1: Foundation
- [ ] **T1.1**: Centralize theme variables in `src/index.css`. Add `.dark` overrides for all semantic tokens.
- [ ] **T1.2**: Update `src/styles/design-tokens.css` to use CSS variables instead of hardcoded hex values for `app-bg`, `card-bg`, etc.

## Phase 2: Layout Cleanup
- [ ] **T2.1**: Remove all hardcoded hex color values from `src/components/Layout.css`. Use new semantic variables.
- [ ] **T2.2**: Update `Layout.tsx` and its sidebar items to use the refined theme tokens.

## Phase 3: Screen Refactoring
- [ ] **T3.1**: Update `src/screens/Dashboard.tsx` to use semantic Tailwind classes (`bg-card`, `text-foreground`).
- [ ] **T3.2**: Update `src/screens/POSScreen.tsx` to ensure the sales area and numpad look professional in dark mode.
- [ ] **T3.3**: Update `src/screens/CustomerManagement.tsx` and `src/screens/InvoiceHistory.tsx` (Bento Grid elements) to support dark mode.

## Phase 4: IDE Fixes (Bonus)
- [ ] **T4.1**: Fix `jest` linter errors in `src/database/__mocks__/connection.ts`.
- [ ] **T4.2**: Fix `purchasePrice` linter errors in `tests/unit/repositories/ProductRepository.test.ts`.

## Phase 5: Verification
- [ ] **T5.1**: Toggle theme and check visual consistency.
