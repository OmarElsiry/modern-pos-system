# Tasks: Settings Screen Refactor

**Input**: Design documents from `/specs/008-settings-refactor/`
**Prerequisites**: plan.md, spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and code cleanup before refactor

- [x] T001 Remove unused imports (Printer, Bell) and legacy CSS classes from `src/screens/SettingsScreen.tsx`
- [x] T002 Verify `SettingsService` methods (`getSettings`, `updateSettings`) in `src/services/SettingsService.ts` function correctly
- [x] T003 Ensure `SystemSettings` interface in `src/types/models.ts` matches required fields

---

## Phase 2: User Story 1 - Store Information Design (Priority: P1) 🎯 MVP

**Goal**: Implement the responsive Bento Grid layout and modernize the Store Information section.

**Independent Test**: Navigate to Settings and see a 3-column grid layout with a polished "Store Information" card using ShadCN inputs.

### Implementation for User Story 1

- [x] T004 [US1] Implement Bento Grid layout wrapper (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) in `src/screens/SettingsScreen.tsx`
- [x] T005 [US1] Create "Store Information" Card using ShadCN `Card` components in `src/screens/SettingsScreen.tsx`
- [x] T006 [US1] Replace native inputs with ShadCN `Input` components for Store Name and Address in `src/screens/SettingsScreen.tsx`

**Checkpoint**: Core layout structure is in place and Store Info is modernized.

---

## Phase 3: User Story 2 - Telegram Integration Refactor (Priority: P2)

**Goal**: Modernize the Telegram integration configuration with proper toggles and validation.

**Independent Test**: Enable/Disable the Telegram bot using the Switch component and verify state persistence.

### Implementation for User Story 2

- [x] T007 [US2] Create "Telegram Integration" Card using ShadCN `Card` components in `src/screens/SettingsScreen.tsx`
- [x] T008 [US2] Implement the polling toggle using ShadCN `Switch` component in `src/screens/SettingsScreen.tsx`
- [x] T009 [US2] Add visual validation feedback for Bot Token and Chat ID fields in `src/screens/SettingsScreen.tsx`

**Checkpoint**: Telegram settings are user-friendly and consistent with the new design.

---

## Phase 4: User Story 3 - Archiving & System Features (Priority: P2)

**Goal**: Update Archiving, Kiosk, and Theme controls to match the premium aesthetic.

**Independent Test**: Click "Archive Now" and see a proper loading state and success toast. Toggle Kiosk mode effectively.

### Implementation for User Story 3

- [x] T010 [US3] Create "Archiving & Automation" Card using ShadCN `Card` components in `src/screens/SettingsScreen.tsx`
- [x] T011 [US3] Implement "Archive Now" button with loading state (Spinner/Loader) in `src/screens/SettingsScreen.tsx`
- [x] T012 [US3] Add "Kiosk Mode" toggle card or section using ShadCN `Switch` in `src/screens/SettingsScreen.tsx`
- [x] T013 [US3] Ensure manual backup controls (if any) are styled consistently in `src/screens/SettingsScreen.tsx`

**Checkpoint**: All system utilities are fully modernized and accessible.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final visual refinements and consistency checks.

- [x] T014 [US4] Verify zero linting errors with `npm run lint` in `src/screens/SettingsScreen.tsx`
- [x] T015 [US4] Verify RTL layout logic (dir="rtl" is applied on wrapper) in `src/screens/SettingsScreen.tsx`
- [x] T016 [US4] Verify contrast ratios and accessibility of new components in `src/screens/SettingsScreen.tsx`
- [x] T017 [US4] Validate responsive behavior (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) in `src/screens/SettingsScreen.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: Must complete first.
2. **User Story 1 (Phase 2)**: Establishes the grid layout.
3. **User Story 2 (Phase 3)**: Fits into the grid layout.
4. **User Story 3 (Phase 4)**: Fits into the grid layout.
5. **Polish (Phase 5)**: Final clean-up.
