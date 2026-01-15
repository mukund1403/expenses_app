import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';
import {
  AccountBalanceWalletRounded,
  AutoGraphRounded,
  HomeRounded,
  ReceiptRounded,
  SettingsApplicationsRounded,
  LogoutRounded,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType<SvgIconProps>; 
}

export const navItems: readonly NavItem[] = [
  { label: 'Home', href: '/home', icon: HomeRounded },
  { label: 'Transactions', href: '/transactions', icon: ReceiptRounded },
  { label: 'Analytics', href: '/analytics', icon: AutoGraphRounded },
  { label: 'Budgets', href: '/budgets', icon: AccountBalanceWalletRounded },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsApplicationsRounded,
  },
] as const;
