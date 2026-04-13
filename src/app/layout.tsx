import type { Metadata } from "next";
import IntroScreen from "@/src/component/common/intro-screen";
import "../scss/globals.css";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <IntroScreen>{children}</IntroScreen>
      </body>
    </html>
  );
}
