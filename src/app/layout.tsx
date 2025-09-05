import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import PageLayout from "./page-layout";
import AppProtector from "./app-protector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartScrape Travell Planner",
  description: "The app is powered by Bright Data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppProtector />
          <PageLayout>{children}</PageLayout>

        </Providers>
      </body>
    </html>
  );
}


