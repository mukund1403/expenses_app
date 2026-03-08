'use client';

import { Box, Chip, Divider, IconButton, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { CategoryData } from '@/components/analytics/utils';
import { getTransactionIcon } from '@/components/transactions/utils';

interface CategoryHighlightProps {
  categoryData: CategoryData;
  onClose: () => void;
}

export default function CategoryHighlight({
  categoryData,
  onClose,
}: CategoryHighlightProps) {
  const Icon = getTransactionIcon(categoryData.category);

  const formattedCategory = categoryData.category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Box
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        padding: '1rem',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon sx={{ color: 'primary.main' }} />
          <Typography variant='subtitle1' fontWeight={600}>
            {formattedCategory}
          </Typography>
        </Box>
        <IconButton size='small' onClick={onClose}>
          <CloseRounded fontSize='small' />
        </IconButton>
      </Box>

      <Divider />

      {/* Per-currency breakdown */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categoryData.currencyBreakdowns.map(
          ({ currency, total, percentage }) => (
            <Chip
              key={currency}
              label={`${currency} ${total.toFixed(2)} · ${percentage.toFixed(1)}% of ${currency} total`}
              variant='outlined'
              size='small'
              sx={{ fontSize: '0.8rem' }}
            />
          ),
        )}
      </Box>

      {/* Transaction share */}
      <Typography variant='caption' color='text.secondary'>
        {categoryData.percentageOfGrandTotal.toFixed(1)}% of this month's
        transactions
      </Typography>
    </Box>
  );
}
