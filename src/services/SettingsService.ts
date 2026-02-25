import { SystemSettings } from '../types/models';

export class SettingsService {
    /**
     * Get application settings
     */
    async getSettings(): Promise<{ success: boolean; data?: SystemSettings; error?: string }> {
        if (!(window as any).electronAPI) {
            return {
                success: true,
                data: {
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
                        showTier2: true
                    }
                }
            };
        }
        return await (window as any).electronAPI.settings.get();
    }

    /**
     * Update application settings
     */
    async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; error?: string }> {
        if (!(window as any).electronAPI) return { success: true }; // Just simulate success on web
        return await (window as any).electronAPI.settings.update(settings);
    }
}
