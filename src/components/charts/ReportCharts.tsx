import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Design system colors matching the app's blue theme
const COLORS = [
    '#0f172a', // slate-900
    '#334155', // slate-700
    '#475569', // slate-600
    '#64748b', // slate-500
    '#94a3b8', // slate-400
    '#cbd5e1', // slate-300
    '#e2e8f0', // slate-200
    '#f1f5f9'  // slate-100
];

interface ReportBarChartProps {
    data: any[];
}

export const ReportBarChart: React.FC<ReportBarChartProps> = memo(({ data }) => {
    const { t } = useTranslation();
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productName" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0f172a" name={t('reports.totalSales')} />
                <Bar dataKey="quantity" fill="#64748b" name={t('common.total')} />
            </BarChart>
        </ResponsiveContainer>
    );
});

interface ReportLineChartProps {
    data: any[];
}

export const ReportLineChart: React.FC<ReportLineChartProps> = memo(({ data }) => {
    const { t } = useTranslation();
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fa' ? 'fa-IR' : i18n.language, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0f172a" name={t('reports.totalSales')} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="invoices" stroke="#64748b" name={t('reports.invoicesCount')} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
});

interface ReportPieChartProps {
    data: any[];
}

export const ReportPieChart: React.FC<ReportPieChartProps> = memo(({ data }) => {
    return (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="sales"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={5}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full px-4">
                {data.map((cat, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-foreground truncate">{cat.category}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">
                                {Number(cat.percentage).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
