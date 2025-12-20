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

export interface Transaction {
  transaction_id: string;
  merchant: string;
  amount: number;
  currency: string;
  account: string;
  category: string;
  datetime: ISO8601String;
}

export const transactionCategoryMap: Record<
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
      'transfer',
      'credit card payment',
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
    subcategories: ['shopping', 'clothing', 'other shopping', 'subscriptions'],
    icon: ShoppingCartRounded,
  },
  'Work & Income': {
    subcategories: [
      'business & work',
      'primary paycheck',
      'business income',
      'repayment from others',
      'other income',
      'education',
      'gifts & donations',
      'other expenses',
    ],
    icon: WorkRounded,
  },
} as const;
