import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hope, Inc. — A little more in sync",
  description:
    "A considered workspace for products, people, sales, and customer relationships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
