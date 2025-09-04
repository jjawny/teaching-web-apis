import "./globals.css";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import {
  Cardo,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Sedgwick_Ave_Display,
  Syne,
} from "next/font/google";
import Debug from "~/client/components/Debug";
import GlobalLayout from "~/client/components/GlobalLayout";
import SvgFilters from "~/client/components/SvgFilters";
import { ReactQueryProvider } from "~/client/modules/react-query-provider";
import { UserCtxProvider } from "~/client/modules/user-context";

const cardo = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const sedgwick = Sedgwick_Ave_Display({
  variable: "--font-sedgwick",
  subsets: ["latin"],
  weight: ["400"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jam Packed Web App",
  description: "This is jam packed web app",
};

const REFRESH_AUTH_INTERVAL = 60 * 30; // 30 minutes

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cardo.variable} ${sedgwick.variable} ${syne.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Debug />
        <SvgFilters />
        <ReactQueryProvider>
          <SessionProvider refetchInterval={REFRESH_AUTH_INTERVAL}>
            <UserCtxProvider>
              <GlobalLayout>{children}</GlobalLayout>
            </UserCtxProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
