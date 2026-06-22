import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Gyaneshwar Cherupalli — Data Scientist",
  description:
    "Data Scientist with 5+ years of experience delivering ML solutions across telecom, payments, and mobility. Specializing in churn modeling, fraud detection, and experimentation.",
  openGraph: {
    title: "Gyaneshwar Cherupalli — Data Scientist",
    description:
      "Data Scientist with 5+ years of experience delivering ML solutions across telecom, payments, and mobility.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
