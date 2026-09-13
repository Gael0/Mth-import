import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MTH — Marchandise Tracking Hub | Importez vers la RDC en toute confiance",
  description: "Simulateur de taxes douanières, suivi en temps réel, conseiller humain. Importez. Suivez. Recevez.",
  icons: { icon: "/mth_M_hero_1.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CurrencyProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
