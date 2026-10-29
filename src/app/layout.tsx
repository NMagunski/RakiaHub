import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeSync from "@/components/theme/ThemeSync";

const editorial = localFont({ src: "./fonts/PlayfairDisplay.ttf", variable: "--font-editorial", display: "swap", weight: "400 900" });
const bodyFont = localFont({ src: "./fonts/Manrope.ttf", variable: "--font-body", display: "swap", weight: "200 800" });

export const metadata: Metadata = {
  title: "RAKIQ",
  description: "Rate and document rakija with friends",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RAKIQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B4423",
  width: "device-width",
  initialScale: 1,

};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();
  const { data: { user } } = await client.auth.getUser();
  const { data: preference } = user ? await client.from("profiles").select("theme").eq("id", user.id).single() : { data: null };
  const initialTheme = preference?.theme === "atlas" ? "atlas" : preference?.theme === "amber" ? "amber" : null;
  return (
    <html lang="bg" data-theme={initialTheme || "amber"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const theme=${JSON.stringify(initialTheme)}||(localStorage.getItem("rakiq-theme")==="atlas"?"atlas":"amber");document.documentElement.dataset.theme=theme;localStorage.setItem("rakiq-theme",theme)}catch{}` }} />

        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${editorial.variable} ${bodyFont.variable} antialiased`}>
        <ThemeSync />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: process.env.NODE_ENV === "production" ? `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            ` : `
              (async () => {
                if (!('serviceWorker' in navigator)) return;
                const ownScript = new URL('/sw.js', location.href).href;
                const controlled = navigator.serviceWorker.controller?.scriptURL === ownScript;
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.filter(r =>
                  [r.active, r.waiting, r.installing].some(w => w?.scriptURL === ownScript)
                ).map(r => r.unregister()));
                if ('caches' in window) {
                  const keys = await caches.keys();
                  await Promise.all(keys.filter(k => k.startsWith('rakiq-')).map(k => caches.delete(k)));
                }
                if (controlled) location.reload();
              })().catch(() => {});
            `,
          }}
        />
      </body>
    </html>
  );
}
