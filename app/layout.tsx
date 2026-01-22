import React from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, Geist_Mono, Press_Start_2P } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _geistMono = Geist_Mono({ subsets: ['latin'] });
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

export const metadata: Metadata = {
  title: 'Sabbz - Roblox Scripter Portfolio',
  description:
    'Roblox scripter specializing in frotnend development, I turn game design documents into polished, launch-ready Roblox games.',
  generator: 'Sabbaz',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${pressStart2P.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
