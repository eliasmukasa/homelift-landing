import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeLift Africa - Elevating Home Care with Trusted Professionals", 
  description: "Trusted, vetted & trained home-care professionals at your service.",
  themeColor: "#0a192f", 
  manifest: "/manifest.json",
  alternates: { canonical: 'https://homelift.africa/' },
  openGraph: {
    url: 'https://homelift.africa/',
    type: 'website',
    images: [
      {
        url: 'https://homelift.africa/og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'HomeLift brand hero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://homelift.africa/og-cover.jpg'],
  },
}; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a192f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="HomeLift" />
        <meta property="og:title"       content="HomeLift – Elevating Home Care" />
        <meta property="og:description" content="Vetted home-care professionals, perfectly matched to your family." />
        <meta property="og:url"         content="https://homelift.africa" />
        <meta property="og:image"       content="https://homelift.africa/og-cover.png" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card"  content="summary_large_image" />
        <meta name="twitter:title" content="HomeLift – Elevating Home Care" />
        <meta name="twitter:description" content="Vetted home-care professionals, perfectly matched to your family." />
        <meta name="twitter:image" content="https://homelift.africa/og-cover.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}