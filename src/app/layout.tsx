import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MenuWrapper from "@/components/MenuWrapper";

export const metadata: Metadata = {
  title: "App Atleta",
  description: "App para gerenciar agendamentos e partidas de tênis",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Atleta",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="App Atleta" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {/* Menu global - aparece em /dashboard, /perfil, etc. Mas não em /app/* que têm layouts próprios */}
          <MenuWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
