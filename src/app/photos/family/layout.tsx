import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = 'https://tobilou.top';

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/photos/family`,
  },
  openGraph: {
    url: `${SITE_URL}/photos/family`,
  },
};

export default function PhotosFamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
