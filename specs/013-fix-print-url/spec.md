
# Feature Specification: Maintain Offline Capability (013-fix-print-url)

## Overview
Remove external dependencies from the printing service to ensure receipts can be generated offline without styling issues.

## Problem Statement
The current implementation pulls the `Almarai` font from Google Fonts via a URL in the generated HTML. Returns referencing "URL here" likely refer to this external link.

## Functional Requirements
1. **Offline Printing**: Receipt generation MUST NOT require an internet connection.
2. **Consistent Styling**: Receipts MUST render legibly using system fonts.

## Technical Requirements
1. **Remove External Import**: Delete `@import url('https://fonts.googleapis.com/css2...')`.
2. **Update Font Stack**: Use `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`.
