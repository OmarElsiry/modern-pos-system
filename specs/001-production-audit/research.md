# Research: System Transformation

**Feature**: 001-production-audit  
**Date**: 2026-02-07

---

## 1. Electron Security (IPC Architecture)

### Decision
Implement a secure IPC layer using `contextBridge` and `ipcRenderer.invoke`/`ipcMain.handle` pattern. The Renderer process will have **zero direct Node.js API access**.

### Rationale
- The current architecture (`nodeIntegration: true`, `contextIsolation: false`) is a critical security vulnerability ([Electron Security Documentation](https://www.electronjs.org/docs/latest/tutorial/security)).
- `contextBridge` allows a safe "API surface" to be exposed from the Main process without granting full Node.js access.
- The `invoke`/`handle` pattern is recommended for request-response IPC, while `send`/`on` is for one-way messages.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Keep `nodeIntegration: true`, add CSP | Still allows XSS to access all Node APIs. CSP is insufficient. |
| Use WebSockets for IPC | Adds network layer complexity; native IPC is faster and more secure. |

---

## 2. Transaction Persistence

### Decision
Persist the current transaction (cart state) to `localStorage` on every change. On app start, restore from `localStorage`.

### Rationale
- `localStorage` is synchronous, simple, and sufficient for a single-cart scenario.
- SQLite persistence could also work but adds complexity for a volatile state (cart should not be in WAL log).
- `localStorage` survives `window.location.reload()`, which is the primary failure mode.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| SQLite only | Overkill for a single volatile object (cart). DB should store invoices. |
| SessionStorage | Does not persist across app restarts/crashes. |

---

## 3. Routing

### Decision
Replace `useState`-based routing with `react-router-dom` using `MemoryRouter`.

### Rationale
- `MemoryRouter` is designed for Electron apps where there's no browser address bar.
- Provides history navigation (`back`, `forward`), route guards, and lazy loading integration.
- State can be serialized to `localStorage` for persistence across reloads.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Keep `useState` switch | No history, no deep-linking, state lost on reload. |
| `HashRouter` | Hash URLs are ugly and not necessary in Electron. |

---

## 4. Database Location

### Decision
Move all SQLite database operations to the **Electron Main Process**. Expose CRUD operations via IPC to the Renderer.

### Rationale
- Synchronous `better-sqlite3` calls in the Renderer block the UI thread.
- Main process runs on a separate V8 isolate, preventing UI jank.
- We can later move to a Worker thread if needed, but Main is sufficient for now.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Worker thread in Renderer | `better-sqlite3` native module cannot run in Worker easily. |
| Use async SQLite wrapper | `better-sqlite3` is sync-only. Switching to `sql.js` loses native performance. |

---

## 5. Tailwind CSS Migration

### Decision
Adopt Tailwind CSS v4 (or latest stable) and port the existing design tokens.

### Rationale
- Tailwind's utility-first approach matches the existing `design-tokens.css` pattern.
- Reduces ~50KB of custom CSS to ~10KB of utility classes (with PurgeCSS).
- The existing color palette (Sky, Slate, Emerald) maps directly to Tailwind's default.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Keep custom CSS | Maintenance nightmare; inconsistency risk. |
| Use CSS Modules | Still requires manual class management; less flexible. |

---

## 6. Refund Workflow

### Decision
Implement a dedicated "Refund" mode in `POSScreen` that allows scanning original invoice, selecting items, processing refund, and adjusting inventory.

### Rationale
- Refunds are a core POS function missing from the system.
- Must integrate with `InvoiceRepository` to mark original invoice as `refunded` and create a refund invoice.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Negative quantity sale | Confusing UX; doesn't track refund reason or link to original invoice. |
