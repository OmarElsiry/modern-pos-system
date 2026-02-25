import { ipcMain } from 'electron';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

export function setupSettingsHandlers() {
    const settingsRepo = new SettingsRepository();

    ipcMain.handle('db:settings:get', async () => {
        try {
            return { success: true, data: settingsRepo.getSettings() };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:settings:update', async (_, settings: any) => {
        try {
            settingsRepo.updateSettings(settings);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
}
