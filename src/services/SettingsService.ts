import { SystemSettings } from '../types/models';

export class SettingsService {
    /**
     * Get application settings
     */
    async getSettings(): Promise<{ success: boolean; data?: SystemSettings; error?: string }> {
        if (!(window as any).electronAPI) return { success: false, error: 'Electronic only feature' };
        return await (window as any).electronAPI.settings.get();
    }

    /**
     * Update application settings
     */
    async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; error?: string }> {
        if (!(window as any).electronAPI) return { success: false, error: 'Electronic only feature' };
        return await (window as any).electronAPI.settings.update(settings);
    }
}
