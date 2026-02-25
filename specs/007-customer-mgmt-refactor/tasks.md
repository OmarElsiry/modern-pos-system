# Tasks: Premium Customer Management Refactor

**Input**: Design documents from `/specs/007-customer-mgmt-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Remove legacy `src/screens/CustomerManagement.css` and its import in the TSX file
- [X] T002 Verify existence of Shadcn UI Table, Dialog, and Button components in `src/components/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure needed before UI refactor

- [X] T003 Ensure `src/services/CustomerService.ts` is correctly providing `getAllCustomers` for the new UI data fetch

---

## Phase 3: User Story 1 - Premium Overview & Bento Stats (Priority: P1) 🎯 MVP

**Goal**: Implement the high-level Bento-grid header with customer analytics.

**Independent Test**: Navigate to the Customers screen and see 4 distinct stat cards (Total, New this month, etc.) with correct data.

### Implementation for User Story 1

- [X] T004 [US1] Define local state for customer statistics in `src/screens/CustomerManagement.tsx`
- [X] T005 [US1] Implement the calculation logic for "Total Customers" and "Monthly New" in a `useMemo` or `useEffect` in `src/screens/CustomerManagement.tsx`
- [X] T006 [US1] Create the Bento-style header section with 4 Stat Cards using `Card` components in `src/screens/CustomerManagement.tsx`
- [X] T007 [US1] Add Lucide React icons (Users, UserPlus, TrendingUp) to the stat cards for visual parity with Dashboard

**Checkpoint**: Header section is complete and visually matches the Dashboard's Bento grid.

---

## Phase 4: User Story 2 - High-Performance Responsive Data Grid (Priority: P1)

**Goal**: Replace the legacy DataGrid with a polished, searchable Shadcn Table.

**Independent Test**: Use the search bar to filter customers instantly. Verify table columns are responsive on smaller viewports.

### Implementation for User Story 2

- [X] T008 [US2] Implement the Search/Control Bar with a rounded search input in `src/screens/CustomerManagement.tsx`
- [X] T009 [US2] Migration: Replace `<DataGrid />` with Shadcn `<Table>` structure in `src/screens/CustomerManagement.tsx`
- [X] T010 [US2] Add custom row rendering for Customer Name + Phone with the established premium padding in `src/screens/CustomerManagement.tsx`
- [X] T011 [US2] Implement real-time client-side filtering logic for the list in `src/screens/CustomerManagement.tsx`

**Checkpoint**: Main customer list is high-performance, searchable, and follows the new premium design tokens.

---

## Phase 5: User Story 3 - Interactive Purchase History Breakdown (Priority: P2)

**Goal**: Refactor the customer history view into a modern, detailed modal.

**Independent Test**: Click "View History" on any customer and see their purchase history in a premium modal dialog.

### Implementation for User Story 3

- [X] T012 [US3] Refactor the customer history modal to use Radix UI `<Dialog>` in `src/screens/CustomerManagement.tsx`
- [X] T013 [US3] Implement a "View" action button in the table rows using the Eye icon in `src/screens/CustomerManagement.tsx`
- [X] T014 [US3] Style the history list inside the modal to match the new invoice history aesthetics

**Checkpoint**: Full customer management lifecycle (CRUD + History) is functional in the new UI.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final visual refinements and consistency checks.

- [X] T015 Ensure RTL support (Arabic) is fully functional for all new UI elements
- [X] T016 [P] Verify contrast accessibility (WCAG 2.1) for the new slate/indigo color scheme
- [X] T017 Run `npm test` and `npm run lint` to ensure no regressions were introduced
- [X] T018 Validate the screen in Kiosk mode (Electron) for layout clipping

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: Must complete first.
2. **Foundational (Phase 2)**: Very light in this refactor, but must be confirmed.
3. **User Story 1 (Phase 3)**: Implements the main layout shell.
4. **User Story 2 (Phase 4)**: Implements the core data list.
5. **User Story 3 (Phase 5)**: Implements secondary interactions.
6. **Polish (Phase 6)**: Final clean-up.

### Parallel Opportunities

- T001 and T002 can be checked individually.
- Once the shell in T006 is created, work on T004/T005 (logic) can happen independently from styling T007.

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Setup & Basic Refactor.
2. Implement User Story 1 (Headings/Stats).
3. Implement User Story 2 (List/Search).
4. **VALIDATE**: Screen is functional and visually consistent with Product Management.
5. Add User Story 3 (History) as a secondary enhancement.
