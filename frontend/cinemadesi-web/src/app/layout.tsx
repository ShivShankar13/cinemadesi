import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CinemaDesi — Indian cinema, logged.",
    template: "%s — CinemaDesi",
  },
  description:
    "Log films, rate and review, build watch groups with friends, and discover regional Indian cinema and OTT picks.",
  applicationName: "CinemaDesi",
  themeColor: "#080808",
  keywords: [
    "indian cinema",
    "bollywood",
    "tamil cinema",
    "telugu cinema",
    "malayalam cinema",
    "film diary",
    "letterboxd alternative",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-brand-bg font-sans text-brand-text antialiased">
        <Providers>
          <Navbar />
          {/* Top padding offsets the fixed navbar height (h-16). */}
          <main className="pt-16 pb-24 md:pb-12">{children}</main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
