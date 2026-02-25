import React, { memo } from 'react';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

interface DashboardAreaChartProps {
    data: {
        date: string;
        amount: number;
    }[];
}

const DashboardAreaChart: React.FC<DashboardAreaChartProps> = ({ data }) => {
    return (
        <div className="h-[200px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            background: '#ffffff',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#0f172a', fontWeight: '700' }}
                        labelStyle={{ marginBottom: '4px', color: '#64748b' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#chartGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default memo(DashboardAreaChart);
