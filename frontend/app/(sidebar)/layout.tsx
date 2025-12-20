'use client';

import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { useTheme, useMediaQuery, Box } from '@mui/material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div
      style={{
        display: 'grid',
        minHeight: '100vh',
        gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <Sidebar />
        </Box>
      )}
      <main style={{ overflowY: 'auto' }}>{children}</main>
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 0, width: '100%' }}>
          <BottomNav />
        </Box>
      )}
    </div>
  );
}
