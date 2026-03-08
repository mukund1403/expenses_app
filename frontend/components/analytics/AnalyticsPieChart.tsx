'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material';
import { CategoryData } from '@/components/analytics/utils';

interface AnalyticsPieChartProps {
  categoryData: CategoryData[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

const CURRENCY_COLORS = [
  '#6366f1',
  '#22d3ee',
  '#f59e0b',
  '#10b981',
  '#f43f5e',
  '#a855f7',
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: (typeof chartData)[0] }[];
}) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        fontSize: 12,
      }}
    >
      <strong>{d.name}</strong>
      {d.currencyBreakdowns.map(({ currency, total, percentage }) => (
        <div key={currency}>
          {currency} {total.toFixed(2)} · {percentage.toFixed(1)}%
        </div>
      ))}
    </div>
  );
};

// For pie we show one slice per category, stacked amounts summed for sizing
// but tooltip shows per-currency breakdown
export default function AnalyticsPieChart({
  categoryData,
  onSelectCategory,
  selectedCategory,
}: AnalyticsPieChartProps) {
  const theme = useTheme();

  // One slice per category, value = sum of all currency amounts (for proportional sizing)
  const chartData = categoryData.map((d, i) => ({
    name: d.category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    rawCategory: d.category,
    value: d.currencyBreakdowns.reduce((s, c) => s + c.total, 0),
    currencyBreakdowns: d.currencyBreakdowns,
    color: CURRENCY_COLORS[i % CURRENCY_COLORS.length],
  }));

  return (
    <ResponsiveContainer width='100%' height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          outerRadius={110}
          innerRadius={50}
          dataKey='value'
          onClick={(entry) => onSelectCategory(entry.rawCategory)}
          style={{ cursor: 'pointer' }}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.rawCategory}
              fill={entry.color}
              opacity={
                selectedCategory === null ||
                selectedCategory === entry.rawCategory
                  ? 1
                  : 0.35
              }
              stroke={
                selectedCategory === entry.rawCategory
                  ? theme.palette.text.primary
                  : 'transparent'
              }
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}
