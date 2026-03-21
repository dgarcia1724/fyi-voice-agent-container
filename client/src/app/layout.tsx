import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FYI — The ultimate productivity tool for creatives",
  description: "FYI is the ultimate productivity tool for creatives. AI-powered creation, project management, and team collaboration in one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
