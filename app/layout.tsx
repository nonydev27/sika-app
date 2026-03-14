import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sika App — Track Your Money, Achieve Your Goals",
  description: "The budget planning app built for Ghanaian university students. Track expenses, plan budgets, and get AI-powered financial advice.",
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
