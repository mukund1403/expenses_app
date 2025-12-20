'use client';

import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { useTheme, useMediaQuery } from '@mui/material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {!isMobile && <Sidebar />}
      <div style={{ flexGrow: 1 }}>{children}</div>
      {isMobile && <BottomNav />}
    </div>
  );
}
