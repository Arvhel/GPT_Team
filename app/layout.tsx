import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOPE, Inc. | Account",
  description: "Sign in to your HOPE, Inc. account.",
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
