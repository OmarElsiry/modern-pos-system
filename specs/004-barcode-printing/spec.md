# Specification: Barcode Label Printing

## 1. Overview
The Barcode Label Printing feature allows users to generate and print barcode stickers for their products. This is essential for retail operations to scan items at the POS. The system will support standard thermal label sizes and allow customization of the label content (price, name).

## 2. User Stories
- **US1**: As a store manager, I want to print a barcode label for a specific product so I can stick it on the item.
- **US2**: As a user, I want to specify the number of labels to print (e.g., 10 copies for 10 items).
- **US3**: As a user, I want to choose the label size (e.g., 40x25mm, 50x30mm) to match my printer paper.
- **US4**: As a user, I want to toggle whether to print the price and product name on the label.
- **US5**: As a user, I want to preview the label before printing to ensure it looks correct.

## 3. Technical Requirements

### 3.1 Libraries
- **Barcode Generation**: `jsbarcode` (Lightweight, supports Code128).
- **Printing**: Browser's native print dialog (`window.print()`).

### 3.2 Data Structures
Existing `LabelData` interface in `models.ts`:
```typescript
export interface LabelData {
  product: Product;
  includePrice: boolean;
  labelSize: 'small' | 'medium' | 'large';
  quantity: number; // Added
}
```

### 3.3 Components
- **`BarcodeLabel.tsx`**: A component that renders a single label using SVG/Canvas.
- **`LabelPrintModal.tsx`**: Validation & Configuration dialog.
- **`ProductManagement.tsx`**: Integration point (Add "Print Label" action).

### 3.4 Print Logic
- Generate a hidden iframe or new window.
- Render the requested number of `BarcodeLabel` components.
- Apply CSS `@media print` rules to ensure page breaks and dimensions match thermal printers.
- **Responsive Sizes**:
  - Small: 38mm x 25mm
  - Medium: 50mm x 30mm
  - Large: 100mm x 150mm (Shipping label style - optional)

## 4. UI/UX Design
- **Entry Point**: Icon/Button in the Actions column of the Product Table.
- **Modal**:
  - **Header**: "Print Labels: [Product Name]"
  - **Preview**: Live rendering of the barcode label.
  - **Controls**:
    - Quantity (Number input, default 1).
    - Size (Dropdown).
    - "Show Price" (Checkbox).
    - "Show Name" (Checkbox).
  - **Footer**: "Print" (Primary), "Cancel" (Secondary).

## 5. Constraints
- Barcode format: Code128 (Auto).
- Browser print dialog limitations (User must select correct paper size in printer settings).
- No direct hardware communication (USB/Serial) in this phase; purely OS-level printing.

## 6. Success Criteria
- User can open print dialog for any product.
- Barcode is readable by standard scanners.
- Labels print correctly on thermal printers (if OS settings correct).
- Pricing and Name are optionally visible.
