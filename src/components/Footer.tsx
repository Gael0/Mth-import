import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center gap-6 text-center">
        <Image src="/mth_v1.png" alt="MTH" height={48} width={180} className="h-12 w-auto opacity-90" />
        <p className="text-secondary text-sm max-w-md">
          MTH — Marchandise Tracking Hub. Importez vers la RDC en toute confiance.
        </p>
        <p className="text-navy font-semibold tracking-wide">Importez. Suivez. Recevez.</p>
        <div className="flex gap-6 text-xs text-secondary">
          <Link href="/simulateur" className="hover:text-orange">Simulateur</Link>
          <Link href="/debuter" className="hover:text-orange">Débuter</Link>
          <Link href="/verifier-fournisseur" className="hover:text-orange">Vérifier un fournisseur</Link>
          <Link href="/admin" className="hover:text-orange">Admin</Link>
        </div>
        <p className="text-xs text-secondary">© 2026 MTH — Kinshasa, RDC</p>
      </div>
    </footer>
  );
}
