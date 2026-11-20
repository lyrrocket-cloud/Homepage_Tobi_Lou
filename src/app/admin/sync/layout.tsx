import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = 'https://tobilou.top';

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/admin/sync`,
  },
  openGraph: {
    url: `${SITE_URL}/admin/sync`,
  },
};

export default function AdminSyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
