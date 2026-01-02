import type { Metadata } from 'next';
import React from 'react';

export function generateMetadata(): Metadata {
  return { title: 'Home' };
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
