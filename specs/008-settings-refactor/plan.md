# Implementation Plan: Settings Screen Refactor (008-settings-refactor)

## Technical Context

- **Feature**: Modernization of the Settings Screen UI (`src/screens/SettingsScreen.tsx`).
- **Input**: Existing source code, `SettingsService` logic, `SystemSettings` type.
- **Dependencies**: Lucide React, ShadCN UI (`Card`, `Input`, `Switch`, `Button`).
- **Patterns**: Bento Grid layout, consistent with `007-customer-mgmt-refactor`.
- **Gatekeeper**: `npm run lint` && `npm test`.

## Constitution Check

- **Library First**: ✓ Using Lucide, ShadCN, Tailwind v4.
- **CLI Standard**: ✓ Existing CLI commands can be used (e.g., `npm run lint`).
- **Test First**: ✓ TDD approach for utility functions if needed.

## Gates

- [X] **Research Complete**: (Skipped; straightforward refactor)
- [ ] **Design Complete**: Spec and Requirements defined.
- [ ] **Data Model Validated**: `SystemSettings` type is unchanged.
- [ ] **All Requirements Covered**: Spec covers all current settings.

## Phase 1: Setup & Housekeeping

- [ ] **T001**: Clean up `SettingsScreen.tsx` imports and remove unused legacy code.
- [ ] **T002**: Verify existing `SettingsService` methods (`getSettings`, `updateSettings`).
- [ ] **T003**: Ensure `SystemSettings` type definition matches the required fields.

## Phase 2: User Story 1 - Store Information Design

- [ ] **T004 [US1]**: Update `SettingsScreen.tsx` layout to use a Bento Grid (3 columns on desktop).
- [ ] **T005 [US1]**: Refactor "Store Information" section into a dedicated `Card` component.
- [ ] **T006 [US1]**: Replace old inputs with ShadCN `Input` components.

## Phase 3: User Story 2 - Telegram Integration Refactor

- [ ] **T007 [US2]**: Refactor "Telegram Integration" section into a dedicated `Card` component.
- [ ] **T008 [US2]**: Implement the polling toggle using ShadCN `Switch`.
- [ ] **T009 [US2]**: Add validation for Bot Token and Chat ID fields.

## Phase 4: User Story 3 - Archiving & Features

- [ ] **T010 [US3]**: Refactor "Archiving & Automation" into a dedicated `Card` component.
- [ ] **T011 [US3]**: Implement the "Archive Now" button with proper loading state and icon.
- [ ] **T012 [US3]**: Add "Kiosk Mode" toggle (if desired in Settings) or ensure consistent layout with Sidebar controls.
- [ ] **T013 [US3]**: Move "Theme Toggle" to Settings (optional, or duplicate for convenience).

## Phase 5: Polish & Validation

- [ ] **T014**: Fix any remaining linting errors (`npm run lint`).
- [ ] **T015**: Ensure RTL layout is correct (padding/margins).
- [ ] **T016**: Verify responsive behavior on tablet/mobile breakpoints.
- [ ] **T017**: Confirm all settings save correctly and persist after reload.

## Status

- **Phase 0**: Complete (Spec created).
- **Phase 1**: Pending.
- **Phase 2-5**: Pending.
