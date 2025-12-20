'use client';

import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { useTheme, useMediaQuery, Box } from '@mui/material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const bottomNavRef = React.useRef<HTMLDivElement>(null);
  const [bottomNavHeight, setBottomNavHeight] = React.useState(0);

  React.useEffect(() => {
    if (bottomNavRef.current) {
      setBottomNavHeight(bottomNavRef.current.offsetHeight);
    }
  }, [isMobile]);

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
      <main
        style={{
          overflowY: 'auto',
          paddingBottom: isMobile ? bottomNavHeight : 0,
        }}
      >
        {children}
      </main>
      {isMobile && (
        <Box
          ref={bottomNavRef}
          sx={{ position: 'fixed', bottom: 0, width: '100%' }}
        >
          <BottomNav />
        </Box>
      )}
    </div>
  );
}
