import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work Scheduler - Automated Task Assignment",
  description: "Automatically schedule and send work assignments to associates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
