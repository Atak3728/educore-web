import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TrendChart = ({ data }) => {
    return (
        <div className="card" style={{ height: '300px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Financial Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                        itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="var(--success)" name="Earnings" strokeWidth={2} />
                    <Line type="monotone" dataKey="advances" stroke="var(--warning)" name="Advances" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
