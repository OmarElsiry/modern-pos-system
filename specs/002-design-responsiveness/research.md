# Research: Design Responsiveness

**Feature Branch**: `002-design-responsiveness`
**Date**: 2026-02-08

## Research Areas

### 1. Responsive Sidebar Patterns for Electron Apps

**Decision**: Implement hamburger menu with slide-out overlay on mobile.

**Rationale**:
- Standard pattern users expect on mobile
- Maximizes screen real estate for POS operations
- Works well with touch gestures

**Alternatives Considered**:
- Bottom navigation bar: Rejected—takes vertical space needed for product grid
- Collapsible icon-only sidebar: Rejected—still takes ~80px horizontal space

---

### 2. Mobile Cart Bottom Sheet Implementation

**Decision**: Use CSS `transform: translateY()` with touch gesture detection.

**Rationale**:
- Existing `POSScreen.css` already has the foundation (lines 520-537)
- Native feel without additional library dependency
- Can leverage existing `swipeTranslation` state logic

**Implementation Pattern**:
```css
/* Bottom sheet states */
.cart-section {
  transform: translateY(calc(100% - 80px)); /* Peek state */
}
.cart-section.expanded {
  transform: translateY(0); /* Full state */
}
```

---

### 3. Touch Target Size Standards

**Decision**: Enforce 44×44px minimum per Apple HIG and WCAG 2.1.

**Current Violations**:
- Quantity buttons: 28×28px (needs increase to 44×44px)
- Mobile handle bar: 12×4px (needs larger tap area)

**Fix Approach**:
- Increase button padding, not just icon size
- Add invisible hit areas if visual design requires smaller elements

---

### 4. Typography Scale System

**Decision**: Implement modular scale (1.25 ratio) with fluid sizing.

**Recommended Scale**:
| Name | Size | Usage |
|------|------|-------|
| text-xs | 0.75rem (12px) | Metadata, timestamps |
| text-sm | 0.875rem (14px) | Secondary labels |
| text-base | 1rem (16px) | Body text, inputs |
| text-lg | 1.125rem (18px) | Emphasis, prices |
| text-xl | 1.25rem (20px) | Section headings |
| text-2xl | 1.5rem (24px) | Page titles |
| text-3xl | 1.875rem (30px) | Hero numbers |

---

### 5. CSS Architecture Consolidation

**Decision**: Migrate to Tailwind-first approach, phase out custom `.css` files.

**Rationale**:
- Tailwind v4 already installed and configured
- Custom CSS causing specificity conflicts
- Design tokens can be defined in Tailwind theme

**Migration Strategy**:
1. Keep shadcn/ui components (already Tailwind-based)
2. Convert screen-specific CSS to Tailwind utilities inline
3. Move design tokens to `tailwind.config.js` or `@theme` block in `index.css`

---

### 6. Breakpoint Strategy

**Decision**: Use Tailwind's default breakpoints with mobile-first approach.

| Breakpoint | Width | Layout |
|------------|-------|--------|
| default | 0-639px | Single column, bottom sheet cart |
| sm | 640px+ | 2-col Bento grid |
| md | 768px+ | Sidebar visible, cart drawer |
| lg | 1024px+ | Full two-panel POS layout |
| xl | 1280px+ | Wider cart, larger product cards |
| 2xl | 1536px+ | Maximum content width |

---

## Technology Decisions Summary

| Area | Decision | Justification |
|------|----------|---------------|
| Sidebar Mobile | Hamburger overlay | Standard UX, maximizes space |
| Cart Mobile | Bottom sheet | Already partially implemented |
| Touch Targets | 44×44px minimum | WCAG + Apple HIG compliance |
| Typography | 1.25 modular scale | Harmonious visual hierarchy |
| CSS Architecture | Tailwind-first | Already installed, reduces conflicts |
| Breakpoints | Tailwind defaults | Industry standard, mobile-first |
