import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartDrawer } from "@/components/cart";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "T12-EcommerceAI",
  description: "Shop the latest products at T12-EcommerceAI. Quality products, fast shipping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
