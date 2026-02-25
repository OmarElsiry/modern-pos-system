# Feature Specification: Settings Screen Refactor (008-settings-refactor)

## 1. Overview
The Settings Screen refactor aims to update the application settings interface to align with the new **Bento UI** design system established in the Dashboard and Customer Management screens. This modernization will ensure a consistent, premium user experience while maintaining the existing functionality for system configuration.

## 2. Goals
- **Consistency**: Adopt the Bento Grid layout and premium design tokens (Tailwind v4, ShadCN UI).
- **Usability**: Improve the clarity and accessibility of setting groups (Store Info, Telegram, Backup, etc.).
- **Performance**: Ensure responsive interactions and optimized asset loading.
- **Maintainability**: Clean up code, remove unused imports, and standardize component usage.

## 3. Scope

### 3.1 UI/UX Refactor
- **Layout**: Implement a responsive grid layout using `Card` components for setting groups.
- **Typography**: Apply the Tajawal font for Arabic text and consistent spacing.
- **Components**: Replace any remaining legacy form elements with ShadCN `Input`, `Select`, `Switch`, and `Button`.
- **Icons**: Standardize on Lucide React icons.

### 3.2 Setting Groups
1.  **Store Information**: Edit business name, address, contact details.
2.  **Telegram Integration**: Configure Bot Token, Chat ID, and Polling toggle.
3.  **Archiving & Backup**: Manual archive trigger, database backup controls.
4.  **Appearance**: Theme toggle (Light/Dark), Kiosk mode toggle (moved from Sidebar or duplicated).

### 3.3 Logic & Integration
- Retain existing `SettingsService` for data persistence.
- Implement robust error handling and loading states.
- Ensure proper validation for inputs (e.g., required fields).

## 4. Requirements

### 4.1 Functional
- Users must be able to update and save all store settings.
- Telegram bot configuration must be testable (enable/disable polling).
- Manual archive process must provide feedback (success/error toast).

### 4.2 Non-Functional
- **Performance**: Settings load time < 500ms.
- **Accessibility**: WCAG 2.1 compliance for contrast and keyboard navigation.
- **Responsiveness**: Fully functional on desktop (1024px+) and tablet (768px+).

## 5. Technical Constraints
- Must use existing `window.electronAPI` for IPC calls.
- No new external dependencies.
- Right-to-Left (RTL) support is mandatory.

## 6. Success Metrics
- Zero linting errors.
- Successful manual testing of all setting updates.
- Visual parity with Dashboard and Customer Management screens.
