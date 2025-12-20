import { Box, Typography } from '@mui/material';

export default function CurrencyAmountItem({
  currency,
  amount,
}: {
  currency: string;
  amount: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 0.4,
      }}
    >
      <Box
        sx={{
          borderRadius: '0.3rem',
          backgroundColor: 'primary.main',
          p: '0.2rem',
        }}
      >
        <Typography
          sx={{
            color: 'primary.contrastText',
            lineHeight: 1,
            fontSize: '0.8rem',
          }}
        >
          {currency}
        </Typography>
      </Box>
      <Typography
        sx={{
          lineHeight: 1,
          fontSize: '1.5rem',
          fontWeight: '500',
        }}
      >
        {amount}
      </Typography>
    </Box>
  );
}
