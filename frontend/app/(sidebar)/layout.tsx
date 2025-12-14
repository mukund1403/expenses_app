import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div>{children}</div>
    </>
  );
}
