# Specification: Hierarchical Archiving & Telegram Reporter

## 1. Overview
This feature integrates local data persistence with a remote triggering mechanism. It ensures that every business day is snapshotted into a nested folder structure and allows a designated store owner to query these stats via a Telegram Bot.

## 2. User Stories
- **US1**: As an owner, I want the system to automatically save today's data in a `2026/02/10_Report.json` format so I have a permanent history.
- **US2**: As an owner, I want to message my Telegram Bot "report" and get a summary of today's sales and stock status while I am away from the shop.

## 3. Technical Requirements

### 3.1 Hierarchical Archiving
- **Root Path**: `JOECASHIER_DATA/Archive/`
- **Structure**: `{Year}/{Month}/{Date}_DailySummary.json`
- **Trigger**: Automatic on end-of-day or manual from settings.

### 3.2 Telegram Bot Integration
- **Settings**:
  - `telegramBotToken`: Secret token from @BotFather.
  - `telegramChatId`: The ID of the owner allowed to receive reports.
  - `isPollingEnabled`: Toggle for the background listener.
- **Communication Protocol**:
  - Bot polls Telegram API every 60 seconds (when app is open).
  - Recognizes commands: `/start`, `/report`, `/stock`.

### 3.3 Security
- **Authorization**: The bot only responds to the user matching the `telegramChatId`.
- **Offline Safety**: Files are saved locally even if the internet is down.

## 4. UI Implementation
- **Settings Screen**: New "Automation & Telegram" tab/section.
- **Status Indicator**: Show if the Telegram Bot is connected/listening.

---

# Tasks: Hierarchical Archiving & Telegram Reporter

## Phase 1: Models & Settings
- [ ] T001 Update `models.ts` with `SystemSettings` and `DailySnapshot`.
- [ ] T002 Add Telegram settings fields to the Settings screen UI.

## Phase 2: Archive Service
- [ ] T003 Implement `ArchiveService` for hierarchical folder logic.
- [ ] T004 Create `SnapshotService` to aggregate daily financial and stock data.

## Phase 3: Telegram Bot Logic
- [ ] T005 Implement `TelegramBotService` for API communication.
- [ ] T006 Add message polling/listening loop.
- [ ] T007 Implement report formatting for Telegram (Markdown).

## Phase 4: Integration
- [ ] T008 Hook into the Invoice creation to update the current "live" snapshot.
- [ ] T009 Add "Export All History to Archive" button for one-time setup.
