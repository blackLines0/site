import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import { CustomerAuthProvider } from "@/components/CustomerAuthContext";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blacklines",
  description: "Boutique Blacklines : Capsule Textile, Spicysoul, Rihan Wa Harir",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <CustomerAuthProvider>
            <CartProvider>{children}</CartProvider>
          </CustomerAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
