'use client';

import { Transaction } from '@/components/transactions/consts';
import { useState } from 'react';
import {
  Box,
  Grid,
  InputLabel,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export default function TransactionForm({
  initialTransaction: initTx, // shorthand for readability
}: {
  initialTransaction: Transaction | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [merchant, setMerchant] = useState<string>(initTx?.merchant ?? '');
  const [amount, setAmount] = useState<number>(initTx?.amount ?? 0.0);
  const [currency, setCurrency] = useState<string>(initTx?.currency ?? '');
  const [account, setAccount] = useState<string>(initTx?.account ?? '');
  const [category, setCategory] = useState<string>(initTx?.category ?? '');
  const [datetime, setDatetime] = useState<string>(initTx?.datetime ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAll = () => {
    const newErrors: Record<string, string> = {};

    setErrors(newErrors);
  };

  return (
    <Box
      sx={{
        borderRadius: '0.5rem',
        borderColor: 'background.paper',
        borderWidth: '2px',
        margin: '2.5rem',
        padding: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <form onSubmit={() => {}}>
        <Grid container spacing={2}>
          <Grid size={isMobile ? 12 : 6}>
            <InputLabel
              htmlFor='merchant-input-label'
              sx={{ fontSize: '0.75rem' }}
            >
              Merchant
            </InputLabel>
            <TextField
              id='merchant-input-label'
              value={merchant}
              onChange={(e) => {
                setMerchant(e.target.value);
              }}
              error={!!errors.merchant}
              helperText={errors.merchant}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid size={isMobile ? 12 : 6}>
            <InputLabel id='category-select-label' sx={{ fontSize: '0.75rem' }}>
              Category
            </InputLabel>
            <Select
              labelId='category-select-label'
              sx={{ width: '100%' }}
            ></Select>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

// export interface Transaction {
//   transaction_id: string;
//   merchant: string;
//   amount: number;
//   currency: string;
//   account: string;
//   category: string;
//   datetime: ISO8601String;
// }
