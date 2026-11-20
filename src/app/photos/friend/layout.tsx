import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = 'https://tobilou.top';

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/photos/friend`,
  },
  openGraph: {
    url: `${SITE_URL}/photos/friend`,
  },
};

export default function PhotosFriendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
