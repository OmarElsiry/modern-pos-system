# Research: Customer Management Visual Refactor

## Decision: Shadow-based Bento UI with Shadcn Tables

### Rationale
To maintain 100% visual parity with the recently updated `ProductManagement.tsx` and `Dashboard.tsx`, we will move away from the generic `DataGrid.tsx` and migrate to a native Shadcn `Table` implementation. This allows for:
-   **Granular Styling**: Easier use of Tailwind v4 classes for row hovering, group effects, and group-hover opacity.
-   **Consistent Transitions**: Matching the `group-hover:opacity-100` pattern for row actions.
-   **Premium Shadows**: Using the `rounded-3xl` and `shadow-sm` patterns documented in the current design system.

### Alternatives Evaluated
-   **Option A: Update DataGrid.tsx**: Rejected because it's used globally and changing its base styles might break legacy screens (e.g. Categories) that haven't been migrated yet.
-   **Option B: Use Shadcn Table**: Selected because it's a proven pattern in the codebase (`ProductManagement.tsx`) and provides the necessary flexibility for the premium look.

## Key Design Tokens to Reuse (from Dashboard.tsx)

| Element | Pattern |
|---------|---------|
| **Stat Cards** | `bg-white border border-slate-200 p-6 rounded-2xl shadow-sm` |
| **Header** | `text-4xl font-black text-slate-900` |
| **Search/Filter Bar** | `bg-white p-5 rounded-3xl border border-slate-200` |
| **Table Container** | `Card` with `border-slate-200 overflow-hidden rounded-3xl bg-white` |

## Integration Strategy (DataGrid vs Table)
We will implement the table directly in `CustomerManagement.tsx` using the `Table` UI primitives to allow for custom rendering of:
-   **Customer Name + Initial Avatar**: Using `h-12 w-12 rounded-xl bg-slate-100`.
-   **Status Badges**: For high-value or frequent customers.
-   **Action Icons**: History (Eye/FileText), Edit (Pencil), Delete (Trash2).

## Research Findings: Extensibility of DataGrid
`DataGrid.tsx` supports `renderCell`, which would suffice for some UI, but the overall wrapper structure of `DataGrid.tsx` (defined in `DataGrid.css`) is too rigid for the floating "Bento" look we want to achieve.
Decision: **Bypass DataGrid.tsx for this screen.**
