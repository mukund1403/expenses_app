import type { Metadata } from 'next';
import React from 'react';

export function generateMetadata(): Metadata {
  return { title: 'Settings' };
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
