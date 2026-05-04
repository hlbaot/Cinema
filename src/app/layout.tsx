import type { Metadata } from "next";
import IntroScreen from "@/public/intro-screen";
import ClickSpark from "@/public/uiux/ClickSpark";
import "../scss/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen w-full" suppressHydrationWarning>
        <ClickSpark sparkColor="#ffffff" sparkSize={18} sparkRadius={26} sparkCount={10} duration={450} extraScale={1.2}>
          <IntroScreen>{children}</IntroScreen>
        </ClickSpark>
      </body>
    </html>
  );
}
