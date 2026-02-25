
# Research: Invoice Designer Enhancements

## Goals
1. **Drag & Drop**: Move elements freely on the canvas.
2. **Resizing**: Resize elements (width/height).
3. **Templates**: Pre-defined layouts.
4. **Usability**: Improved controls and visuals (handles).

## Implementation Strategy

### 1. Drag & Drop & Resizing
We will use **`react-moveable`** or a combination of **`react-draggable`** and **`react-resizable`**.
Given the requirement for "premium" feel and handles, `react-moveable` is excellent but might be complex.
A simpler approach with `react-draggable` + `react-resizable` is standard.

However, since we want to avoid too many heavy dependencies, a custom hook `useDraggable` and `useResizable` using pointer events is often cleaner for this specific use case (percentage-based positioning).
Libraries often work in pixels, requiring constant conversion.
**Decision**: Use **`react-draggable`** for reliability, converting pixels to % on stop.
**Decision**: Use **`react-resizable`** for resizing.

Wait, if dependencies are not present, we should ask to install them.
If we want a ZERO dependency solution (to keep it lightweight), we can write a robust `useInteractive` hook.

### 2. "Vertical or Horizontal" (Lines)
- Add `rotation` or `orientation` to `InvoiceElement`.
- For lines: Toggle 'horizontal' (width 100%, height 2px) vs 'vertical' (width 2px, height 100%).

### 3. Templates
- Create a `TemplateSelector` modal.
- Define 3-4 presets:
  - **Standard A4**: Classic top-logo, items table, footer.
  - **Minimal A4**: Clean, less borders.
  - **Thermal**: Compact width.
  - **Modern**: Colored headers (requires adding background color support?).

## Schema Updates
No DB schema changes needed if we store the template as JSON in `settings` (already doing this).
We might need to add `rotation` property to `InvoiceElement` interface.

```typescript
export interface InvoiceElement {
  // ... existing
  rotation?: number; // 0, 90, 180, 270
}
```
