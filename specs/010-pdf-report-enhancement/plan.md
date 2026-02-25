# Implementation Plan: Command Palette (Trigram)

**Branch**: `010-pdf-report-enhancement` | **Date**: 2026-02-11 | **Spec**: [spec.md](file:///c:/Users/PotterParker/Desktop/JOECASHIER/specs/010-pdf-report-enhancement/spec.md)

## Summary

Add a global command palette (`Ctrl+K`) powered by `cmdk` that lets users quickly navigate screens, trigger CRUD actions (add product, add category, add customer), view stock alerts, and generate PDF reports — all from a single searchable interface.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18+
**Primary Dependencies**: `cmdk` (new), `lucide-react`, `react-router-dom`, Tailwind CSS v4
**Storage**: N/A (no new persistence)
**Testing**: Manual + Snyk code scan
**Target Platform**: Electron (Windows desktop)
**Project Type**: Single Electron app
**Constraints**: Must be RTL-aware, must not impact POS screen performance

## Constitution Check

*GATE: Constitution is a blank template — no violations possible. Proceeding.*

## Proposed Changes

### Dependency Installation

#### [NEW] Install `cmdk`
```bash
npm install cmdk
```

---

### Command Palette Core

#### [NEW] [commandActions.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/config/commandActions.ts)

Centralized action registry. Defines all available commands grouped by category:

```typescript
interface CommandAction {
  id: string;
  label: string;            // Arabic display label
  keywords: string[];       // English + Arabic search terms
  icon: React.ReactNode;    // Lucide icon
  group: 'navigation' | 'products' | 'categories' | 'customers' | 'pdf' | 'system';
  action: (ctx: CommandContext) => void | Promise<void>;
  shortcut?: string;
}

interface CommandContext {
  navigate: NavigateFunction;
  printService: PrintService;
  reportService: ReportService;
  settingsService: SettingsService;
  toggleStockAlerts: () => void;
}
```

Groups:
- **Navigation** (8 items): POS, Dashboard, Products, Categories, Customers, Invoices, Reports, Settings
- **Products** (3 items): Add Product, View Products, Stock Alerts
- **Categories** (2 items): Add Category, View Categories
- **Customers** (2 items): Add Customer, View Customers
- **PDF Reports** (4 items): Sales PDF, Inventory PDF, Customer List PDF, Invoice History PDF
- **System** (2 items): Toggle Fullscreen, Archive Data

---

#### [NEW] [CommandPalette.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/components/CommandPalette.tsx)

The main UI component:
- Uses `Command.Dialog` from `cmdk`
- Listens for `Ctrl+K` globally
- Renders grouped actions with icons, labels, and shortcut badges
- RTL layout with glassmorphic backdrop
- Closes on action selection

---

#### [NEW] [CommandPalette.css](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/components/CommandPalette.css)

Styling using `[cmdk-*]` attribute selectors:
- Dark glassmorphic overlay (`backdrop-filter: blur(8px)`)
- Rounded dialog with subtle shadow
- Highlighted active item with gradient
- Arabic typography (Cairo font)
- Smooth fade-in/slide-up animation

---

### Integration Layer

#### [MODIFY] [Layout.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/components/Layout.tsx)

- Import and mount `<CommandPalette />` alongside existing children
- Pass `navigate`, service instances, and `toggleStockAlerts` as context
- Add a small `Ctrl+K` hint badge in the sidebar header

---

### Screen-Level Action Receivers

#### [MODIFY] [ProductManagement.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/screens/ProductManagement.tsx)

- Read `?action=add` from URL search params on mount
- If present, auto-open the "Add Product" modal
- Clear the param after handling

#### [MODIFY] [CategoryManagement.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/screens/CategoryManagement.tsx)

- Same pattern: read `?action=add` → auto-open "Add Category" modal

#### [MODIFY] [CustomerManagement.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/screens/CustomerManagement.tsx)

- Same pattern: read `?action=add` → auto-open "Add Customer" modal

---

### PDF Report Generators

#### [NEW] [ReportPDFService.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/services/ReportPDFService.ts)

Dedicated service to generate styled HTML for various reports:
- `generateSalesReportHTML(data, businessInfo)` → Sales report HTML
- `generateInventoryReportHTML(data, businessInfo)` → Inventory report HTML
- `generateCustomerListHTML(customers, businessInfo)` → Customer list HTML

Each method returns a complete HTML string with inline RTL styles, ready for `PrintService.saveHtmlAsPDF`.

---

## Project Structure

```text
src/
├── components/
│   ├── CommandPalette.tsx      [NEW] - Main command palette UI
│   ├── CommandPalette.css      [NEW] - Glassmorphic styling
│   └── Layout.tsx              [MODIFY] - Mount palette + hint badge
├── config/
│   └── commandActions.ts       [NEW] - Action registry
├── services/
│   └── ReportPDFService.ts     [NEW] - HTML generators for PDF reports
└── screens/
    ├── ProductManagement.tsx    [MODIFY] - URL param action receiver
    ├── CategoryManagement.tsx   [MODIFY] - URL param action receiver
    └── CustomerManagement.tsx   [MODIFY] - URL param action receiver
```

## Verification Plan

### Automated
- `npm run lint` — No new lint errors
- Snyk code scan on all new/modified files

### Manual
1. Press `Ctrl+K` from POS screen → palette opens
2. Type "منتج" → filtered to product-related actions
3. Select "إضافة منتج" → navigates to Products with Add modal open
4. Open palette → select "تقرير المبيعات PDF" → save dialog appears → PDF saved
5. Verify RTL layout, icon alignment, animation smoothness
6. Press `Escape` → palette closes
7. Repeat `Ctrl+K` from every screen to verify global availability
