import type { Metadata } from 'next';
import React from 'react';

export function generateMetadata(): Metadata {
  return { title: 'Transactions' };
}

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
