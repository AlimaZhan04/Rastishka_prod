import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";

const heading = Nunito({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ras-tishka.kg"),
  title: {
    default: "РАСтишка — детский сад для особенных детей",
    template: "%s · РАСтишка",
  },
  description:
    "Частный коррекционный детский сад «РАСтишка»: психолого-педагогическое сопровождение детей с РАС, ЗПРР, СДВГ и другими особенностями развития.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "РАСтишка",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
