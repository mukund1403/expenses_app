import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import { MoreHorizRounded } from '@mui/icons-material';
import {
  Transaction,
  transactionCategoryIncomeMap,
  transactionCategoryExpenseMap,
  CurrencySummary,
} from '@/components/transactions/consts';

export function getTransactionIcon(
  subcategory: string,
): ElementType<SvgIconProps> {
  for (const category of Object.values({
    ...transactionCategoryIncomeMap,
    ...transactionCategoryExpenseMap,
  })) {
    if (category.subcategories.includes(subcategory)) {
      return category.icon;
    }
  }

  return MoreHorizRounded;
}

export function getCurrencySummaryList(
  transactionList: Transaction[],
): CurrencySummary[] {
  const overviewMap: Record<string, CurrencySummary> = {};

  transactionList.forEach(({ currency, amount, type }) => {
    if (!overviewMap[currency]) {
      overviewMap[currency] = { currency, income: 0, expense: 0 };
    }

    if (type === 'income') {
      overviewMap[currency].income += amount;
    } else {
      overviewMap[currency].expense += amount;
    }
  });

  return Object.values(overviewMap).sort((a, b) => {
    return a.currency.localeCompare(b.currency); // sorts alphabetically
  });
}
