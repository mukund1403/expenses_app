import * as React from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/layout/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Sidebar />
      <div style={{ flexGrow: 1 }}>{children}</div>
    </div>
  );
}
