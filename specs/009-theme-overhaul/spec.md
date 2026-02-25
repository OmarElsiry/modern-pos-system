# Feature Specification: Global Dark Theme Overhaul (009-theme-overhaul)

## Overview
The current theme implementation is inconsistent. Toggling "Dark Mode" only affects certain elements due to hardcoded hex values in CSS files and literal Tailwind classes in JSX. The goal is to implement a unified semantic theme system that ensures the entire application adapts cohesively to light and dark modes.

## Functional Requirements
1. **Unified Background**: The entire application background (Layout, Sidebar, Content) must flip correctly between light and dark variants.
2. **Semantic Elements**: All text, borders, cards, and interactive elements must use semantic classes that respond to the `.dark` class.
3. **No "Stupid" Containers**: Identify and replace hardcoded "white" or "black" backgrounds that create visual artifacts when the theme shifts.
4. **Premium Aesthetics**: Ensure the dark theme uses a sophisticated palette (Slate-950/Zinc-950 bases) rather than flat black, maintaining the "Premium" user rule.

## Technical Requirements
1. **Tailwind CSS v4 Integration**: Leverage the `@theme` block in `index.css` to define variables.
2. **CSS Variable Strategy**: Move all theme-dependent colors (App Background, Sidebar Background, Card Background) to CSS variables that swap in the `.dark` block.
3. **Layout Refactor**: Remove hardcoded color values from `Layout.css`.
4. **Consistency Pass**: Update core screens (Dashboard, POS, Settings, Customer Management) to use semantic theme tokens.

## Design Tokens

| Token | Light Value | Dark Value | Purpose |
|-------|-------------|------------|---------|
| `--background` | `0 0% 100%` (White) | `222.2 47.4% 1%` (Slate-950) | Main app bg |
| `--sidebar` | `0 0% 100%` (White) | `222.2 47.4% 2%` (Slate-900) | Sidebar bg |
| `--card` | `0 0% 100%` (White) | `217.2 32.6% 8%` (Slate-900) | Card/Surface bg |
| `--border` | `214.3 31.8% 91.4%` (Slate-200) | `217.2 32.6% 17.5%` (Slate-800) | Generic borders |
| `--text-main` | `222.2 84% 4.9%` (Slate-900) | `210 40% 98%` (Slate-50) | Body text |

## Implementation Traceability

| ID | Description | Component/File |
|----|-------------|----------------|
| TR-01 | Semantic CSS Variable Definitions | `index.css` |
| TR-02 | Sidebar & Layout Variable Injection | `Layout.css` |
| TR-03 | Component Surface Cleanup | `Dashboard.tsx`, `POSScreen.tsx` |
| TR-04 | Logic Correction for data-theme | `useTheme.ts` |
