import type { Metadata } from "next";
import "./globals.css";
import { NetworkProvider } from "@/components/NetworkProvider";

export const metadata: Metadata = {
  title: "Starknet Credit Score",
  description: "AI-generated credit score and personality profile based on your Starknet wallet activity",
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
