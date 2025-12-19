'use client';

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { ElementType, JSX } from 'react';
import { SvgIconProps } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Box } from '@mui/material';

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType<SvgIconProps>;
}

const navItems: readonly NavItem[] = [
  { label: 'Home', href: '/home', icon: HomeRoundedIcon },
  { label: 'Analytics', href: '/analytics', icon: AutoGraphRoundedIcon },
  { label: 'Budgets', href: '/budgets', icon: AccountBalanceWalletRoundedIcon },
  { label: 'Transactions', href: '/transactions', icon: ReceiptRoundedIcon },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsApplicationsRoundedIcon,
  },
] as const;

export default function Sidebar(): JSX.Element {
  const pathname: string = usePathname();

  return (
    <Box
      sx={{
        color: 'background.default',
      }}
    >
      <List>
        {navItems.map((item: NavItem) => {
          const { label, href, icon: Icon } = item;

          const isActive: boolean =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={isActive}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: '0.5rem',
              }}
            >
              <ListItemIcon sx={{ display: 'flex', justifyContent: 'center' }}>
                <Icon
                  fontSize='small'
                  sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: isActive ? 'primary.main' : 'text.secondary',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
