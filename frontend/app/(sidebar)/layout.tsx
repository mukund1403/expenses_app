'use client';

import * as React from 'react';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { useTheme, useMediaQuery, Box, Toolbar } from '@mui/material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isMobile && <TopNav />}
      <Box
        component='main'
        sx={{
          flex: 1,
          pb: isMobile ? '56px' : 0,
        }}
      >
        {!isMobile && <Toolbar />}
        {children}
      </Box>
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 100 }}>
          <BottomNav />
        </Box>
      )}
    </Box>
  );
}
