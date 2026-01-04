import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';
import theme from '../theme/theme';
import { NotificationProvider } from '@/providers/NotificationProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AutoEx',
    template: '%s | AutoEx',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <NotificationProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline>{children}</CssBaseline>
            </ThemeProvider>
          </NotificationProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
