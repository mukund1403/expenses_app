'use client';

import {
  emptyTransaction,
  Transaction,
  transactionCategoryIncomeMap,
  transactionCategoryExpenseMap,
  TransactionType,
  currencyList,
} from '@/components/transactions/consts';
import { ElementType, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  SvgIconProps,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import submitTransactionAction from '@/app/(sidebar)/transactions/create/submitTransactionAction';

import { styled } from '@mui/material/styles';
import { InfoRounded } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

export default function TransactionForm({
  initialTransaction: initTx, // shorthand for readability
}: {
  initialTransaction: Transaction | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [transaction, setTransaction] = useState<Transaction>(
    (initTx as Transaction) ?? emptyTransaction,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Params for Category Select*/

  const transactionCategoryMap =
    transaction.type === 'income'
      ? transactionCategoryIncomeMap
      : transactionCategoryExpenseMap;

  const categoryList: { name: string; icon: ElementType<SvgIconProps> }[] =
    Object.entries(transactionCategoryMap).map(([name, { icon }]) => ({
      name,
      icon,
    }));

  const activeCategory: string =
    Object.entries(transactionCategoryMap).find(([, { subcategories }]) =>
      subcategories.includes(transaction.category),
    )?.[0] || '';

  const subcategoryList: string[] = activeCategory
    ? transactionCategoryMap[activeCategory].subcategories
    : [];

  const updateField = <K extends keyof Transaction>(
    key: K,
    value: Transaction[K],
  ) => {
    setTransaction((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onTypeChange = (type: TransactionType) => {
    updateField('type', type as TransactionType);
    const categoryMap =
      type === 'income'
        ? transactionCategoryIncomeMap
        : transactionCategoryExpenseMap;
    const firstCategoryKey = Object.keys(categoryMap)[0];
    updateField('category', categoryMap[firstCategoryKey].subcategories[0]);
  };

  return (
    <form onSubmit={() => {}}>
      <Grid container spacing={1} sx={{ margin: '1rem' }}>
        <TransactionFormGrid size={12}>
          <Typography variant='h4' gutterBottom>
            New Transaction
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add details for a new Income or Expense.
          </Typography>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <TransactionFormLabel>Transaction Type</TransactionFormLabel>
          <Stack direction='row' flexWrap='wrap'>
            <Button
              key='expense'
              variant={
                transaction.type === 'expense' ? 'contained' : 'outlined'
              }
              sx={{ m: '0.2rem' }}
              onClick={() => {
                onTypeChange('expense');
              }}
            >
              expense
            </Button>
            <Button
              key='income'
              variant={transaction.type === 'income' ? 'contained' : 'outlined'}
              sx={{ m: '0.2rem' }}
              onClick={() => {
                onTypeChange('income');
              }}
            >
              income
            </Button>
          </Stack>
        </TransactionFormGrid>
        <TransactionFormGrid size={isMobile ? 12 : 6}>
          <TransactionFormLabel>Merchant / Store Name</TransactionFormLabel>
          <TextField
            id='merchant-input-label'
            value={transaction.merchant}
            onChange={(e) => {
              updateField('merchant', e.target.value);
            }}
            error={!!errors.merchant}
            fullWidth
            slotProps={{
              input: {
                sx: {
                  fontSize: 'small',
                },
              },
            }}
          />
          <FormHelperText error component='div'>
            <Box display='flex' alignItems='center' gap={0.5}>
              <InfoRounded fontSize='small' />
              Merchant cannot be empty.
            </Box>
          </FormHelperText>
        </TransactionFormGrid>
        <TransactionFormGrid size={isMobile ? 12 : 6}>
          <TransactionFormLabel>Account Name</TransactionFormLabel>
          <TextField
            id='account-input-label'
            value={transaction.account}
            onChange={(e) => {
              updateField('account', e.target.value);
            }}
            error={!!errors.merchant}
            fullWidth
            slotProps={{
              input: {
                sx: {
                  fontSize: 'small',
                },
              },
            }}
          />
          <FormHelperText error component='div'>
            <Box display='flex' alignItems='center' gap={0.5}>
              <InfoRounded fontSize='small' />
              Account cannot be empty.
            </Box>
          </FormHelperText>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <TransactionFormLabel>Category</TransactionFormLabel>
          <Stack direction='row' flexWrap='wrap'>
            {categoryList.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                startIcon={<Icon />}
                variant={name === activeCategory ? 'contained' : 'outlined'}
                sx={{ m: '0.2rem' }}
                onClick={() => {
                  if (name === activeCategory) return;

                  const defaultSubcategory =
                    transactionCategoryMap[name].subcategories[0];
                  updateField('category', defaultSubcategory);
                }}
              >
                {name}
              </Button>
            ))}
          </Stack>
          <TransactionFormLabel>Subcategory</TransactionFormLabel>
          <Stack direction='row' flexWrap='wrap'>
            {(() => {
              return subcategoryList.map((subcategory: string) => (
                <Button
                  key={subcategory}
                  variant={
                    transaction.category === subcategory
                      ? 'contained'
                      : 'outlined'
                  }
                  sx={{ m: '0.2rem' }}
                  onClick={() => {
                    updateField('category', subcategory);
                  }}
                >
                  {subcategory}
                </Button>
              ));
            })()}
          </Stack>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <TransactionFormLabel>Amount & Currency</TransactionFormLabel>
          <Box sx={{ display: 'flex' }}>
            <Autocomplete
              options={currencyList}
              onChange={(e, value) => {
                updateField('currency', value ?? '');
              }}
              slotProps={{
                listbox: {
                  style: { fontSize: 'small' },
                },
              }}
              sx={{ width: '10rem' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  slotProps={{
                    htmlInput: {
                      ...params.inputProps,
                      style: { fontSize: 'small' },
                    },
                  }}
                />
              )}
            />
            <TextField
              id='amount-input-label'
              value={transaction.amount}
              type='number'
              onChange={(e) => {
                const value = e.target.value;
                updateField('amount', value === '' ? 0 : Number(value));
              }}
              error={!!errors.merchant}
              fullWidth
              slotProps={{
                input: {
                  sx: {
                    fontSize: 'small',
                  },
                },
              }}
            />
          </Box>
          <FormHelperText error component='div'>
            <Box display='flex' alignItems='center' gap={0.5}>
              <InfoRounded fontSize='small' />
              Amount must be to 2 decimal points.
            </Box>
          </FormHelperText>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  InputProps: {
                    sx: {
                      fontSize: 'small',
                    },
                  },
                },
              }}
              onChange={(date: Dayjs | null) => {
                const isoString = date ? date.toISOString() : '';
                updateField('datetime', isoString);
              }}
            />
          </LocalizationProvider>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={() => {
              // TODO: Implement validation properly with error strings
              // TODO: Display errors properly in Modal
              const newErrors: Record<string, string> = {};
              if (!transaction.merchant)
                newErrors.merchant = 'Merchant cannot be empty';
              if (!transaction.account)
                newErrors.account = 'Account cannot be empty';
              if (!transaction.amount)
                newErrors.amount = 'Amount cannot be zero';
              setErrors(newErrors);

              if (Object.keys(newErrors).length === 0) {
                submitTransactionAction(transaction);
              }
            }}
          >
            Submit
          </Button>
        </TransactionFormGrid>
      </Grid>
    </form>
  );
}

const TransactionFormGrid = styled(Grid)(({ theme }) => ({
  borderRadius: '0.5rem',
  backgroundColor: theme.palette.background.paper,
  borderStyle: 'solid',
  padding: '1rem',
  overflow: 'hidden',
}));

const TransactionFormLabel = styled(InputLabel)(({ theme }) => ({
  width: '100%',
  marginBottom: '0.4rem',
}));
