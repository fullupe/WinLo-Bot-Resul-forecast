import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/InstallPrompt";

export const viewport: Viewport = {
  themeColor: "#075E54",
};

export const metadata: Metadata = {
  title: "WinLo Forecast - Check Results & Forecasts",
  description: "Mobile-first Nigerian lotto results checker and forecast assistant",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WinLo Forecast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js").catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
        <InstallPrompt />
      </body>
    </html>
  );
}
