import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arete Analytics",
  description: "Internal analytics dashboard for Arete",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
