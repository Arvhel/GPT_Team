import type { Metadata } from "next";
import WorkspaceHeader from "@/app/components/workspace-header";
import "./globals.css";
import "./hrm.css";

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
      <body className="font-sans antialiased">
        <WorkspaceHeader />
        {children}
      </body>
    </html>
  );
}