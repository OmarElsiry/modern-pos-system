# Feature Specification: Premium Customer Management Refactor

**Feature Branch**: `007-customer-mgmt-refactor`  
**Created**: 2026-02-10  
**Status**: Draft  
**Input**: Refactor the legacy Customer Management screen into a modern, premium Bento UI using Tailwind CSS v4 and consistent design tokens.

## User Scenarios & Testing

### User Story 1 - Premium Overview & Bento Stats (Priority: P1)

As an administrator, I want to see a high-level summary of my customer base immediately when opening the management screen, so I can understand my business reach at a glance.

**Why this priority**: Essential for the "JOECASHIER Premium" brand identity and provides immediate value over the legacy flat list.

**Independent Test**: Can be tested by navigating to `/customers` and verifying the presence and accuracy of 4 stat cards.

**Acceptance Scenarios**:
1. **Given** 150 total customers, **When** the screen loads, **Then** I should see a card displaying "150" for total customers.
2. **Given** 10 new customers this month, **When** the screen loads, **Then** I should see a "Monthly New" card with "+10" indicator.

---

### User Story 2 - High-Performance Responsive Data Grid (Priority: P1)

As a cashier/manager, I want to quickly search and filter my customer list with zero lag, so I can find client details during a busy shift.

**Why this priority**: Core functional requirement for daily operations.

**Independent Test**: Can be tested by typing a partial name in the search bar and observing instantaneous filtering (<50ms).

**Acceptance Scenarios**:
1. **Given** a list of 1000 customers, **When** I type "Amr", **Then** the grid should only show customers named "Amr" or with matching phone numbers.
2. **Given** a mobile device, **When** I view the grid, **Then** the columns should stack or scroll gracefully without breaking the layout.

---

### User Story 3 - Interactive Purchase History Breakdown (Priority: P2)

As a manager, I want to view a detailed modal of a customer's purchase history with visual charts/lists, so I can provide personalized service or handle loyalty inquiries.

**Why this priority**: Deepens the "Management" aspect of the screen beyond simple CRUD.

**Independent Test**: Can be tested by clicking "View History" on a customer row and verifying the modal content.

**Acceptance Scenarios**:
1. **Given** a customer with 5 past invoices, **When** I open their history, **Then** I should see a list of those 5 invoices with dates and totals.

---

### Edge Cases

- **Duplicate Phone Numbers**: System should alert but not crash when adding a number that already exists if DB constraints allow it, or block if unique index is enforced.
- **Empty State**: Screen should show a beautiful "No Customers Yet" illustration instead of a blank table.
- **Search with Special Characters**: Arabic text and non-latin characters should be handled correctly in search.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a "Bento-style" dashboard layout for customer metrics.
- **FR-002**: System MUST implement a real-time fuzzy search across name, phone, and email.
- **FR-003**: System MUST provide Add/Edit/Delete actions using consistent Radix UI / Shadcn patterns.
- **FR-004**: System MUST maintain RTL support (Arabic) throughout the interface.
- **FR-005**: System MUST utilize `CustomerService.ts` for all data operations to ensure single source of truth.

### Key Entities

- **Customer**: 
  - ID (UUID)
  - Name (String, Required)
  - Phone (String, Required)
  - Email (String, Optional)
  - Total Spend (Calculated)
  - Last Visit (Date)
  - Address (String, Optional)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Page load to interactive (TTI) under 300ms.
- **SC-002**: Search response time under 100ms for up to 5000 records.
- **SC-003**: 100% UI consistency with the `ProductManagement` and `Dashboard` screens (colors, corner radii, shadows).
- **SC-004**: Zero accessibility violations (WCAG 2.1) in the new design.

