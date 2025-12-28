import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import {
  HomeRounded,
  ReceiptRounded,
  DirectionsCarFilledRounded,
  LocalDiningRounded,
  LocalHospitalRounded,
  FlightRounded,
  ShoppingCartRounded,
  WorkRounded,
} from '@mui/icons-material';

type ISO8601String = string;

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  transaction_id: string;
  merchant: string;
  amount: number;
  currency: string;
  account: string;
  category: string;
  datetime: ISO8601String;
  type: TransactionType;
}

export const emptyTransaction = {
  transaction_id: '',
  merchant: '',
  amount: 0,
  currency: '',
  account: '',
  category: 'home',
  datetime: '',
  type: 'expense',
};

export interface CurrencySummary {
  currency: string;
  expense: number;
  income: number;
}

export const transactionCategoryExpenseMap: Record<
  string,
  { subcategories: string[]; icon: ElementType<SvgIconProps> }
> = {
  Home: {
    subcategories: ['home', 'family & pets'],
    icon: HomeRounded,
  },
  Utilities: {
    subcategories: [
      'bills & utilities',
      'loans & financial fees',
      'taxes',
      'insurance',
    ],
    icon: ReceiptRounded,
  },
  Transport: {
    subcategories: [
      'auto & transport',
      'vehicle & repairs',
      'gas',
      'other transportation',
    ],
    icon: DirectionsCarFilledRounded,
  },
  Food: {
    subcategories: [
      'dining',
      'food & drink',
      'groceries',
      'restaurants & other',
    ],
    icon: LocalDiningRounded,
  },
  'Health & Fitness': {
    subcategories: [
      'health & wellness',
      'medical',
      'gym',
      'other health & wellness',
    ],
    icon: LocalHospitalRounded,
  },
  'Travel & Leisure': {
    subcategories: ['travel & vacation', 'entertainment & lifestyle'],
    icon: FlightRounded,
  },
  'Shopping & Subscriptions': {
    subcategories: ['shopping', 'clothing', 'subscriptions', 'other shopping'],
    icon: ShoppingCartRounded,
  },
  'Work & Income': {
    subcategories: [
      'business & work',
      'primary paycheck',
      'business income',
      'repayment from others',
      'education',
      'gifts & donations',
      'transfer',
      'credit card payment',
      'other expenses',
      'other income',
    ],
    icon: WorkRounded,
  },
} as const;

export const transactionCategoryIncomeMap: Record<
  string,
  { subcategories: string[]; icon: ElementType<SvgIconProps> }
> = {
  'Work & Income': {
    subcategories: ['transfers', 'salary'],
    icon: WorkRounded,
  },
} as const;

// prettier-ignore
export const currencyList: string[] = [
  "AED","ALL","AMD","AOA","ARS","AUD","AZN","BBD","BDT","BHD","BMD","BND","BOB","BRL","BSD","BYN","BWP","CAD","CDF","CHF","CLP","CNY","COP","CRC","CZK","DKK","DOP","DZD","EGP","ETB","EUR","FJD","GBP","GEL","GHS","GIP","GTQ","HKD","HNL","HRK","HUF","IDR","ILS","IMP","INR","IQD","ISK","JMD","JPY","JOD","KGS","KHR","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU","MUR","MXN","MYR","NAD","NGN","NIO","NOK","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SEK","SGD","SHP","SLL","SOS","SRD","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","USD","UYU","UZS","VEF","VND","XAF","XCD","XOF","XPF","ZAR","ZMW","ZWD"
].sort();
