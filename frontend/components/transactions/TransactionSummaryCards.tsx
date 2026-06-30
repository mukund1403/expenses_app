import { Box, Typography, Skeleton } from '@mui/material';
import { getCurrencySymbol } from '@/components/transactions/utils';

export default function TransactionSummaryCards({
  income,
  expense,
  baseCurrency,
  isConverting,
  multiCurrency,
}: {
  income: number;
  expense: number;
  baseCurrency: string;
  isConverting: boolean;
  multiCurrency: boolean;
}) {
  const symbol = getCurrencySymbol(baseCurrency);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'success.main',
            p: '1rem 1.25rem',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'success.contrastText',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {isConverting ? (
              <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              `${symbol} ${income.toFixed(2)}`
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: 'success.contrastText',
              opacity: 0.85,
            }}
          >
            Income
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'error.main',
            p: '1rem 1.25rem',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'error.contrastText',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {isConverting ? (
              <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              `${symbol} ${expense.toFixed(2)}`
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: 'error.contrastText',
              opacity: 0.85,
            }}
          >
            Expenses
          </Typography>
        </Box>
      </Box>
      {multiCurrency && !isConverting && (
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 0.5, display: 'block' }}
        >
          converted to {baseCurrency}
        </Typography>
      )}
    </Box>
  );
}
