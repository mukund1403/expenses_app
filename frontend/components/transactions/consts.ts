import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import {
  HomeRounded,
  ReceiptRounded,
  DirectionsCarFilledRounded,
  LocalDiningRounded,
  LocalHospitalRounded, // keep for any existing use
  FlightRounded,
  ShoppingCartRounded,
  WorkRounded,
  LocalGroceryStoreRounded, // new: groceries
  TheaterComedyRounded, // new: entertainment
  SwapHorizRounded, // new: transfers
  HelpOutlineRounded,
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
  category: 'others',
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
  { icon: ElementType<SvgIconProps> }
> = {
  food_and_dining: { icon: LocalDiningRounded },
  travel: { icon: FlightRounded },
  transport: { icon: DirectionsCarFilledRounded },
  groceries: { icon: LocalGroceryStoreRounded },
  utilities: { icon: ReceiptRounded },
  transfers: { icon: SwapHorizRounded },
  entertainment: { icon: TheaterComedyRounded },
  shopping: { icon: ShoppingCartRounded },
  others: { icon: HelpOutlineRounded },
};

export const transactionCategoryIncomeMap: Record<
  string,
  { icon: ElementType<SvgIconProps> }
> = {
  salary: { icon: WorkRounded },
  transfers: { icon: SwapHorizRounded },
};
// export const transactionCategoryExpenseMap: Record<
//   string,
//   { subcategories: string[]; icon: ElementType<SvgIconProps> }
// > = {
//   food_and_dining: {
//     subcategories: ['dining', 'food & drink', 'cafes', 'restaurants & other'],
//     icon: LocalDiningRounded,
//   },
//   travel: {
//     subcategories: ['flights', 'hotels', 'airbnb', 'travel & vacation'],
//     icon: FlightRounded,
//   },
//   transport: {
//     subcategories: ['bus', 'MRT', 'ride hailing', 'auto & transport'],
//     icon: DirectionsCarFilledRounded,
//   },
//   groceries: {
//     subcategories: ['supermarket', 'grocery store', 'fresh produce'],
//     icon: LocalGroceryStoreRounded,
//   },
//   utilities: {
//     subcategories: ['bills & utilities', 'telecom', 'power', 'water', 'insurance'],
//     icon: ReceiptRounded,
//   },
//   transfers: {
//     subcategories: ['peer-to-peer', 'wallet transfer', 'PayNow', 'PayLah'],
//     icon: SwapHorizRounded,
//   },
//   entertainment: {
//     subcategories: ['movies', 'attractions', 'theme parks', 'entertainment & lifestyle'],
//     icon: TheaterComedyRounded,
//   },
//   shopping: {
//     subcategories: ['retail', 'clothing', 'subscriptions', 'online shopping'],
//     icon: ShoppingCartRounded,
//   },
//   others: {
//     subcategories: ['other expenses', 'miscellaneous'],
//     icon: HelpOutlineRounded,
//   },
// };

// export const transactionCategoryIncomeMap: Record<
//   string,
//   { subcategories: string[]; icon: ElementType<SvgIconProps> }
// > = {
//   salary: {
//     subcategories: ['primary paycheck', 'business income', 'freelance'],
//     icon: WorkRounded,
//   },
//   transfers: {
//     subcategories: ['repayment from others', 'wallet transfer', 'PayNow'],
//     icon: SwapHorizRounded,
//   },
// };

// prettier-ignore
export const currencyList: string[] = [
  "AED","ALL","AMD","AOA","ARS","AUD","AZN","BBD","BDT","BHD","BMD","BND","BOB","BRL","BSD","BYN","BWP","CAD","CDF","CHF","CLP","CNY","COP","CRC","CZK","DKK","DOP","DZD","EGP","ETB","EUR","FJD","GBP","GEL","GHS","GIP","GTQ","HKD","HNL","HRK","HUF","IDR","ILS","IMP","INR","IQD","ISK","JMD","JPY","JOD","KGS","KHR","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU","MUR","MXN","MYR","NAD","NGN","NIO","NOK","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RMB","RON","RSD","RUB","RWF","SAR","SEK","SGD","SHP","SLL","SOS","SRD","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","USD","UYU","UZS","VEF","VND","XAF","XCD","XOF","XPF","ZAR","ZMW","ZWD"
].sort();
