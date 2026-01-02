import type { Metadata } from 'next';
import React from 'react';

export function generateMetadata(): Metadata {
  return { title: 'Budgets' };
}

export default function BudgetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
