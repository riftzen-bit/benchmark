import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SITE } from "@/lib/config/site";

const sans = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-loaded",
});
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-loaded",
});

export const metadata: Metadata = {
  title: { default: `${SITE.name} — Issue ${SITE.issue}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SiteHeader />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
