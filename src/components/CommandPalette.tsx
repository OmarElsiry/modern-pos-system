import React, { useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { commandActions, CommandContext as ICommandContext } from '../config/commandActions';
import { PrintService } from '../services/PrintService';
import { SettingsService } from '../services/SettingsService';
// Using a safe fallback if ReportService isn't available yet or to avoid circular dependencies if any
import { ReportService } from '../services/ReportService';
import './CommandPalette.css';

interface CommandPaletteProps {
    toggleStockAlerts?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ toggleStockAlerts }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

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
        navigation: 'التنقل',
        products: 'المنتجات',
        categories: 'الأقسام',
        customers: 'العملاء',
        pdf: 'تقارير PDF',
        system: 'النظام',
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            dir="rtl"
        >
            <Command.Input placeholder="ابحث عن أمر... (مثال: إضافة منتج، المبيعات)" />

            <Command.List>
                <Command.Empty>لا توجد نتائج.</Command.Empty>

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
                                    <span>{action.label}</span>
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
