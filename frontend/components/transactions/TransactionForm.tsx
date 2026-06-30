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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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

  const [amountInput, setAmountInput] = useState<string>(
    initTx ? String(initTx.amount) : '',
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

  const activeCategory = transaction.category;

  // const subcategoryList = useMemo(() => {
  //   return activeCategory
  //     ? transactionCategoryMap[activeCategory].subcategories
  //     : [];
  // }, [activeCategory, transactionCategoryMap]);

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
    updateField('type', type);
    const categoryMap =
      type === 'income'
        ? transactionCategoryIncomeMap
        : transactionCategoryExpenseMap;
    updateField('category', Object.keys(categoryMap)[0]);
  };
  // const onTypeChange = (type: TransactionType) => {
  //   updateField('type', type as TransactionType);
  //   const categoryMap =
  //     type === 'income'
  //       ? transactionCategoryIncomeMap
  //       : transactionCategoryExpenseMap;
  //   const firstCategoryKey = Object.keys(categoryMap)[0];
  //   updateField('category', categoryMap[firstCategoryKey].subcategories[0]);
  // };

  /* Button Press Handlers */

  const handleReset = () => {
    setTransaction((initTx as Transaction) ?? emptyTransaction);
    setAmountInput(initTx ? String(initTx.amount) : '');
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    if (!transaction.transaction_id) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    deleteTransactionAction(transaction.transaction_id)
      .then(() => {
        showSnackbar('Transaction Deleted Successfully.', 'success');
        router.back();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to Delete Transaction.';
        showSnackbar(message, 'error');
      });
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
          router.back();
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
              sx={{
                m: '0.2rem',
                color:
                  transaction.type === 'expense'
                    ? 'text.primary'
                    : 'primary.main',
              }}
              onClick={() => {
                onTypeChange('expense');
              }}
            >
              expense
            </Button>
            <Button
              key='income'
              variant={transaction.type === 'income' ? 'contained' : 'outlined'}
              sx={{
                m: '0.2rem',
                color:
                  transaction.type === 'income'
                    ? 'text.primary'
                    : 'primary.main',
              }}
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
                sx={{
                  m: '0.2rem',
                  color:
                    name === activeCategory ? 'text.primary' : 'primary.main',
                }}
                onClick={() => updateField('category', name)}
              >
                {name}
              </Button>
            ))}
          </Stack>
        </TransactionFormGrid>
        {/* <TransactionFormGrid size={12}>
          <TransactionFormLabel>Category</TransactionFormLabel>
          <Stack direction='row' flexWrap='wrap'>
            {categoryList.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                startIcon={<Icon />}
                variant={name === activeCategory ? 'contained' : 'outlined'}
                sx={{
                  m: '0.2rem',
                  color:
                    name === activeCategory ? 'text.primary' : 'primary.main',
                }}
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
                  sx={{
                    m: '0.2rem',
                    color:
                      transaction.category === subcategory
                        ? 'text.primary'
                        : 'primary.main',
                  }}
                  onClick={() => {
                    updateField('category', subcategory);
                  }}
                >
                  {subcategory}
                </Button>
              ));
            })()}
          </Stack>
        </TransactionFormGrid> */}
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
                  error={!!errors.currency}
                />
              )}
            />
            <TextField
              id='amount-input-label'
              value={amountInput}
              type='text'
              inputMode='decimal'
              onChange={(e) => {
                const raw = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(raw) || raw === '') {
                  setAmountInput(raw);
                  const parsed = parseFloat(raw);
                  updateField('amount', isNaN(parsed) ? 0 : parsed);
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(amountInput);
                if (!isNaN(parsed)) {
                  setAmountInput(parsed.toFixed(2));
                  updateField('amount', parsed);
                }
                createBlurHandler('amount')();
              }}
              error={!!errors.amount}
              fullWidth
              slotProps={{ input: { sx: { fontSize: 'small' } } }}
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
                if (!date) {
                  updateField('datetime', '');
                  return;
                }
                const now = dayjs();
                const withCurrentTime = date
                  .hour(now.hour())
                  .minute(now.minute())
                  .second(now.second());
                updateField('datetime', withCurrentTime.toISOString());
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
                startIcon={<DriveFolderUploadRounded />}
                sx={{
                  color: 'text.primary',
                  backgroundColor: 'primary.main',
                }}
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </TransactionFormGrid>
      </Grid>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}

const TransactionFormGrid = styled(Grid)(({ theme }) => ({
  borderRadius: '0.5rem',
  backgroundColor: theme.palette.background.paper,
  borderStyle: 'solid',
  padding: '1rem',
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

const TransactionFormLabel = styled(InputLabel)(({ theme }) => ({
  width: '100%',
  marginBottom: '0.4rem',
}));
