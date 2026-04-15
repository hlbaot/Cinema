import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
