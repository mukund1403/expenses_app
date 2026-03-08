'use client';

import { Box, Chip, Typography } from '@mui/material';

interface MonthlySummaryProps {
  currencyTotals: Record<string, number>;
  type: 'expense' | 'income';
  isConverted?: boolean;
}

export default function MonthlySummary({
  currencyTotals,
  type,
  isConverted = false,
}: MonthlySummaryProps) {
  const entries = Object.entries(currencyTotals);

  return (
    <Box
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        padding: '1rem',
        boxShadow: 3,
      }}
    >
      <Typography variant='overline' color='text.secondary'>
        Total {type === 'expense' ? 'Expenses' : 'Income'}
        {isConverted ? ' (converted)' : ''}
      </Typography>
      {entries.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          No transactions this month.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
          {entries.map(([currency, total]) => (
            <Chip
              key={currency}
              label={`${currency} ${total.toFixed(2)}`}
              variant='outlined'
              color={type === 'expense' ? 'error' : 'success'}
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
