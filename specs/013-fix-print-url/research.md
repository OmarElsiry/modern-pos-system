
# Research: Remove External URL Dependency in PrintService

## Problem
The `PrintService.ts` file imports a font from Google Fonts (`https://fonts.googleapis.com/css2?family=Almarai...`).
This creates an external dependency that:
1. Breaks offline functionality (receipts look wrong without internet).
2. Introduces a potential privacy/security concern.
3. Slows down rendering.

## Proposed Solution
Replace the external `@import` with a system font stack that supports Arabic well.

### Chosen Font Stack
`font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`

- **Segoe UI**: Standard Windows UI font, excellent Arabic support.
- **Tahoma**: Classic Windows font with good Arabic support.
- **Geneva/Verdana**: Alternatives.
- **sans-serif**: Fallback.

This removes the network request and ensures consistent rendering on the target OS (Windows).
