import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studi",
  description: "Plateforme de suivi insertion professionnelle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}