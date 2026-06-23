import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trust No Bot",
  description: "A single-player AI Mafia game where one character is hiding a secret role.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
