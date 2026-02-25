# Feature Specification: Command Palette (Trigram)

## Overview
A global command palette (triggered by `Ctrl+K`) that provides instant access to all app actions from any screen. Users can type to fuzzy-search and execute actions like adding a product, creating a category, viewing stock warnings, saving a PDF report, navigating to any screen, and more — all without leaving their current context.

## Problem Statement
1. **Slow Navigation**: Users must navigate through multiple sidebar items and screens to perform common tasks.
2. **Action Discovery**: New users don't easily discover all available features across the app.
3. **Efficiency**: Power users want keyboard-driven workflows without touching the mouse.
4. **PDF Access**: There's no centralized place to trigger PDF report downloads for different modules.

## Functional Requirements

### FR-1: Global Trigger
- `Ctrl+K` (Windows) opens/closes the command palette from **any screen**.
- A clickable search hint in the sidebar/header also triggers it.

### FR-2: Fuzzy Search
- All commands are searchable by Arabic label, English keyword aliases, and category.
- Results update instantly as the user types.
- Empty state shows a helpful "no results" message.

### FR-3: Grouped Actions
Commands are organized into these groups:

#### Navigation
| Command | Action |
|---------|--------|
| نقطة البيع | Navigate to POS |
| لوحة التحكم | Navigate to Dashboard |
| المنتجات | Navigate to Products |
| الأقسام | Navigate to Categories |
| العملاء | Navigate to Customers |
| سجل الفواتير | Navigate to Invoice History |
| التقارير | Navigate to Reports |
| الإعدادات | Navigate to Settings |

#### Products
| Command | Action |
|---------|--------|
| إضافة منتج | Open Add Product modal |
| عرض المنتجات | Navigate to Products |
| تنبيهات المخزون | Show stock alerts panel |

#### Categories
| Command | Action |
|---------|--------|
| إضافة قسم | Open Add Category modal |
| عرض الأقسام | Navigate to Categories |

#### Customers
| Command | Action |
|---------|--------|
| إضافة عميل | Open Add Customer modal |
| عرض العملاء | Navigate to Customers |

#### PDF Reports
| Command | Action |
|---------|--------|
| تقرير المبيعات PDF | Generate & save Sales Report PDF |
| تقرير المخزون PDF | Generate & save Inventory Report PDF |
| تقرير العملاء PDF | Generate & save Customer List PDF |
| تقرير الفواتير PDF | Navigate to Invoice History for PDF export |

#### System
| Command | Action |
|---------|--------|
| وضع ملء الشاشة | Toggle kiosk/fullscreen mode |
| أرشفة البيانات | Trigger daily archive |

### FR-4: Visual Design
- Dark glassmorphic overlay with backdrop blur.
- RTL layout with Arabic labels.
- Each item shows an icon (Lucide), label, and optional keyboard shortcut badge.
- Smooth open/close animations.

### FR-5: Extensibility
- Action registry pattern: new commands can be added by any module without modifying the palette component.

## Technical Requirements
1. **Library**: Use `cmdk` (pacocoursey/cmdk) — fast, accessible, unstyled command menu component.
2. **Integration**: Mount in `Layout.tsx` so it's globally available.
3. **Routing**: Use `react-router-dom`'s `useNavigate` for navigation actions.
4. **PDF**: Use existing `PrintService.saveHtmlAsPDF` for report generation.
5. **State**: Use a shared context or event bus to trigger actions in other screens (e.g., opening Add Product modal from the palette).

## Success Criteria
- [ ] `Ctrl+K` opens the palette from any screen.
- [ ] All listed commands are functional and searchable.
- [ ] PDF reports can be generated and saved directly from the palette.
- [ ] The palette is RTL-aware and visually premium.
- [ ] No performance impact on the main app.
