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
  title: 'Sabbz - Roblox Scripter Portfolio | Devx #Roblox #robloxDev #robloxDevx',
  description:
    'Professional Roblox scripter specializing in frontend development. Creator of Kraken Game, One of Us, and Stop The Timer. Expert in Adopt Me, Brookhaven, Blox Fruits, Pet Simulator X, and Tower of Hell style games. #Roblox #robloxDev #robloxDevx Devx',
  keywords: [
    'Roblox',
    'Roblox Developer',
    'Roblox Scripter',
    'Devx',
    'robloxDev',
    'robloxDevx',
    'Roblox Game Development',
    'Luau Programming',
    'Roblox Studio',
    'Adopt Me',
    'Brookhaven',
    'Blox Fruits',
    'Pet Simulator X',
    'Tower of Hell',
    'Jailbreak',
    'Arsenal',
    'Murder Mystery 2',
    'Piggy',
    'Royal High',
    'MeepCity',
    'Obby Games',
    'Simulator Games',
    'Roleplay Games',
    'Kraken Game',
    'One of Us',
    'Stop The Timer',
    'Roblox Frontend',
    'Roblox UI/UX',
    'Roblox Game Scripter',
    'Roblox Portfolio',
  ],
  authors: [{ name: 'Sabbz' }],
  creator: 'Sabbz',
  publisher: 'Sabbz',
  generator: 'Sabbaz',
  applicationName: 'Sabbz Portfolio',
  referrer: 'origin-when-cross-origin',
  category: 'Gaming',
  classification: 'Roblox Game Development Portfolio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sabbz.xyz',
    siteName: 'Sabbz - Roblox Scripter Portfolio',
    title: 'Sabbz - Professional Roblox Developer & Scripter | Devx',
    description:
      'Expert Roblox scripter with 55M+ game visits. Specializing in frontend development for games like Adopt Me, Blox Fruits, Brookhaven. #Roblox #robloxDev #robloxDevx',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sabbz - Roblox Scripter Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@afsdev9',
    creator: '@afsdev9',
    title: 'Sabbz - Roblox Scripter | Devx #Roblox #robloxDev',
    description:
      'Professional Roblox developer with 55M+ visits. Expert in Adopt Me, Blox Fruits, Brookhaven style games. #Roblox #robloxDev #robloxDevx',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  other: {
    'google-site-verification': 'your-verification-code-here',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sabbz',
    jobTitle: 'Roblox Developer & Scripter',
    description:
      'Professional Roblox scripter specializing in frontend development with expertise in popular games like Adopt Me, Blox Fruits, Brookhaven, and Pet Simulator X',
    url: 'https://sabbz.xyz',
    sameAs: [
      'https://x.com/afsdev9',
      'https://discord.gg/DRevBgGG',
    ],
    knowsAbout: [
      'Roblox Development',
      'Luau Programming',
      'Roblox Studio',
      'Game Scripting',
      'Frontend Development',
      'Adopt Me',
      'Blox Fruits',
      'Brookhaven',
      'Pet Simulator X',
      'Tower of Hell',
      'Devx',
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Roblox Game Developer',
      description: '6+ years experience, 55M+ game visits, 7+ published games',
    },
    workExample: [
      {
        '@type': 'VideoGame',
        name: 'Kraken Game',
        gamePlatform: 'Roblox',
        description: 'Popular Roblox game with 22,000 peak CCU and 13M+ visits',
        url: 'https://www.roblox.com/games/106159203290418/Kraken-Game',
      },
      {
        '@type': 'VideoGame',
        name: 'One of Us',
        gamePlatform: 'Roblox',
        description: 'Roblox game with 10,000 peak CCU and 40M+ visits',
        url: 'https://www.roblox.com/games/79436299646095/One-of-Us',
      },
      {
        '@type': 'VideoGame',
        name: 'Stop The Timer',
        gamePlatform: 'Roblox',
        description: 'Roblox game with 2,000 peak CCU and 3.8M+ visits',
        url: 'https://www.roblox.com/games/70871855898838/Stop-The-Timer',
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href="https://sabbz.xyz" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans antialiased ${pressStart2P.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
