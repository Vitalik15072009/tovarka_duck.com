import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsScripts } from "@/components/layout/AnalyticsScripts";
import { organizationJsonLd } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tovarkaduck.com"),
  title: {
    default: "TovarkaDuck",
    template: "%s | TovarkaDuck",
  },
  description: "TovarkaDuck - сучасний бренд одягу.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = organizationJsonLd("TovarkaDuck");

  return (
    <html lang="uk">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <AnalyticsScripts />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
