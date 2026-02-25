# Quickstart: Command Palette

## Prerequisites
- Node.js 18+
- Existing JOECASHIER Electron app running

## Setup
```bash
# Install the new dependency
npm install cmdk
```

## Usage
1. Press `Ctrl+K` from any screen to open the command palette.
2. Start typing to search for an action (Arabic or English keywords work).
3. Use arrow keys to navigate, `Enter` to execute.
4. Press `Escape` to close.

## Adding New Commands
Add entries to `src/config/commandActions.ts`:

```typescript
{
  id: 'my-new-action',
  label: 'اسم الأمر',
  keywords: ['keyword1', 'keyword2'],
  icon: <MyIcon size={18} />,
  group: 'system',
  action: (ctx) => { /* your logic */ }
}
```

The palette will automatically pick up new entries.
