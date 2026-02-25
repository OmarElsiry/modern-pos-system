# Feature Spec: Multi-Logo Support & Layout Optimization

**Status**: Planning
**Date**: 2026-02-12

## User Problem
1.  **Layout Inefficiency**: The current "Store Identity" section in Settings uses too much space for basic info. The user mentioned it "takes like half of the size" and takes "the whole width".
2.  **Single Image Limitation**: Users can currently only add one logo to the invoice. They want the ability to add a second image (e.g., a secondary logo, QR code, or promotional image) and position it independently.

## User Stories
- **As a Store Owner**, I want the settings layout to be more compact and efficient so I don't have to scroll as much.
- **As a Store Owner**, I want to add a second image to my invoice and choose where it appears so I can include more branding or information.

## Functional Requirements
1.  **Compact Settings UI**:
    - Reduce the width/scaling of input fields in the "Store Identity" section.
    - Improve the layout to look more premium and less "stretched".
2.  **Multi-Logo Support**:
    - Add a "Secondary Image" property to the business settings.
    - Support a "Secondary Image Position" setting (same 6 positions as the primary logo).
    - Allow toggling the secondary image on/off.
3.  **Invoice Rendering**:
    - Update the print template to display both images at their respective chosen positions.

## Success Criteria
- Settings screen feels more compact and professional.
- User can successfully upload two different images.
- Both images appear in the correct locations on printed invoices.
