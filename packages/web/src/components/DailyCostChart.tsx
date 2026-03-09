"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyCostChartProps {
  data: Record<string, number>;
}

export function DailyCostChart({ data }: DailyCostChartProps) {
  // Convert Record<string, number> to array for Recharts
  const chartData = Object.entries(data).map(([dateStr, cost]) => ({
    date: dateStr,
    cost: cost,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col h-64 justify-center items-center text-center space-y-4 border-2 border-dashed border-slate-800 rounded-lg">
        <span className="text-slate-500">No daily cost data available yet.</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
