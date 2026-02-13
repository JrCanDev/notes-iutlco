import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Mes Notes",
    description: "Dashboard pour les notes ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#3b82f6" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Mes Notes" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
