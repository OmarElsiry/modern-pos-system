# Tasks: Store Name Update & PDF Download Fix (016-store-name-pdf-fix)

## Phase 1: Store Name Update
- [x] **T1.1**: Update `src/database/connection.ts` default values.
- [x] **T1.2**: Update `src/services/PrintService.ts` fallback name.
- [x] **T1.3**: Update `src/components/printing/PrintTemplates.tsx` fallback name.
- [x] **T1.4**: Update `src/components/printing/ReceiptTemplate.tsx` default prop.

## Phase 2: PDF Download Fix
- [x] **T2.1**: Update `electron/main.ts` to support background HTML-to-PDF generation.
- [x] **T2.2**: Update `src/services/PrintService.ts` to utilize the new background PDF capability.
- [x] **T2.3**: Update `src/screens/CustomerManagement.tsx` report generation logic.

## Phase 3: Verification
- [ ] **T3.1**: Verify default store name in clean DB.
- [ ] **T3.2**: Verify PDF download for client list.
