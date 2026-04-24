import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import IntroScreen from "@/public/intro-screen";
import "../scss/globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cinepro",
  description: "Cinepro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-screen w-full font-sans" suppressHydrationWarning>
        <IntroScreen>{children}</IntroScreen>
      </body>
    </html>
  );
}
