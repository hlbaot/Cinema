import type { Metadata } from "next";
import IntroScreen from "@/public/intro-screen";
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
      <body className="h-screen w-full" suppressHydrationWarning>
        <IntroScreen>{children}</IntroScreen>
      </body>
    </html>
  );
}
