'use client';

import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  Box,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add,
  DeleteRounded,
  ChevronRightRounded,
  ChevronLeftRounded,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  Transaction,
  transactionCategoryExpenseMap,
  transactionCategoryIncomeMap,
} from '@/components/transactions/consts';
import {
  getTransactionIcon,
  getCurrencySymbol,
} from '@/components/transactions/utils';
import { getExchangeRates, MONTH_NAMES } from '@/components/analytics/utils';
import CurrencyAmountItem from '@/components/transactions/CurrencyAmountItem';
import TransactionRowActions from '@/components/transactions/TransactionRowActions';
import TransactionSummaryCards from '@/components/transactions/TransactionSummaryCards';
import deleteTransactionAction from '@/app/(sidebar)/transactions/edit/deleteTransactionAction';
import { useNotification } from '@/providers/NotificationProvider';

function getMostUsedCurrency(transactions: Transaction[]): string {
  const counts: Record<string, number> = {};
  transactions.forEach(({ currency }) => {
    counts[currency] = (counts[currency] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'USD';
}

function TransactionIcon({
  category,
  size = 20,
}: {
  category: string;
  size?: number;
}) {
  return React.createElement(getTransactionIcon(category), {
    sx: { fontSize: size },
  });
}

function SwipeableRow({
  transaction,
  isLast,
  onDeleteConfirm,
}: {
  transaction: Transaction;
  isLast: boolean;
  onDeleteConfirm: (id: string) => void;
}) {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const DELETE_THRESHOLD = 80;

  const {
    transaction_id,
    merchant,
    amount,
    currency,
    category,
    datetime,
    type,
  } = transaction;

  const cleanMerchant = merchant
    .replace(/\s*[\((]Mobile ending[^)]*[\))]?/gi, '')
    .trim();

  const formattedCategory = category
    ? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  const formattedDate = datetime
    ? new Date(datetime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setOffset(Math.max(diff, -DELETE_THRESHOLD));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setDragging(false);
    if (offset < -DELETE_THRESHOLD * 0.6) {
      setOffset(-DELETE_THRESHOLD);
    } else {
      setOffset(0);
    }
  };

  const handleRowClick = () => {
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    router.push(`/transactions/edit?transaction_id=${transaction_id}`);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: `${DELETE_THRESHOLD}px`,
          backgroundColor: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={() => onDeleteConfirm(transaction_id)}
      >
        <DeleteRounded sx={{ color: 'white' }} />
      </Box>

      <Box
        onClick={handleRowClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          backgroundColor: 'background.paper',
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'background.default',
            color: 'primary.main',
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          <TransactionIcon category={category} size={20} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='body2' fontWeight={600} noWrap>
            {cleanMerchant}
          </Typography>
          <Typography variant='caption' color='text.secondary' noWrap>
            {formattedCategory}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <CurrencyAmountItem
              currency={currency}
              amount={amount.toFixed(2)}
              type={type}
            />
            <Typography variant='caption' color='text.secondary'>
              {formattedDate}
            </Typography>
          </Box>
          <ChevronRightRounded sx={{ color: 'text.disabled', fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function TransactionList({
  transactionList = [],
}: {
  transactionList: Transaction[];
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { showSnackbar } = useNotification();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number | null>(
    now.getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    now.getMonth(),
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const categoryList = useMemo(() => {
    return Object.keys({
      ...transactionCategoryExpenseMap,
      ...transactionCategoryIncomeMap,
    }).sort();
  }, []);

  const accountList = useMemo(() => {
    const accs = new Set(transactionList.map((t) => t.account));
    return Array.from(accs).sort();
  }, [transactionList]);

  const monthFiltered = useMemo(() => {
    if (selectedYear === null || selectedMonth === null) return transactionList;
    return transactionList.filter((tx) => {
      const d = new Date(tx.datetime);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactionList, selectedYear, selectedMonth]);

  const filtered = useMemo(() => {
    return monthFiltered.filter((tx) => {
      if (filterCategory !== 'all' && tx.category !== filterCategory)
        return false;
      if (filterAccount !== 'all' && tx.account !== filterAccount) return false;
      return true;
    });
  }, [monthFiltered, filterCategory, filterAccount]);

  const { income, expense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filtered.forEach((tx) => {
      const rate = rates?.[tx.currency] ?? 1;
      const converted = tx.amount / rate;
      if (tx.type === 'income') income += converted;
      else expense += converted;
    });
    return { income, expense };
  }, [filtered, rates]);

  const multiCurrency = useMemo(() => {
    const currencies = new Set(filtered.map((t) => t.currency));
    return currencies.size > 1;
  }, [filtered]);

  const fetchRates = useCallback(async (base: string) => {
    setIsConverting(true);
    try {
      const { rates } = await getExchangeRates(base);
      setRates(rates);
    } catch {
      setRates(null);
    } finally {
      setIsConverting(false);
    }
  }, []);

  const baseCurrency = useMemo(() => {
    return getMostUsedCurrency(monthFiltered);
  }, [monthFiltered]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsConverting(true);
      try {
        const { rates } = await getExchangeRates(baseCurrency);
        if (!cancelled) setRates(rates);
      } catch {
        if (!cancelled) setRates(null);
      } finally {
        if (!cancelled) setIsConverting(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [baseCurrency]);

  const handlePrevMonth = () => {
    if (selectedYear === null) {
      const d = new Date();
      setSelectedYear(d.getFullYear());
      setSelectedMonth(d.getMonth());
      return;
    }
    if (selectedMonth === 0) {
      setSelectedYear((y) => y! - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth((m) => m! - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedYear === null) return;
    if (selectedMonth === 11) {
      setSelectedYear((y) => y! + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth((m) => m! + 1);
    }
  };

  const isAllTime = selectedYear === null;
  const monthLabel = isAllTime
    ? 'All time'
    : `${MONTH_NAMES[selectedMonth!]} ${selectedYear}`;

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    setDeleteTargetId(null);
    deleteTransactionAction(deleteTargetId)
      .then(() => {
        showSnackbar('Transaction Deleted Successfully.', 'success');
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to Delete Transaction.';
        showSnackbar(message, 'error');
      });
  };

  return (
    <Box sx={{ margin: '1rem' }}>
      <Typography variant='h5' fontWeight={700} sx={{ mb: 1.5 }}>
        Your Transactions
      </Typography>

      {/* Month picker */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <IconButton size='small' onClick={handlePrevMonth}>
          <ChevronLeftRounded />
        </IconButton>
        <Typography
          variant='body2'
          fontWeight={500}
          sx={{ minWidth: 130, textAlign: 'center' }}
        >
          {monthLabel}
        </Typography>
        <IconButton size='small' onClick={handleNextMonth} disabled={isAllTime}>
          <ChevronRightRounded />
        </IconButton>
        <Button
          size='small'
          variant={isAllTime ? 'contained' : 'outlined'}
          onClick={() => {
            setSelectedYear(null);
            setSelectedMonth(null);
          }}
          sx={{ ml: 1, fontSize: '0.75rem', py: 0.3 }}
        >
          All
        </Button>
      </Box>

      {/* Summary cards */}
      <Box sx={{ mb: 2 }}>
        <TransactionSummaryCards
          income={income}
          expense={expense}
          baseCurrency={baseCurrency}
          isConverting={isConverting}
          multiCurrency={multiCurrency}
        />
      </Box>

      {/* Filters */}
      {isMobile ? (
        <Box sx={{ mb: 1.5 }}>
          <Stack
            direction='row'
            spacing={1}
            sx={{
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Chip
              label='All categories'
              size='small'
              onClick={() => setFilterCategory('all')}
              color={filterCategory === 'all' ? 'primary' : 'default'}
            />
            {categoryList.map((cat) => (
              <Chip
                key={cat}
                label={cat
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                size='small'
                onClick={() =>
                  setFilterCategory(cat === filterCategory ? 'all' : cat)
                }
                color={filterCategory === cat ? 'primary' : 'default'}
              />
            ))}
          </Stack>
          <Stack
            direction='row'
            spacing={1}
            sx={{
              overflowX: 'auto',
              pb: 0.5,
              mt: 0.5,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Chip
              label='All accounts'
              size='small'
              onClick={() => setFilterAccount('all')}
              color={filterAccount === 'all' ? 'primary' : 'default'}
            />
            {accountList.map((acc) => (
              <Chip
                key={acc}
                label={acc}
                size='small'
                onClick={() =>
                  setFilterAccount(acc === filterAccount ? 'all' : acc)
                }
                color={filterAccount === acc ? 'primary' : 'default'}
              />
            ))}
          </Stack>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value='all'>All categories</MenuItem>
              {categoryList.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <Select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              displayEmpty
            >
              <MenuItem value='all'>All accounts</MenuItem>
              {accountList.map((acc) => (
                <MenuItem key={acc} value={acc}>
                  {acc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Transaction rows */}
      {isMobile ? (
        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
            boxShadow: 1,
          }}
        >
          {filtered.length === 0 ? (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ p: 3, textAlign: 'center' }}
            >
              No transactions found.
            </Typography>
          ) : (
            filtered.map((transaction, index) => (
              <SwipeableRow
                key={transaction.transaction_id}
                transaction={transaction}
                isLast={index === filtered.length - 1}
                onDeleteConfirm={(id) => setDeleteTargetId(id)}
              />
            ))
          )}
        </Box>
      ) : (
        <TableContainer
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: 'background.paper',
            boxShadow: 1,
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {['Merchant', 'Account', 'Category', 'Date', 'Amount', ''].map(
                  (col) => (
                    <TableCell
                      key={col}
                      align='center'
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 1.5,
                      }}
                    >
                      {col}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      No transactions found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((transaction) => {
                  const {
                    transaction_id,
                    merchant,
                    amount,
                    currency,
                    account,
                    category,
                    datetime,
                    type,
                  } = transaction;

                  const formattedCategory = category
                    ? category
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : '';
                  const formattedDate = datetime
                    ? new Date(datetime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })
                    : '';

                  return (
                    <TableRow
                      key={transaction_id}
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      <TableCell align='center'>
                        <Typography variant='body2' fontWeight={500}>
                          {merchant}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {account}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: 'background.default',
                              color: 'primary.main',
                              width: 28,
                              height: 28,
                            }}
                          >
                            <TransactionIcon category={category} size={16} />
                          </Avatar>
                          <Typography variant='body2' color='text.secondary'>
                            {formattedCategory}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {formattedDate}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <CurrencyAmountItem
                          currency={currency}
                          amount={amount.toFixed(2)}
                          type={type}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <TransactionRowActions
                          transaction_id={transaction_id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete dialog (mobile) */}
      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color='primary'
        aria-label='add-transaction'
        href='/transactions/create'
        sx={{
          position: 'fixed',
          bottom: { xs: 71, sm: 24 },
          right: 24,
          zIndex: 10,
          color: 'text.primary',
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
