import { Typography } from '@mui/material';
import { TransactionType } from '@/components/transactions/consts';
import { getCurrencySymbol } from '@/components/transactions/utils';

export default function CurrencyAmountItem({
  currency,
  amount,
  type,
}: {
  currency: string;
  amount: string;
  type: TransactionType;
}) {
  const symbol = getCurrencySymbol(currency);

  return (
    <Typography
      sx={{
        lineHeight: 1,
        fontSize: '0.95rem',
        fontWeight: 500,
        color: type === 'income' ? 'success.main' : 'error.main',
      }}
    >
      {symbol} {amount}
    </Typography>
  );
}
