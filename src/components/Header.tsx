"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCurrency } from "@/lib/currency";

const NAV = [
  { href: "/simulateur", label: "Simulateur" },
  { href: "/tracking/IMP-2026-004582", label: "Suivi" },
  { href: "/debuter", label: "Débuter" },
  { href: "/verifier-fournisseur", label: "Vérifier Fournisseur" },
];

export default function Header() {
  const { devise, setDevise } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo texte officiel */}
        <Link href="/" className="shrink-0">
          <Image src="/mth_v1.png" alt="MTH — Marchandise Tracking Hub" height={32} width={120} className="h-8 w-auto" priority />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-navy/80">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-orange transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Switcher devise discret */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="text-xs font-medium text-secondary border border-border rounded-full px-3 py-1.5 hover:border-navy/30 transition-colors"
            >
              {devise === "USD" ? "USD $" : "CDF FC"} ▾
            </button>
            {open && (
              <div className="absolute right-0 mt-2 card-glass p-1 w-28 text-sm">
                {(["USD", "CDF"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDevise(d); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl hover:bg-navy/5 ${devise === d ? "font-semibold text-orange" : ""}`}
                  >
                    {d === "USD" ? "USD $ — BCC" : "CDF FC — BCC"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin"
            className="text-sm font-semibold bg-navy text-white rounded-full px-4 py-2 hover:bg-navy/90 transition-colors"
          >
            Mon espace
          </Link>
        </div>
      </div>
    </header>
  );
}
