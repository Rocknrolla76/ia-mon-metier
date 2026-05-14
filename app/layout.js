import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata = {
  title: "L'IA & Moi — Votre métier face à l'intelligence artificielle",
  description:
    "Diagnostic gratuit en 30 secondes. Découvrez si l'IA menace votre métier et le plan d'action concret pour reprendre la main.",
  openGraph: {
    title: "L'IA va-t-elle remplacer votre métier ?",
    description: "Diagnostic gratuit en 30 secondes.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
