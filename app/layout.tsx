import type { Metadata } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

/*
  Runware's own faces. Their heading font `coxx` is licensed, so Figtree — their sans —
  carries the headings at weight 500 with tight tracking instead of substituting some
  unrelated display face into their identity.
*/
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI API pricing — an unaffiliated redesign concept",
  description:
    "An unsolicited redesign concept for the AI API pricing section of runware.ai/pricing, " +
    "built from the 416 published rates on the live page. Not affiliated with Runware.",
  // Courtesy, not caution: this page carries Runware's product names and prices, and
  // should never compete with their own pricing page in search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${jetbrains.variable} antialiased`}>
        <a
          href="#rate-sheet"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to the rate sheet
        </a>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
