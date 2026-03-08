import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import { MoreHorizRounded } from '@mui/icons-material';
import {
  Transaction,
  transactionCategoryIncomeMap,
  transactionCategoryExpenseMap,
  CurrencySummary,
  currencyList,
} from '@/components/transactions/consts';

/* UI Logic */

export function getTransactionIcon(category: string): ElementType<SvgIconProps> {
  for (const map of [transactionCategoryIncomeMap, transactionCategoryExpenseMap]) {
    if (category in map) return map[category].icon;
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

/* Transaction Validation Logic */

export type TransactionValidationError = string | null;

export function validateTransactionField<K extends keyof Transaction>(
  key: K,
  value: Transaction[K],
): TransactionValidationError {
  switch (key) {
    case 'merchant':
      return (value as string).trim().length > 0
        ? null
        : 'Merchant cannot be empty.';

    case 'account':
      return (value as string).trim().length > 0
        ? null
        : 'Account cannot be empty.';

    case 'amount': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 'Amount must be a valid number.';
      }
      if (value <= 0) {
        return 'Amount must be greater than 0.';
      }
      if (!Number.isInteger(value * 100)) {
        return 'Amount must have at most 2 decimal places.';
      }
      return null;
    }

    case 'currency':
      if (!value) return 'Currency cannot be empty.';
      if (!currencyList.includes(value as string)) {
        return 'Invalid currency.';
      }
      return null;

    case 'datetime':
      if (!value) return 'Date cannot be empty.';
      if (Number.isNaN(Date.parse(value as string))) {
        return 'Invalid date.';
      }
      return null;

    case 'type':
      return value === 'income' || value === 'expense'
        ? null
        : 'Invalid transaction type.';

    default:
      return null;
  }
}

export function validateTransaction(
  tx: Transaction,
): Partial<Record<keyof Transaction, string>> {
  const errors: Partial<Record<keyof Transaction, string>> = {};

  (Object.keys(tx) as (keyof Transaction)[]).forEach((key) => {
    const error = validateTransactionField(key, tx[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
}
