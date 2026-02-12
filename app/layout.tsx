import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Mes Notes - IUT Calais",
    description: "Dashboard pour les notes de l'IUT Calais",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
