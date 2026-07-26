import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA FARMING | Wear The Mark",
  description: "Heavyweight streetwear forged in black and red. One line runs through everything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#09090a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@1&family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
