import type { Metadata, Viewport } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeSync from "@/components/theme/ThemeSync";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <ThemeSync />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
