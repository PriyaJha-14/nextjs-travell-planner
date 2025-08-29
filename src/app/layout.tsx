import type { Metadata } from "next";
import {Inter} from "next/font/google"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
import PageLayout from "./page-layout";


const inter =Inter({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartScrape Travell Planner",
  description: "The app is powered by Bright Data",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PageLayout>{children}</PageLayout>
        </Providers>
      </body>
    </html>
  );
}
