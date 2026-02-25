# Research: Command Palette (Trigram)

## 1. Library Selection

### Decision: `cmdk` (pacocoursey/cmdk)
### Rationale
- **Fast & unstyled**: Gives full styling control to match JOECASHIER's premium design system.
- **Accessible**: Built-in ARIA roles, keyboard navigation, and screen reader support.
- **Composable API**: `Command.Dialog`, `Command.Group`, `Command.Item` pattern fits our grouped-actions architecture.
- **Lightweight**: ~3KB gzip, zero runtime dependencies.
- **Production-proven**: Used by Vercel, Linear, Raycast.

### Alternatives Considered
| Library | Why Rejected |
|---------|-------------|
| `react-cmdk` | Opinionated styling, harder to match our glassmorphic design |
| `kbar` | Heavier, more complex API, less active maintenance |
| Custom implementation | Unnecessary effort; `cmdk` handles fuzzy search, keyboard nav, and a11y out of the box |

## 2. Action Dispatch Architecture

### Decision: Centralized Action Registry + React Context
### Rationale
- A single `CommandAction[]` array defined in a dedicated file (`commandActions.ts`) makes actions declarative, testable, and easy to extend.
- A `CommandPaletteContext` provides the `open/close` state and action registry to the entire app.
- Screens can register/deregister dynamic actions (e.g., "Refund this invoice" only when viewing an invoice).

### Alternatives Considered
| Approach | Why Rejected |
|----------|-------------|
| Event bus (mitt/eventemitter) | Harder to type, no React lifecycle integration |
| Redux/Zustand store | Over-engineering for a UI-only feature with no persistent state |
| Direct imports in Layout | Couples navigation logic to the palette component |

## 3. Cross-Screen Action Triggers

### Decision: URL-based navigation + query params for modal triggers
### Rationale
- Navigation actions use `react-router-dom`'s `useNavigate`.
- Modal-opening actions navigate to the target screen with a query parameter (e.g., `/products?action=add`), which the screen reads on mount to auto-open its modal.
- PDF actions call `PrintService.saveHtmlAsPDF` directly — no screen transition needed.

### Alternatives Considered
| Approach | Why Rejected |
|----------|-------------|
| Global modal state (context) | Would require every screen's modals to be mounted globally — heavy |
| Custom events on `window` | Fragile, not type-safe, hard to debug |

## 4. RTL & Styling

### Decision: Custom CSS with Tailwind utilities on `cmdk` slots
### Rationale
- `cmdk` renders unstyled HTML with `[cmdk-*]` attribute selectors, giving us full control.
- We use `direction: rtl` on the dialog container.
- Glassmorphic backdrop + dark overlay matches the app's premium aesthetic.

## 5. PDF Generation from Palette

### Decision: Reuse existing `PrintService.saveHtmlAsPDF` + `ReportService`
### Rationale
- `ReportService.ts` already produces sales/inventory data.
- `PrintService.saveHtmlAsPDF` already handles the Electron PDF flow.
- The palette just orchestrates: fetch data → build HTML → call `saveHtmlAsPDF`.
