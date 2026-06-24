# JOECASHIER - Comprehensive i18n Audit & Remediation Plan

## Executive Summary
This document outlines a zero-tolerance plan to eliminate ALL hardcoded strings, untranslated text, wrong translations, and locale mismatches across the entire application. The goal: **100% i18n coverage with zero hardcoded text**.

---

## Phase 1: Critical Hardcoded Strings (IMMEDIATE - Blockers)

### 1.1 PrintTemplates.tsx - Hardcoded Arabic Locale & Fallback
**File:** `src/components/printing/PrintTemplates.tsx`
**Lines:** 43, 67, 157, 176, 228, 242, 263, 266
**Issues:**
- Line 43: `toLocaleDateString('ar-EG', ...)` - hardcoded Arabic Egypt locale
- Line 26: `'بيت ورد'` - hardcoded Arabic fallback for business name
- Lines 157, 176, 228, 242, 263, 266: Multiple hardcoded `'ar-EG'` in locale strings
- Missing translations for: `document-title`, `meta-grid`, `report-date`, `footer-notes`, `report-time`, `col-id`, `col-name`, `col-phone`, `col-address`, `col-total`, `total-amount`, `col-qty`, `col-name` (headers)

**Fix:** Use `i18n.language` mapping + translation keys for ALL text

### 1.2 Dashboard.tsx - Hardcoded Arabic String Comparison
**File:** `src/screens/Dashboard.tsx`
**Line:** 169
**Issue:** `invoice.customerName === 'عميل نقدي'` - compares against Arabic string regardless of locale
**Fix:** Use translation key or constant for cash customer name

### 1.3 LabelPrintModal.tsx - Untranslated SIZE_DIMENSIONS Names
**File:** `src/components/printing/LabelPrintModal.tsx`
**Lines:** 35-47
**Issue:** SIZE_DIMENSIONS object has English display names hardcoded
**Fix:** Move to translation keys, use `t()` for each size name

---

## Phase 2: Locale File Parity Audit (HIGH PRIORITY)

### 2.1 English (Reference) - 551 lines, ~450 keys
### 2.2 Arabic - 551 lines ✓ Complete
### 2.3 French - 550 lines - **MISSING: onboarding, receiptPreview, customerSelect sections**
### 2.4 German - 550 lines - **MISSING: onboarding, receiptPreview, customerSelect sections**
### 2.5 Chinese - 550 lines - **MISSING: onboarding, receiptPreview, customerSelect sections**
### 2.6 Russian - **NEED TO READ**
### 2.7 Persian - **NEED TO READ**

**Action Required:** Compare ALL locale files against English reference, add missing keys

---

## Phase 3: Component-Level Audit (MEDIUM PRIORITY)

### 3.1 Screens to Audit
- [x] POSScreen.tsx - Uses `t()` properly
- [x] SettingsScreen.tsx - Uses `t()` properly
- [x] ProductManagement.tsx - Uses `t()` properly
- [x] CustomerManagement.tsx - Uses `t()` properly (but has inline HTML with template strings)
- [x] InvoiceHistory.tsx - Uses `t()` properly
- [x] ReportsScreen.tsx - Uses `t()` properly
- [x] Dashboard.tsx - **HAS HARDCODED STRING**
- [x] CategoryManagement.tsx - Uses `t()` properly

### 3.2 Components to Audit
- [x] ReceiptPreview.tsx - Uses `t()` properly
- [x] CustomerSelect.tsx - Uses `t()` properly
- [x] DataGrid.tsx - Uses `t()` properly
- [x] Modal.tsx - Uses `t()` via children
- [x] Numpad.tsx - Uses `t()` properly
- [x] EmptyState.tsx - **Title passed as prop, needs translation at call site**
- [x] StockAlert.tsx - Uses `t()` properly
- [x] CommandPalette.tsx - Uses `t()` properly
- [x] LabelPrintModal.tsx - **HAS HARDCODED SIZE NAMES**
- [x] BarcodeLabel.tsx - Need to check
- [x] PrintTemplates.tsx - **MULTIPLE HARDCODED STRINGS**

### 3.3 Utility/Service Files to Check
- [ ] toast.tsx - Toast messages should use translation keys
- [ ] ExportService.ts - Excel headers may be hardcoded
- [ ] ReportPDFService.ts - PDF content may be hardcoded

---

## Phase 4: Translation Quality Validation (MEDIUM PRIORITY)

### 4.1 Common Issues to Check
- [ ] Wrong gender/formality in Arabic/French/German
- [ ] Incorrect RTL/LTR handling
- [ ] Currency symbols per locale (EGP vs EUR vs CNY)
- [ ] Date/number formatting per locale
- [ ] Pluralization rules
- [ ] Context-appropriate translations (POS vs Admin vs Reports)

### 4.2 Key Areas Requiring Native Review
- Financial/accounting terminology
- Legal text (return policy, tax)
- UI microcopy (toasts, placeholders, hints)

---

## Phase 5: Automated Prevention (LONG TERM)

### 5.1 ESLint Rules
- `i18next/no-literal-string` - forbid string literals in JSX
- Custom rule: detect hardcoded locale strings (`'ar-EG'`, `'en-US'`, etc.)

### 5.2 CI Pipeline
- [ ] `npm run i18n:check` - validates key parity across all locales
- [ ] `npm run i18n:extract` - extracts new keys from source
- [ ] Pre-commit hook: block commits with hardcoded strings

### 5.3 TypeScript Integration
- [ ] `i18next-resources-for-ts` for type-safe translation keys
- [ ] Compile-time error on missing keys

---

## Remediation Checklist

### Immediate (Today)
- [ ] Fix PrintTemplates.tsx locale hardcoding
- [ ] Fix Dashboard.tsx Arabic string comparison
- [ ] Fix LabelPrintModal.tsx SIZE_DIMENSIONS translations
- [ ] Read and audit ru.json and fa.json
- [ ] Add missing keys to fr.json, de.json, zh.json

### This Week
- [ ] Complete component audit (BarcodeLabel, services)
- [ ] Add i18n lint rules
- [ ] Create key parity validation script
- [ ] Test all 7 screens in all 6 languages

### Ongoing
- [ ] Native speaker review for each language
- [ ] Automated regression testing per locale
- [ ] Documentation for translators

---

## Key Translation Gaps Identified

### Missing from French (fr.json):
- `onboarding` section (22 keys)
- `receiptPreview` section (10 keys)
- `customerSelect` section (14 keys)

### Missing from German (de.json):
- `onboarding` section (22 keys)
- `receiptPreview` section (10 keys)
- `customerSelect` section (14 keys)

### Missing from Chinese (zh.json):
- `onboarding` section (22 keys)
- `receiptPreview` section (10 keys)
- `customerSelect` section (14 keys)

### PrintTemplates.tsx Needs These New Keys:
- `printTemplates.saleInvoice`
- `printTemplates.invoiceNumber`
- `printTemplates.dateTime`
- `printTemplates.taxId`
- `printTemplates.customerLabel`
- `printTemplates.pricingType`
- `printTemplates.itemsTable.*` (headers)
- `printTemplates.footer.*` (thankYou, returnPolicy, etc.)
- `printTemplates.customerList.*` (report headers)
- `printTemplates.customerHistory.*` (report headers)
- `printTemplates.reportDate`
- `printTemplates.autoGeneratedReport`
- `printTemplates.reportTime`

---

## Testing Matrix

| Screen | EN | AR | FR | DE | ZH | RU | FA |
|--------|----|----|----|----|----|----|----|
| POS | ✓ | | | | | | |
| Dashboard | ✗ | | | | | | |
| Products | ✓ | | | | | | |
| Customers | ✓ | | | | | | |
| Invoices | ✓ | | | | | | |
| Reports | ✓ | | | | | | |
| Settings | ✓ | | | | | | |
| Categories | ✓ | | | | | | |
| Print/Preview | ✗ | | | | | | |
| Label Print | ✗ | | | | | | |

**Legend:** ✓ = Uses t() properly, ✗ = Has hardcoded strings