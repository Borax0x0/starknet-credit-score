import type { Metadata } from "next";
import "./globals.css";
import { NetworkProvider } from "@/components/NetworkProvider";

export const metadata: Metadata = {
  title: "Starknet Credit Score",
  description: "Discover your Starknet wallet reputation. AI-powered credit score and personality analysis.",
  openGraph: {
    title: "Starknet Credit Score",
    description: "Discover your Starknet wallet reputation. AI-powered credit score and personality analysis.",
    type: "website",
    url: "https://starknet-creditscore.vercel.app",
    siteName: "Starknet Credit Score",
    images: [
      {
        url: "https://starknet-creditscore.vercel.app/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Starknet Credit Score",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Starknet Credit Score",
    description: "Discover your Starknet wallet reputation. AI-powered credit score and personality analysis.",
    images: ["https://starknet-creditscore.vercel.app/og-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
