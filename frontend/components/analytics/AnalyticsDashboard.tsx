'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SwapHorizRounded } from '@mui/icons-material';
import { Transaction } from '@/components/transactions/consts';
import MonthNavigator from '@/components/analytics/MonthNavigator';
import MonthlySummary from '@/components/analytics/MonthlySummary';
import CategoryHighlight from '@/components/analytics/CategoryHighlight';
import AnalyticsBarChart from '@/components/analytics/AnalyticsBarChart';
import AnalyticsPieChart from '@/components/analytics/AnalyticsPieChart';
import {
  computeMonthlyAnalytics,
  convertAnalytics,
  filterTransactionsByMonth,
  getExchangeRates,
  MonthlyAnalytics,
} from '@/components/analytics/utils';

type ChartType = 'bar' | 'pie';
type TxType = 'expense' | 'income';

export default function AnalyticsDashboard({
  transactionList,
}: {
  transactionList: Transaction[];
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [txType, setTxType] = useState<TxType>('expense');
  const [chartType, setChartType] = useState<ChartType>(isMobile ? 'bar' : 'pie');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<string | null>(null);
  const [convertedAnalytics, setConvertedAnalytics] = useState<MonthlyAnalytics | null>(null);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedCategory(null);
    setConvertedAnalytics(null);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const filtered = useMemo(
    () => filterTransactionsByMonth(transactionList, year, month, txType),
    [transactionList, year, month, txType],
  );

  const analytics = useMemo(() => computeMonthlyAnalytics(filtered), [filtered]);

  // Unique currencies present this month
  const activeCurrencies = useMemo(
    () => Object.keys(analytics.currencyTotals),
    [analytics.currencyTotals],
  );

  // The analytics to actually display (converted or raw)
  const displayAnalytics = convertedAnalytics ?? analytics;

  const handleConvert = async (base: string) => {
    setBaseCurrency(base);
    setConversionError(null);
    setIsConverting(true);
    try {
      const { rates } = await getExchangeRates(base);
      const converted = convertAnalytics(analytics, base, rates);
      setConvertedAnalytics(converted);
      setSelectedCategory(null);
    } catch (e) {
      setConversionError(
        e instanceof Error ? e.message : 'Failed to fetch exchange rates.',
      );
      setConvertedAnalytics(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleClearConversion = () => {
    setConvertedAnalytics(null);
    setBaseCurrency(null);
    setConversionError(null);
    setSelectedCategory(null);
  };

  const selectedCategoryData = useMemo(
    () =>
      selectedCategory
        ? displayAnalytics.categoryData.find((d) => d.category === selectedCategory) ?? null
        : null,
    [selectedCategory, displayAnalytics],
  );

  return (
    <Stack spacing={1} sx={{ margin: '0.5rem' }}>
      {/* Month Navigator */}
      <Box
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          padding: '1rem',
          boxShadow: 3,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <MonthNavigator year={year} month={month} onChange={handleMonthChange} />
      </Box>

      {/* Expense / Income toggle */}
      <Box
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          padding: '1rem',
          boxShadow: 3,
        }}
      >
        <Stack direction='row' spacing={1}>
          {(['expense', 'income'] as TxType[]).map((t) => (
            <Button
              key={t}
              variant={txType === t ? 'contained' : 'outlined'}
              onClick={() => {
                setTxType(t);
                setSelectedCategory(null);
                setConvertedAnalytics(null);
                setBaseCurrency(null);
              }}
              sx={{ color: txType === t ? 'text.primary' : 'primary.main' }}
            >
              {t}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Monthly totals summary */}
      <MonthlySummary
        currencyTotals={displayAnalytics.currencyTotals}
        type={txType}
        isConverted={!!convertedAnalytics}
      />

      {/* Currency conversion row — only shown when multiple currencies exist */}
      {activeCurrencies.length > 1 && (
        <Box
          sx={{
            borderRadius: '0.5rem',
            backgroundColor: 'background.paper',
            padding: '1rem',
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <SwapHorizRounded sx={{ color: 'text.secondary' }} />
          <Typography variant='body2' color='text.secondary'>
            Convert to
          </Typography>
          <Select
            value={baseCurrency ?? ''}
            displayEmpty
            onChange={(e) => handleConvert(e.target.value)}
            size='small'
            sx={{ fontSize: 'small', minWidth: '6rem' }}
            disabled={isConverting}
          >
            <MenuItem value='' disabled>
              Select
            </MenuItem>
            {activeCurrencies.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
          {isConverting && <CircularProgress size={18} />}
          {convertedAnalytics && !isConverting && (
            <Button size='small' variant='text' onClick={handleClearConversion}>
              Clear
            </Button>
          )}
          {conversionError && (
            <Alert severity='error' sx={{ py: 0, px: 1, fontSize: '0.8rem' }}>
              {conversionError}
            </Alert>
          )}
        </Box>
      )}

      {/* Chart type selector */}
      <Box
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          padding: '1rem',
          boxShadow: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          Chart type
        </Typography>
        <Select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          size='small'
          sx={{ fontSize: 'small', minWidth: '7rem' }}
        >
          <MenuItem value='bar'>Bar Chart</MenuItem>
          <MenuItem value='pie'>Pie Chart</MenuItem>
        </Select>
      </Box>

      {/* Chart */}
      <Box
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          padding: '1rem',
          boxShadow: 3,
        }}
      >
        {displayAnalytics.categoryData.length === 0 ? (
          <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
            No {txType} transactions for this month.
          </Typography>
        ) : chartType === 'bar' ? (
          <AnalyticsBarChart
            categoryData={displayAnalytics.categoryData}
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
          />
        ) : (
          <AnalyticsPieChart
            categoryData={displayAnalytics.categoryData}
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
          />
        )}
      </Box>

      {/* Category highlight card — only shown when a category is selected */}
      {selectedCategoryData && (
        <CategoryHighlight
          categoryData={selectedCategoryData}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </Stack>
  );
}
