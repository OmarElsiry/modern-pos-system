# Plan: Telegram Bot Security Refinement (017-telegram-auth-refinement)

## Goal Description
Refine the Telegram bot's security logic to allow password-based authentication from any user, while maintaining the specific `chatId` as a privileged whitelist for system alerts and auto-authentication.

## Proposed Changes

### Electron Process
#### [MODIFY] [telegram.ts](file:///c:/Users/PotterParker/Desktop/JOECASHIER/electron/telegram.ts)
- Update `handleMessage`:
    - Process password check BEFORE blocking on `chatId` if a password is set in settings.
    - If user provides correct password, add to `authenticatedChats`.
    - If user is in `authenticatedChats` OR matches `chatId`, allow commands.
    - If user is unknown and password is NOT set, maintain strict `chatId` whitelist.

## Verification Plan
1. Test bot with a non-whitelisted ID and correct password.
2. Test bot with whitelisted ID (should bypass password).
3. Verify log output for unauthorized attempts is minimized.
