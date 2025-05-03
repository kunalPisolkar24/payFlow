import "@workspace/ui/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Provider } from "@/lib/provider";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "@/components/providers";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
