import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SonicProvider } from "../providers/sonic-provider";
import { Toaster } from "sonner";
import { GiSonicBoom } from "react-icons/gi";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sonic boom",
  description: "Multiplayer realtime gaming app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SonicProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </SonicProvider>
    </html>
  );
}
