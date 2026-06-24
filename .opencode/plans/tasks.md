# Translation Audit & Localization Tasks

## Overview

Comprehensive audit of all 7 locale files cross-referenced against all `t()` calls in 19+ source files. Assessment spans 491 keys per locale file × 7 languages = **3,437 total translation values**.

---

## 1. Current Status Summary

| Language | File | Keys | Translated | Completeness |
|----------|------|------|-----------|-------------|
| English | `en.json` | 491 | ✅ 100% | Reference language |
| Arabic | `ar.json` | 491 | ✅ 100% | Proper translation |
| French | `fr.json` | 481 | ❌ 0% | All English placeholder |
| Russian | `ru.json` | 481 | ❌ 0% | All English placeholder |
| German | `de.json` | 481 | ❌ 0% | All English placeholder |
| Persian | `fa.json` | 481 | ❌ 0% | All English placeholder |
| Chinese | `zh.json` | 481 | ❌ 0% | All English placeholder |

**491 keys total** across 18 namespaces: `common`, `settings`, `nav`, `pos`, `layout`, `commandPalette`, `commands`, `dashboard`, `invoices`, `products`, `customers`, `categories`, `reports`, `numpad`, `stockAlert`, `onboarding`, `receiptPreview`, `customerSelect`

---

## 2. Critical Issues

### 🔴 A: Interpolation Syntax Mismatch (ALL languages, ALL files)

**File:** `src/i18n.ts:41-43`

The i18next config uses DEFAULT interpolation: `{{var}}` (double braces). But every locale file uses `{var}` (single braces):

```
i18n.ts (default):    expects {{var}}
en.json (actual):     uses {var}
```

**Impact:** Every `t()` call with interpolation arguments will output the literal string `{count}` / `{name}` / `{number}` instead of the actual value.

**Affected keys (23 total):**

| Key | Template | Code Usage |
|-----|----------|-----------|
| `products.showing` | `"Showing {count} of {total} products"` | `t('products.showing', { count: ..., total: ... })` |
| `products.labelPrint` | `"Print ({count})"` | `t('products.labelPrint', { count: ... })` |
| `products.labelFinalSize` | `"Final Size: {width}mm x {height}mm"` | `t('products.labelFinalSize', { width: ..., height: ... })` |
| `products.customTierPrice` | `"{name} Price"` | `t('products.customTierPrice', { name: tier.name })` |
| `products.deleteConfirm` | `"Are you sure...\\"{name}\\"?"` | `t('products.deleteConfirm', { name: ... })` |
| `pos.stockLow` | `"Low: {count}"` | `t('pos.stockLow', { count: ... })` |
| `pos.toastPricingChanged` | `"Pricing changed to {name}"` | `t('pos.toastPricingChanged', { name: ... })` |
| `pos.toastStockExceeded` | `"Cannot exceed available stock ({stock})"` | `t('pos.toastStockExceeded', { stock: ... })` |
| `pos.toastInvoiceCompleted` | `"Invoice completed! Number: {number}"` | `t('pos.toastInvoiceCompleted', { number: ... })` |
| `invoices.toastSaveFailed` | `"Failed to save invoice...{error}"` | `t('invoices.toastSaveFailed', { error: ... })` |
| `customers.totalRecords` | `"Total Records"` (no {count} in en) | `t('customers.totalRecords', { count: ... })` |
| `customers.historyFor` | `"{name}'s Purchase History"` | `t('customers.historyFor', { name: ... })` |
| `customers.deleteConfirm` | `"Are you sure...\\"{name}\\""` | `t('customers.deleteConfirm', { name: ... })` |
| `categories.deleteConfirm` | `"Are you sure...\\"{name}\\""` | `t('categories.deleteConfirm', { name: ... })` |
| `stockAlert.needsRestock` | `"{count} products need restocking"` | `t('stockAlert.needsRestock', { count: ... })` |
| `settings.toast.archiveSuccess` | `"Success! Saved at: {path}"` | `t('settings.toast.archiveSuccess', { path: ... })` |
| `settings.toast.archiveFailed` | `"Archive failed: {error}"` | `t('settings.toast.archiveFailed', { error: ... })` |
| `customerSelect.addNew` | `"Add new customer: {name}"` | `t('customerSelect.addNew', { name: ... })` |
| `customerSelect.phoneExists` | `"Phone number already exists...{name}"` | `t('customerSelect.phoneExists', { name: ... })` |

**Fix:** Add `prefix: '{'` and `suffix: '}'` to the interpolation config in `i18n.ts`:

```js
interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
},
```

**OR:** Replace ALL `{var}` with `{{var}}` across all 7 locale files (more work, error-prone).

### 🔴 B: 5 Locale Files Completely Untranslated

**Files:** `fr.json`, `ru.json`, `de.json`, `fa.json`, `zh.json`

All string values are English. Users selecting French/Russian/etc. will see 100% English UI. These files need proper translation by native speakers.

- fr.json: needs French translation (~481 values)
- ru.json: needs Russian translation (~481 values)
- de.json: needs German translation (~481 values)
- fa.json: needs Persian translation (~481 values)
- zh.json: needs Chinese translation (~481 values)

### 🔴 C: 10 Keys Missing from 5 Untranslated Files

**Affected files:** `fr.json`, `ru.json`, `de.json`, `fa.json`, `zh.json`

These 5 files are missing 10 keys present in `en.json` and `ar.json`. While i18next's `fallbackLng: 'en'` means they'll fall back to English, these should be added for completeness:

| Missing Key | en.json Value |
|-------------|---------------|
| `common.custom` | `"Custom"` |
| `pos.cash` | `"Cash"` |
| `invoices.paymentMethod` | `"Payment Method"` |
| `customers.autoGeneratedReport` | `"This report was auto-generated from the cashier system"` |
| `reports.reportDate` | `"Report Date"` |
| `receiptPreview.item` | `"Item"` |
| `receiptPreview.quantity` | `"Qty"` |
| `receiptPreview.price` | `"Price"` |
| `receiptPreview.total` | `"Total"` |
| `receiptPreview.grandTotal` | `"Grand Total"` |

---

## 3. High-Impact Issues

### 🟠 A: Arabic Branding Divergence (`ar.json`)

The Arabic locale uses a **different brand name** throughout — `"بيت ورد"` (House of Flowers/Roses) instead of `"Joe Cashier"`:

| Key | en.json | ar.json |
|-----|---------|---------|
| `layout.sidebarTitle` | `"Joe Cashier"` | `"بيت ورد"` |
| `onboarding.step1Title` | `"Welcome to Joe Cashier"` | `"أهلاً بك في بيت ورد"` |

This may be intentional customization for a specific client (Beit Ward), but if `ar.json` is meant to be a general Arabic translation, `"جو كاشير"` or `"نظام الكاشير"` should be used instead.

### 🟠 B: `settings.trialExpires` Untranslated Everywhere

**Value:** `"TRIAL EXPIRES"` — identical in ALL 7 locale files including Arabic. Should be translated.

### 🟠 C: `customers.totalRecords` Template Inconsistency

| File | Value |
|------|-------|
| `en.json` | `"Total Records"` (no `{count}`) |
| `ar.json` | `"إجمالي السجلات: {count}"` (has `{count}`) |
| `fr/ru/de/fa/zh.json` | `"Total Records: {count}"` (has `{count}` in English) |

Either en.json should add `{count}`, or the others should remove it.

### 🟠 D: Orphan Keys in Locale Files

Keys defined in locale files but **never used** in any `t()` call (~25 keys):

- `common.yes`, `common.search`, `common.confirm`, `common.delete`, `common.edit`, `common.currency`
- `invoices.totalReturns`, `invoices.soldProducts`, `invoices.returnConfirmTitle`, `invoices.returnConfirmDesc`, `invoices.returnToStock`, `invoices.discardFromStock`
- `pos.search`, `pos.pay`, `pos.cash` (used only in PrintTemplates), `pos.currency`
- `dashboard.weeklySales`, `dashboard.recentActivity`
- `reports.noSalesData`, `reports.loadingData`
- `products.labelBarcodeError`
- `onboarding.title`
- `stockAlert.soldOut`
- `receiptPreview.downloadPDF`
- `customerSelect.addNew` (not used - addTitle used instead)

---

## 4. Medium-Impact Issues

### 🟡 A: Currency Hardcoded as EGP Everywhere

All locale files use `"EGP"` / `"E£"`. If locales target different markets, currencies should be localized.

### 🟡 B: `receiptPreview` Namespace Incomplete in 5 Files

`en/ar.json` have 9 keys; `fr/ru/de/fa/zh.json` only have 4. The 5 missing keys (`item`, `quantity`, `price`, `total`, `grandTotal`) are used by `PrintTemplates.tsx` for receipt table headers.

---

## 5. Translation Quality Assessment

| Language | Quality | Notes |
|----------|---------|-------|
| **English** | ⭐⭐⭐⭐⭐ | Reference. Missing `{count}` in `totalRecords` |
| **Arabic** | ⭐⭐⭐⭐ | Good. One English leftover (`trialExpires`). Brand name divergence. |
| **French** | ⭐ (1/5) | All English. Needs native translation |
| **Russian** | ⭐ (1/5) | All English. Needs native translation |
| **German** | ⭐ (1/5) | All English. Needs native translation |
| **Persian** | ⭐ (1/5) | All English. Needs native translation (RTL!) |
| **Chinese** | ⭐ (1/5) | All English. Needs native translation |

---

## 6. Action Plan

### Phase 1 — Fix Infrastructure
| # | Task | Effort | File |
|---|------|--------|------|
| 1 | Fix interpolation: add `prefix: '{', suffix: '}'` to i18n.ts | 5 min | `src/i18n.ts` |

### Phase 2 — Fix Missing Keys
| # | Task | Effort | Files |
|---|------|--------|-------|
| 2 | Add 10 missing keys to fr/ru/de/fa/zh.json (copy from en.json) | 10 min | 5 files |

### Phase 3 — Translation (parallelizable)
| # | Task | Effort | Notes |
|---|------|--------|-------|
| 3 | Translate fr.json — all 481 values to French | 4-6 hrs | Native speaker |
| 4 | Translate ru.json — all 481 values to Russian | 4-6 hrs | Native speaker |
| 5 | Translate de.json — all 481 values to German | 4-6 hrs | Native speaker |
| 6 | Translate fa.json — all 481 values to Persian | 4-6 hrs | Native speaker (RTL) |
| 7 | Translate zh.json — all 481 values to Chinese | 4-6 hrs | Native speaker |

### Phase 4 — Arabic Fixes
| # | Task | Effort |
|---|------|--------|
| 8 | Decide: keep `بيت ورد` or use `نظام الكاشير` consistently in ar.json | Decision |
| 9 | Translate `settings.trialExpires` to Arabic | 1 min |

### Phase 5 — Cleanup
| # | Task | Effort |
|---|------|--------|
| 10 | Fix `customers.totalRecords` template: add `{count}` to en.json | 1 min |
| 11 | Review ~25 orphan keys: remove or document | 15 min |

### Phase 6 — Verify
| # | Task | Effort |
|---|------|--------|
| 12 | Run `tsc --noEmit` to verify no errors | Automated |
| 13 | Manual spot-check UI in Arabic | 15 min |

### Total: ~20-30 hrs (mostly translation)
