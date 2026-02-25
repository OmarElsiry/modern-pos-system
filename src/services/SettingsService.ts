import { SystemSettings } from '../types/models';

export class SettingsService {
    /**
     * Get application settings
     */
    async getSettings(): Promise<{ success: boolean; data?: SystemSettings; error?: string }> {
        if (!(window as any).electronAPI) {
            const savedItem = localStorage.getItem('web_settings');
            if (savedItem) {
                try {
                    return { success: true, data: JSON.parse(savedItem) };
                } catch (e) {
                    console.error('Failed to parse saved settings', e);
                }
            }

            const defaultSettings: SystemSettings = {
                businessInfo: {
                    name: 'متجر تجريبي',
                    address: 'القاهرة، مصر',
                    phone: '01000000000',
                    email: 'demo@example.com',
                    showName: true,
                    showAddress: true,
                    showPhone: true,
                    logoPosition: 'top-center',
                    thankYouNote: 'شكراً لزيارتكم!',
                    returnPolicy: 'يسمح بالاستبدال خلال 14 يوم'
                },
                autoPrint: true,
                archivePath: '/mock/archive',
                pricingOpts: {
                    tier1Name: 'قطاعي',
                    tier2Name: 'جملة',
                    showTier2: true,
                    customTiers: []
                }
            };
            return {
                success: true,
                data: defaultSettings
            };
        }
        return await (window as any).electronAPI.settings.get();
    }

    /**
     * Update application settings
     */
    async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; error?: string }> {
        if (!(window as any).electronAPI) {
            const currentResp = await this.getSettings();
            const current = currentResp.data || {};
            localStorage.setItem('web_settings', JSON.stringify({ ...current, ...settings }));
            return { success: true };
        }
        return await (window as any).electronAPI.settings.update(settings);
    }
}
