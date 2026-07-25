import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMB Pulse - Financial Analytics",
  description: "AI-driven financial analytics and cashflow management for SMBs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
