'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  InfoRounded,
  DeleteRounded,
  DriveFolderUploadRounded,
  RestartAltRounded,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  emptyTransaction,
  Transaction,
  transactionCategoryIncomeMap,
  transactionCategoryExpenseMap,
  TransactionType,
  currencyList,
} from '@/components/transactions/consts';
import {
  validateTransactionField,
  validateTransaction,
} from '@/components/transactions/utils';
import postTransactionAction from '@/app/(sidebar)/transactions/create/postTransactionAction';
import putTransactionAction from '@/app/(sidebar)/transactions/edit/putTransactionAction';
import deleteTransactionAction from '@/app/(sidebar)/transactions/edit/deleteTransactionAction';
import { useNotification } from '@/providers/NotificationProvider';

type TransactionFormProps =
  | { type: 'create'; initialTransaction: null }
  | { type: 'edit'; initialTransaction: Transaction };

export default function TransactionForm({
  initialTransaction: initTx, // shorthand for readability
  type,
}: TransactionFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { showSnackbar } = useNotification();

  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction>(
    (initTx as Transaction) ?? emptyTransaction,
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof Transaction, string>>
  >({});

  /* Params for Category Select*/

  const transactionCategoryMap = useMemo(() => {
    return transaction.type === 'income'
      ? transactionCategoryIncomeMap
      : transactionCategoryExpenseMap;
  }, [transaction.type]);

  const categoryList = useMemo(() => {
    return Object.entries(transactionCategoryMap).map(([name, { icon }]) => ({
      name,
      icon,
    }));
  }, [transactionCategoryMap]);

  const activeCategory = useMemo(() => {
    return (
      Object.entries(transactionCategoryMap).find(([, { subcategories }]) =>
        subcategories.includes(transaction.category),
      )?.[0] ?? ''
    );
  }, [transactionCategoryMap, transaction.category]);

  const subcategoryList = useMemo(() => {
    return activeCategory
      ? transactionCategoryMap[activeCategory].subcategories
      : [];
  }, [activeCategory, transactionCategoryMap]);

  const updateField = <K extends keyof Transaction>(
    key: K,
    value: Transaction[K],
  ) => {
    setTransaction((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const createBlurHandler =
    <K extends keyof Transaction>(field: K) =>
    () => {
      const error = validateTransactionField(field, transaction[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error ?? '',
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

  /* Button Press Handlers */

  const handleReset = () => {
    setTransaction((initTx as Transaction) ?? emptyTransaction);
  };

  const handleDelete = () => {
    if (transaction.transaction_id) {
      deleteTransactionAction(transaction.transaction_id)
        .then(() => {
          showSnackbar('Transaction Deleted Successfully.', 'success');
          router.push('/transactions');
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to Delete Transaction.';
          showSnackbar(message, 'error');
        });
    }
  };

  const handleSubmit = () => {
    const newErrors = validateTransaction(transaction);
    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      showSnackbar(
        'Some fields are invalid. Please review and try again.',
        'error',
      );
      return;
    }

    if (type === 'create') {
      postTransactionAction(transaction)
        .then(() => {
          showSnackbar('Transaction Created Successfully.', 'success');
          router.push('/transactions');
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to Create Transaction.';
          showSnackbar(message, 'error');
        });
    }

    if (type === 'edit') {
      putTransactionAction(transaction, initTx)
        .then(() => {
          showSnackbar('Transaction Updated Successfully.', 'success');
          router.push('/transactions');
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to Update Transaction.';
          showSnackbar(message, 'error');
        });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Grid container spacing={1} sx={{ margin: '0.5rem' }}>
        <TransactionFormGrid size={12}>
          <Typography variant='h4' gutterBottom>
            {type === 'create' ? 'New Transaction' : 'Edit Transaction'}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {type === 'create'
              ? 'Add details for a new Income or Expense.'
              : 'Edit details of an existing Income or Expense.'}
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
            onBlur={createBlurHandler('merchant')}
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
            {errors.merchant && (
              <Box display='flex' alignItems='center' gap={0.5}>
                <InfoRounded fontSize='small' />
                {errors.merchant}
              </Box>
            )}
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
            onBlur={createBlurHandler('account')}
            error={!!errors.account}
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
            {errors.account && (
              <Box display='flex' alignItems='center' gap={0.5}>
                <InfoRounded fontSize='small' />
                {errors.account}
              </Box>
            )}
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
              id='currency-input-label'
              value={transaction.currency ?? ''}
              options={currencyList}
              onChange={(e, value) => {
                updateField('currency', value ?? '');
              }}
              onBlur={createBlurHandler('currency')}
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
                // TODO: Find more robust way to enforce Float X.XX
                const value = e.target.value;
                updateField('amount', value === '' ? 0 : Number(value));
              }}
              onBlur={createBlurHandler('amount')}
              error={!!errors.amount}
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
            {(errors.currency || errors.amount) && (
              <Box display='flex' alignItems='center' gap={0.5}>
                <InfoRounded fontSize='small' />
                {errors.currency ? errors.currency : errors.amount}
              </Box>
            )}
          </FormHelperText>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <TransactionFormLabel>Date</TransactionFormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={transaction.datetime ? dayjs(transaction.datetime) : null}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  onBlur: createBlurHandler('datetime'),
                  error: !!errors.datetime,
                  InputProps: {
                    id: 'datetime-input-label',
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
          <FormHelperText error component='div'>
            {errors.datetime && (
              <Box display='flex' alignItems='center' gap={0.5}>
                <InfoRounded fontSize='small' />
                {errors.datetime}
              </Box>
            )}
          </FormHelperText>
        </TransactionFormGrid>
        <TransactionFormGrid size={12}>
          <Grid container spacing={1}>
            <Grid size={isMobile || type === 'create' ? 12 : 6}>
              <Button
                variant='text'
                color='primary'
                startIcon={<RestartAltRounded />}
                onClick={handleReset}
                fullWidth
              >
                Reset
              </Button>
            </Grid>
            {type === 'edit' && (
              <Grid size={isMobile ? 12 : 6}>
                <Button
                  variant='text'
                  color='error'
                  startIcon={<DeleteRounded />}
                  onClick={handleDelete}
                  fullWidth
                >
                  Delete
                </Button>
              </Grid>
            )}
            <Grid size={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                startIcon={<DriveFolderUploadRounded />}
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
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
