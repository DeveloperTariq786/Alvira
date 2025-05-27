import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ui/ScrollToTop";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.alvira.in'),
  title: "ALVIRA - A House of Hand Embroidery | Premium Kashmiri Aari Craftsmanship",
  description: "Discover ALVIRA's premium handcrafted collection featuring traditional Kashmiri Aari (Kashida) embroidery. Timeless elegance meets modern fashion through skilled artisanal craftsmanship.",
  keywords: "Kashmiri embroidery, Aari work, Kashida embroidery, luxury fashion, handcrafted clothing, traditional embroidery, Indian craftsmanship, premium fashion",
  manifest: "/manifest.json",
  openGraph: {
    title: "ALVIRA - A House of Hand Embroidery",
    description: "Premium handcrafted label featuring traditional Kashmiri Aari embroidery",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "ALVIRA Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALVIRA - A House of Hand Embroidery",
    description: "Premium handcrafted label featuring traditional Kashmiri Aari embroidery",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/icon-192x192.png',
    other: [
      { rel: 'mask-icon', url: '/icon-512x512.png', color: '#1a1a24' }
    ]
  },
  robots: "index, follow",
  verification: {
    google: "your-google-verification-code", // Add your Google verification code
  },
  alternates: {
    canonical: "https://alvira.in" // Replace with your actual domain
  }
};

export const viewport = {
  themeColor: "#1a1a24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <QueryProvider>
          <ScrollToTop />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
