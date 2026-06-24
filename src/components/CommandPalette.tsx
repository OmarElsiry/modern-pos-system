import React, { useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { commandActions, CommandContext as ICommandContext } from '../config/commandActions';
import { PrintService } from '../services/PrintService';
import { SettingsService } from '../services/SettingsService';
import { ReportService } from '../services/ReportService';
import { useTranslation } from 'react-i18next';
import './CommandPalette.css';

interface CommandPaletteProps {
    toggleStockAlerts?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ toggleStockAlerts }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Toggle with Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Context passed to actions
    const context: ICommandContext = useMemo(() => ({
        navigate,
        printService: PrintService,
        reportService: ReportService,
        settingsService: SettingsService,
        toggleStockAlerts: toggleStockAlerts || (() => console.warn('Stock alerts toggle not provided')),
    }), [navigate, toggleStockAlerts]);

    // Group actions
    const groups = useMemo(() => {
        const grouped: Record<string, typeof commandActions> = {};
        commandActions.forEach(action => {
            if (!grouped[action.group]) {
                grouped[action.group] = [];
            }
            grouped[action.group].push(action);
        });
        return grouped;
    }, []);

    const groupLabels: Record<string, string> = {
        navigation: t('commandPalette.groupNavigation'),
        products: t('commandPalette.groupProducts'),
        categories: t('commandPalette.groupCategories'),
        customers: t('commandPalette.groupCustomers'),
        pdf: t('commandPalette.groupPdfReports'),
        system: t('commandPalette.groupSystem'),
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label={t('commandPalette.label')}
            dir="rtl"
        >
            <Command.Input placeholder={t('commandPalette.searchPlaceholder')} />

            <Command.List>
                    <Command.Empty>{t('commandPalette.noResults')}</Command.Empty>

                {Object.entries(groups).map(([groupKey, actions]) => (
                    <Command.Group key={groupKey} heading={groupLabels[groupKey] || groupKey}>
                        {actions.map((action) => (
                            <Command.Item
                                key={action.id}
                                onSelect={() => {
                                    setOpen(false);
                                    action.action(context);
                                }}
                                keywords={action.keywords}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    {action.icon}
                                    <span>{t(action.labelKey)}</span>
                                </div>
                                {action.shortcut && (
                                    <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: 'auto' }}>
                                        {action.shortcut}
                                    </span>
                                )}
                            </Command.Item>
                        ))}
                    </Command.Group>
                ))}
            </Command.List>
        </Command.Dialog>
    );
};
