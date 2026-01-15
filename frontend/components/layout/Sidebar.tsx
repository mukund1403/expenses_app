'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { Box } from '@mui/material';
import { navItems, NavItem } from '@/components/layout/consts';
import { JSX } from 'react';

export default function Sidebar(): JSX.Element {
  const pathname: string = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'background.default',
      }}
    >
      {/* NAV ITEMS */}
      <List>
        {navItems.map(({ label, href, icon: Icon }: NavItem) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <ListItem key={href} disablePadding>
              <ListItemButton
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
                <ListItemIcon sx={{ justifyContent: 'center' }}>
                  <Icon
                    fontSize="small"
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
            </ListItem>
          );
        })}
      </List>

      {/* LOGOUT */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '0.5rem',
            }}
          >
            <ListItemIcon sx={{ justifyContent: 'center' }}>
              <LogoutRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{
                primary: {
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: 'text.secondary',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
