# Tech Plan: Multi-Logo Support & Layout Optimization

## User Review Required
> [!IMPORTANT]
> This change introduces new database columns to the `settings` table. While safe, it requires a migration.

## Proposed Changes

### Database
#### [MODIFY] [connection.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/database/connection.ts)
- Add Migration 14:
  ```sql
  ALTER TABLE settings ADD COLUMN logo2 TEXT;
  ALTER TABLE settings ADD COLUMN logo2_position TEXT DEFAULT 'bottom-right';
  ALTER TABLE settings ADD COLUMN show_logo2 INTEGER DEFAULT 1;
  ```

### Models
#### [MODIFY] [models.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/types/models.ts)
- Update `BusinessInfo` to include `logo2`, `logo2Position`, and `showLogo2`.

### Repositories
#### [MODIFY] [SettingsRepository.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/repositories/SettingsRepository.ts)
- Update `getSettings` and `updateSettings` to handle the new fields.

### UI
#### [MODIFY] [SettingsScreen.tsx](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/screens/SettingsScreen.tsx)
- **Store Identity**: Change grid from `md:grid-cols-2` to `md:grid-cols-3` for a tighter fit.
- **Header**: Add a button "إضافة صورة إضافية" which enables/shows the second image config.
- **Printing Section**: Add a tabbed or side-by-side view for "Primary Logo" and "Secondary Image".

### Printing
#### [MODIFY] [PrintService.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/src/services/PrintService.ts)
- Logic to render both images in the HTML receipt.

## Verification Plan
### Automated Tests
- `npm run lint`
- Snyk scan
### Manual Verification
- Upload and position two images.
- Print and check receipt.
