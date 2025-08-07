'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Function to process data for the waterfall chart
const processDataForChart = (costBreakdown) => {
    let cumulative = 0;
    const chartData = Object.entries(costBreakdown).map(([name, value]) => {
        let range;
        let offset;

        if (name === 'Base Price') {
            range = [0, value];
            offset = 0;
        } else {
            offset = cumulative;
            range = [offset, offset + value];
        }
        
        cumulative += value;
        
        return {
            name,
            value,
            range,
            offset,
        };
    });
    
    chartData.push({
        name: 'Final VIU',
        value: cumulative,
        range: [0, cumulative],
        offset: 0
    });

    return chartData;
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border rounded shadow-lg">
                <p className="font-bold">{label}</p>
                <p>{`Impact: ${payload[0].value.toFixed(2)} USD`}</p>
            </div>
        );
    }
    return null;
};

export default function WaterfallChart({ data }) {
    if (!data) return null;

    const chartData1 = processDataForChart(data.mat1);
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData1}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Cost ($/ton)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="range" stackId="a">
                   {chartData1.map((entry, index) => {
                       let color = 'grey'; // Default for stacked parts
                       if (entry.name === 'Base Price' || entry.name === 'Final VIU') {
                           color = '#4A90E2'; // Blue for start and end
                       } else if (entry.value < 0) {
                           color = '#7ED321'; // Green for credits
                       } else {
                           color = '#D0021B'; // Red for penalties
                       }
                       return <Cell key={`cell-${index}`} fill={color} />;
                   })}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
