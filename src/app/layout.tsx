import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CursedGrid",
  description: "A high-performance, AG Grid-compatible data grid component library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
