'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { CategoryData } from '@/components/analytics/utils';
import { useTheme } from '@mui/material';

interface AnalyticsBarChartProps {
  categoryData: CategoryData[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

// Generate distinct colors for currencies
const CURRENCY_COLORS = [
  '#6366f1',
  '#22d3ee',
  '#f59e0b',
  '#10b981',
  '#f43f5e',
  '#a855f7',
];

export default function AnalyticsBarChart({
  categoryData,
  onSelectCategory,
  selectedCategory,
}: AnalyticsBarChartProps) {
  const theme = useTheme();

  // Collect all unique currencies across all categories
  const allCurrencies = Array.from(
    new Set(
      categoryData.flatMap((d) => d.currencyBreakdowns.map((c) => c.currency)),
    ),
  );

  // Flatten to recharts-friendly format: { category, SGD: 100, MYR: 50, ... }
  const chartData = categoryData.map((d) => {
    const row: Record<string, string | number> = {
      category: d.category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      rawCategory: d.category,
    };
    d.currencyBreakdowns.forEach(({ currency, total }) => {
      row[currency] = total;
    });
    return row;
  });

  // eslint-disable-next-line
  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]) {
      onSelectCategory(data.activePayload[0].payload.rawCategory);
    }
  };

  return (
    <ResponsiveContainer width='100%' height={320}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <XAxis
          dataKey='category'
          tick={{
            fontSize: 11,
            fill: theme.palette.text.secondary,
          }}
          angle={-35}
          textAnchor='end'
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: '0.5rem' }}
          verticalAlign='top'
        />
        {allCurrencies.map((currency, i) => (
          <Bar
            key={currency}
            dataKey={currency}
            stackId='a'
            fill={CURRENCY_COLORS[i % CURRENCY_COLORS.length]}
            radius={
              i === allCurrencies.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
            }
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.rawCategory as string}
                opacity={
                  selectedCategory === null ||
                  selectedCategory === entry.rawCategory
                    ? 1
                    : 0.35
                }
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
