'use client';

import { JSX, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { LogoutRounded } from '@mui/icons-material';
import { navItems, NavItem } from '@/components/layout/consts';

export default function TopNav(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        backgroundColor: scrolled
          ? 'rgba(var(--mui-palette-background-paperChannel) / 0.7)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid',
        borderColor: scrolled ? 'divider' : 'transparent',
        transition:
          'background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant='h6'
          fontWeight={700}
          sx={{ color: 'primary.main', letterSpacing: '-0.5px' }}
        >
          AutoEx
        </Typography>

        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 0.5,
          }}
        >
          {navItems.map(({ label, href, icon: Icon }: NavItem) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Button
                key={href}
                component={Link}
                href={href}
                startIcon={<Icon fontSize='small' />}
                size='small'
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive ? 'action.selected' : 'transparent',
                  borderRadius: '0.5rem',
                  px: 1.5,
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        <Button
          onClick={handleLogout}
          startIcon={<LogoutRounded fontSize='small' />}
          size='small'
          sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            '&:hover': { color: 'error.main' },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
