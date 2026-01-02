import type { Metadata } from 'next';
import React from 'react';

export function generateMetadata(): Metadata {
  return { title: 'Analytics' };
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
