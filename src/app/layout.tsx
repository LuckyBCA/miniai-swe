import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Vibe",
  description: "Build your next startup with nothing more than a sentence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
