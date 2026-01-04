'use client';

import React, { JSX } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { NavItem, navItems } from '@/components/layout/consts';

export default function BottomNav(): JSX.Element {
  const pathname: string = usePathname();
  const router = useRouter();

  const index = navItems.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  const value = index !== -1 ? index : null;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    router.push(navItems[newValue].href);
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      showLabels
      sx={{
        backgroundColor: 'background.default',
        color: 'text.secondary',
        '& .Mui-selected': {
          color: 'primary.main',
        },
      }}
    >
      {navItems.map(({ label, href, icon: Icon }: NavItem) => (
        <BottomNavigationAction
          label={label}
          key={href}
          icon={<Icon />}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
            },
          }}
        />
      ))}
    </BottomNavigation>
  );
}
