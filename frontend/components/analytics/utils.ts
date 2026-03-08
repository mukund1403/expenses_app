import { Transaction } from '@/components/transactions/consts';

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface CurrencyBreakdown {
  currency: string;
  total: number;
  percentage: number; // percentage within this currency's total
}

export interface CategoryData {
  category: string;
  currencyBreakdowns: CurrencyBreakdown[];
  percentageOfGrandTotal: number; // across all currencies (by count of transactions)
}

export interface MonthlyAnalytics {
  categoryData: CategoryData[];
  currencyTotals: Record<string, number>; // e.g. { SGD: 400, MYR: 200 }
  transactionCount: number;
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number, // 0-indexed (0 = January)
  type: 'expense' | 'income',
): Transaction[] {
  return transactions.filter((tx) => {
    const date = new Date(tx.datetime);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      tx.type === type
    );
  });
}

export function computeMonthlyAnalytics(
  transactions: Transaction[],
): MonthlyAnalytics {
  const categoryMap: Record<string, Record<string, number>> = {};
  const currencyTotals: Record<string, number> = {};

  transactions.forEach(({ category, currency, amount }) => {
    if (!categoryMap[category]) categoryMap[category] = {};
    categoryMap[category][currency] =
      (categoryMap[category][currency] ?? 0) + amount;
    currencyTotals[currency] = (currencyTotals[currency] ?? 0) + amount;
  });

  // Total transaction count for cross-currency percentage
  const totalTxCount = transactions.length;

  const categoryData: CategoryData[] = Object.entries(categoryMap)
    .map(([category, currencyMap]) => {
      const txCountForCategory = transactions.filter(
        (tx) => tx.category === category,
      ).length;

      const currencyBreakdowns: CurrencyBreakdown[] = Object.entries(
        currencyMap,
      ).map(([currency, total]) => ({
        currency,
        total,
        percentage:
          currencyTotals[currency] > 0
            ? (total / currencyTotals[currency]) * 100
            : 0,
      }));

      return {
        category,
        currencyBreakdowns,
        percentageOfGrandTotal:
          totalTxCount > 0 ? (txCountForCategory / totalTxCount) * 100 : 0,
      };
    })
    .sort((a, b) => {
      // Sort by total amount in first currency for consistent ordering
      const aTotal = a.currencyBreakdowns.reduce((s, c) => s + c.total, 0);
      const bTotal = b.currencyBreakdowns.reduce((s, c) => s + c.total, 0);
      return bTotal - aTotal;
    });

  return { categoryData, currencyTotals, transactionCount: totalTxCount };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* Exchange Rate Utilities */

export interface ExchangeRateCache {
  base: string;
  rates: Record<string, number>;
  date: string; // YYYY-MM-DD
}

function getCacheKey(base: string): string {
  return `exchange_rates_${base}`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadFromCache(base: string): ExchangeRateCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(base));
    if (!raw) return null;
    const parsed: ExchangeRateCache = JSON.parse(raw);
    // Only valid if cached today
    if (parsed.date !== getTodayString()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToCache(data: ExchangeRateCache): void {
  try {
    localStorage.setItem(getCacheKey(data.base), JSON.stringify(data));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

export async function getExchangeRates(
  base: string,
): Promise<ExchangeRateCache> {
  // Return cached rates if still fresh (same day)
  const cached = loadFromCache(base);
  if (cached) return cached;

  // Fetch via our server-side proxy route
  const res = await fetch(`/api/exchange-rates?base=${base}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch exchange rates: ${res.status}`);
  }

  const data: ExchangeRateCache = await res.json();
  saveToCache(data);
  return data;
}

/**
 * Converts a MonthlyAnalytics result into a single-currency view.
 * Returns a new MonthlyAnalytics where all currencyBreakdowns are
 * collapsed into one entry in the base currency.
 */
export function convertAnalytics(
  analytics: MonthlyAnalytics,
  base: string,
  rates: Record<string, number>,
): MonthlyAnalytics {
  const convertedCurrencyTotals: Record<string, number> = {};

  const categoryData: CategoryData[] = analytics.categoryData.map((d) => {
    let convertedTotal = 0;

    d.currencyBreakdowns.forEach(({ currency, total }) => {
      const rate = rates[currency];
      if (rate) {
        convertedTotal += total / rate; // convert to base
      } else {
        convertedTotal += total; // fallback: treat as same currency
      }
    });

    return {
      category: d.category,
      currencyBreakdowns: [
        {
          currency: base,
          total: convertedTotal,
          percentage: 0, // recalculated below
        },
      ],
      percentageOfGrandTotal: d.percentageOfGrandTotal,
    };
  });

  // Recompute currency totals in base
  categoryData.forEach((d) => {
    const total = d.currencyBreakdowns[0].total;
    convertedCurrencyTotals[base] = (convertedCurrencyTotals[base] ?? 0) + total;
  });

  // Recalculate percentages
  const grandTotal = convertedCurrencyTotals[base] ?? 0;
  categoryData.forEach((d) => {
    d.currencyBreakdowns[0].percentage =
      grandTotal > 0 ? (d.currencyBreakdowns[0].total / grandTotal) * 100 : 0;
  });

  // Re-sort by converted total descending
  categoryData.sort(
    (a, b) => b.currencyBreakdowns[0].total - a.currencyBreakdowns[0].total,
  );

  return {
    categoryData,
    currencyTotals: convertedCurrencyTotals,
    transactionCount: analytics.transactionCount,
  };
}