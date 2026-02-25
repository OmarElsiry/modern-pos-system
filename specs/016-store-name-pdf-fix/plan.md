# Plan: Store Name Update & PDF Download Fix (016-store-name-pdf-fix)

## Objective
Update the default store name across the application and fix the PDF generation logic for the client list.

## Proposed Changes

### Database & Settings
- **connection.ts**: Update default `business_name` in starting schema and initial insert.

### Services
- **PrintService.ts**: Update fallback business name.
- **main.ts**: Enhance `app:saveAsPDF` to support an `html` parameter for rendering PDFs from raw HTML in a background window.

### UI Components
- **PrintTemplates.tsx**: Update hardcoded fallback 'جو كاشير'.
- **ReceiptTemplate.tsx**: Update default `storeName`.
- **CustomerManagement.tsx**: Verify HTML structure for PDF generation.

## Verification
- Check Settings screen for new default name.
- Test PDF generation in Customer Management.
