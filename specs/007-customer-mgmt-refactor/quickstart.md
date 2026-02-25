# Quickstart: 007-customer-mgmt-refactor

## Development Setup

1.  **Branch**: Ensure you are on `007-customer-mgmt-refactor`.
2.  **Styles**: Verify Tailwind CSS v4 is active in `index.css`.
3.  **Run**: `npm run dev` to start the development server.

## Viewing the New Screen

1.  Open the application.
2.  Navigate to **العملاء** (Customers) via the sidebar.
3.  Alternatively, click the **العملاء** button in the **إجراءات البيانات** (Data Actions) card on the Dashboard.

## Implementation Guide for Developers

### Layout Components
- Use `Card` from `@/components/ui/card` for Bento containers.
- Use `Button` from `@/components/ui/button` for consistency.
- Table headers should use `text-slate-400 font-black text-[10px] uppercase`.

### Data Flow
1. Fetch all customers via `customerService.getAllCustomers()`.
2. Calculate stats (Total, Trending, etc.) in the `useEffect` following the pattern in `Dashboard.tsx`.
3. Render the list using `@/components/ui/table`.

### Features to Verify
- [ ] **Search Box**: Real-time filtering with `Lucide Search` icon.
- [ ] **Stat Cards**: Total customers count displayed prominently.
- [ ] **Empty State**: Beautiful placeholder when no data matches.
- [ ] **Responsive View**: Desktop (max 1600px) and Mobile friendliness.
