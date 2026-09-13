"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Ship, ShieldCheck, MessageCircleUser, MapPin } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import ProgressRing from "@/components/ProgressRing";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Taxes Réelles DGDA / OGEFREM / FPI / OCC",
    text: "Calcul basé sur la grille officielle 2024-2025 et le taux BCC du jour. TVA 16%, frais Matadi, tout est détaillé ligne par ligne.",
  },
  {
    icon: Ship,
    title: "Suivi avec Preuves Photo / Vidéo",
    text: "Chaque étape est documentée : marchandise chez le fournisseur, conteneur scellé, arrivée port. Zéro zone d'ombre.",
  },
  {
    icon: MessageCircleUser,
    title: "Conseiller Humain + Anti-Arnaque",
    text: "Un expert vous répond sur WhatsApp sous 2h. Vérification fournisseur Alibaba/1688 avant chaque paiement.",
  },
];

export default function Landing() {
  const router = useRouter();
  const { format } = useCurrency();
  const [tracking, setTracking] = useState("");

  const goTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tracking.trim().toUpperCase();
    if (t) router.push(`/tracking/${encodeURIComponent(t)}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Image
            src="/mth_M_hero_1.png"
            alt="MTH — conteneurs et trajet"
            width={140}
            height={140}
            className="mx-auto rounded-3xl mb-8"
            priority
          />
          <h1 className="tracking-tight-hero text-4xl md:text-[64px] md:leading-[1.05] font-bold text-navy">
            Importez vers la RDC<br />en toute confiance.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-secondary max-w-2xl mx-auto">
            Simulateur de taxes douanières, suivi en temps réel, conseiller humain.
          </p>
          <p className="mt-2 text-navy font-medium">Importez. Suivez. Recevez.</p>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/simulateur"
              className="w-full md:w-auto bg-navy text-white font-semibold rounded-full px-8 py-4 hover:bg-navy/90 transition-colors"
            >
              Simuler mon importation
            </Link>
            <form onSubmit={goTrack} className="w-full md:w-auto flex items-center card-glass px-5 py-2">
              <Search className="text-secondary w-5 h-5 mr-2 shrink-0" />
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="IMP-2026-..."
                className="bg-transparent outline-none py-2 w-full md:w-44 text-navy font-medium placeholder:text-secondary"
              />
              <button type="submit" className="text-orange font-semibold text-sm ml-2 shrink-0">Suivre</button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* 3 CARDS */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="card-glass p-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center mb-5">
              <f.icon className="w-6 h-6 text-orange" />
            </div>
            <h3 className="font-semibold text-navy text-lg mb-2">{f.title}</h3>
            <p className="text-secondary text-sm leading-relaxed">{f.text}</p>
          </motion.div>
        ))}
      </section>

      {/* DEMO TRACKING */}
      <section className="max-w-6xl mx-auto px-4 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card-glass p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <p className="text-xs font-semibold text-orange tracking-widest uppercase mb-2">Démo temps réel</p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-4">
              IMP-2026-004582 — Toyota RAV4
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-secondary">Statut</span>
                <span className="font-semibold text-orange">En transit — 62%</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-secondary">Route</span>
                <span className="font-semibold text-navy">Yokohama → Matadi</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-secondary">ETA</span>
                <span className="font-semibold text-navy">14 octobre 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Total estimé</span>
                <span className="font-semibold text-navy">{format(12480)}</span>
              </div>
            </div>
            <Link href="/tracking/IMP-2026-004582" className="inline-block mt-6 text-orange font-semibold text-sm hover:underline">
              Voir le suivi complet →
            </Link>
          </div>

          {/* Map stylisée Yokohama -> Matadi */}
          <div className="relative bg-navy rounded-3xl p-6 h-64 md:h-72 overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "linear-gradient(#3b5b8c 1px, transparent 1px), linear-gradient(90deg, #3b5b8c 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-white/80 text-xs font-medium">🇯🇵 Yokohama</div>
                <div className="text-white/80 text-xs font-medium">🇨🇩 Matadi</div>
              </div>
              <div className="flex-1 flex items-center px-6">
                <div className="w-full route-dash relative">
                  <MapPin className="absolute -top-3 -right-2 w-6 h-6 text-orange fill-orange" />
                  <Ship className="absolute -top-2.5 text-orange" style={{ left: "62%" }} />
                </div>
              </div>
              <p className="text-white/70 text-xs">🚢 Votre conteneur est actuellement en mer — Progression 62%</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 mt-24 text-center">
        <h2 className="text-3xl font-bold text-navy tracking-tight">Prêt à importer ?</h2>
        <p className="text-secondary mt-3">La première simulation est gratuite et sans engagement.</p>
        <Link href="/simulateur" className="inline-block mt-6 bg-orange text-white font-semibold rounded-full px-8 py-4 hover:bg-orange/90 transition-colors">
          Lancer ma simulation
        </Link>
      </section>
    </div>
  );
}
