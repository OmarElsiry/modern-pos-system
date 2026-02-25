import { getDatabase, DatabaseError } from '../database/connection';
import { SystemSettings } from '../types/models';

export class SettingsRepository {
    private db: any;

    constructor() {
        this.db = getDatabase();
    }

    /**
     * Get application settings
     */
    getSettings(): SystemSettings {
        try {
            const row = this.db.prepare('SELECT * FROM settings WHERE id = 1').get();
            if (!row) {
                throw new Error('Settings not found');
            }

            return {
                businessInfo: {
                    name: row.business_name,
                    address: row.business_address,
                    phone: row.business_phone,
                    logo: row.logo,
                    logoPosition: row.logo_position,
                    logo2: row.logo2,
                    logo2Position: row.logo2_position,
                    showLogo2: Boolean(row.show_logo2 ?? 1),
                    showName: Boolean(row.show_name ?? 1),
                    showAddress: Boolean(row.show_address ?? 1),
                    showPhone: Boolean(row.show_phone ?? 1),
                },
                archivePath: row.archive_path,
                a4Template: row.a4_template ? JSON.parse(row.a4_template) : undefined,
                thermalTemplate: row.thermal_template ? JSON.parse(row.thermal_template) : undefined,
                autoPrint: Boolean(row.auto_print ?? 1),
                pricingOpts: {
                    tier1Name: row.tier1_name ?? 'قطاعي',
                    tier2Name: row.tier2_name ?? 'جملة',
                    showTier2: Boolean(row.show_tier2 ?? 1),
                    customTiers: row.custom_tiers ? JSON.parse(row.custom_tiers) : []
                }
            };
        } catch (error: any) {
            throw new DatabaseError(`Failed to fetch settings: ${error.message}`, 'ERR_SET_001', error);
        }
    }

    /**
     * Update application settings
     */
    updateSettings(settings: Partial<SystemSettings>): void {
        try {
            const current = this.getSettings();
            const stmt = this.db.prepare(`
        UPDATE settings
        SET business_name = ?,
            business_address = ?,
            business_phone = ?,
            logo = ?,
            logo_position = ?,
            logo2 = ?,
            logo2_position = ?,
            show_logo2 = ?,
            show_name = ?,
            show_address = ?,
            show_phone = ?,
            auto_print = ?,
            a4_template = ?,
            thermal_template = ?,
            tier1_name = ?,
            tier2_name = ?,
            show_tier2 = ?,
            custom_tiers = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = 1
      `);

            stmt.run(
                settings.businessInfo?.name ?? current.businessInfo.name,
                settings.businessInfo?.address ?? current.businessInfo.address,
                settings.businessInfo?.phone ?? current.businessInfo.phone,
                settings.businessInfo?.logo ?? current.businessInfo.logo,
                settings.businessInfo?.logoPosition ?? current.businessInfo.logoPosition,
                settings.businessInfo?.logo2 ?? current.businessInfo.logo2,
                settings.businessInfo?.logo2Position ?? current.businessInfo.logo2Position,
                (settings.businessInfo?.showLogo2 ?? current.businessInfo.showLogo2) ? 1 : 0,
                (settings.businessInfo?.showName ?? current.businessInfo.showName) ? 1 : 0,
                (settings.businessInfo?.showAddress ?? current.businessInfo.showAddress) ? 1 : 0,
                (settings.businessInfo?.showPhone ?? current.businessInfo.showPhone) ? 1 : 0,
                (settings.autoPrint ?? current.autoPrint) ? 1 : 0,
                settings.a4Template ? JSON.stringify(settings.a4Template) : (current.a4Template ? JSON.stringify(current.a4Template) : null),
                settings.thermalTemplate ? JSON.stringify(settings.thermalTemplate) : (current.thermalTemplate ? JSON.stringify(current.thermalTemplate) : null),
                settings.pricingOpts?.tier1Name ?? current.pricingOpts?.tier1Name ?? 'قطاعي',
                settings.pricingOpts?.tier2Name ?? current.pricingOpts?.tier2Name ?? 'جملة',
                (settings.pricingOpts?.showTier2 ?? current.pricingOpts?.showTier2 ?? true) ? 1 : 0,
                settings.pricingOpts?.customTiers ? JSON.stringify(settings.pricingOpts.customTiers) : (current.pricingOpts?.customTiers ? JSON.stringify(current.pricingOpts.customTiers) : null)
            );
        } catch (error: any) {
            throw new DatabaseError(`Failed to update settings: ${error.message}`, 'ERR_SET_002', error);
        }
    }
}
