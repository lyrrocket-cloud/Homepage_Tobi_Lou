import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tobi Lou | 无远弗届',
    template: '%s | Tobi Lou',
  },
  description:
    'Tobi Lou 的个人旅行主页，记录世界各地的精彩瞬间，分享旅行照片与视频。志之所趋，无远弗届。',
  keywords: [
    'Tobi Lou',
    '旅行',
    '摄影',
    '旅行照片',
    '旅行视频',
    '个人主页',
    '游记',
    '摄影作品',
    '世界探索',
    '无远弗届',
  ],
  authors: [{ name: 'Tobi Lou' }],
  openGraph: {
    title: 'Tobi Lou | 无远弗届',
    description:
      '志之所趋，无远弗届',
    siteName: 'Tobi Lou',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
