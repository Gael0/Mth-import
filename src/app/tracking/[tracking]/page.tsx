"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, MapPin, FileText, CreditCard, MessageSquare,
  Download, ArrowLeft, Ship,
} from "lucide-react";
import { STATUS_ORDER, STATUS_LABELS, ImportItem } from "@/lib/types";
import { SEED_IMPORTS, SEED_PAYMENTS } from "@/lib/seed";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency";
import ProgressRing from "@/components/ProgressRing";

type Tab = "timeline" | "documents" | "paiements" | "discussion";

export default function TrackingPage({ params }: { params: Promise<{ tracking: string }> }) {
  const { tracking } = use(params);
  const { format } = useCurrency();
  const [item, setItem] = useState<ImportItem | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("timeline");

  useEffect(() => {
    const t = decodeURIComponent(tracking).toUpperCase();
    const validFormat = /^IMP-\d{4}-\d{6}$/.test(t);
    if (!validFormat) { setItem(null); return; }

    async function load() {
      if (isSupabaseConfigured) {
        // Production: fetch Supabase (RLS: accès via tracking_number public sécurisé par vue)
        const { data } = await supabase
          .from("imports")
          .select("*, import_events(*)")
          .eq("tracking_number", t)
          .single();
        if (data) {
          setItem({
            ...data,
            client_whatsapp: data.clients?.whatsapp ?? "",
            client_nom: data.clients?.nom ?? "",
            events: data.import_events ?? [],
          } as ImportItem);
          return;
        }
      }
      // Mode démo
      setItem(SEED_IMPORTS.find((i) => i.tracking_number === t) ?? null);
    }
    load();
  }, [tracking]);

  if (item === undefined) {
    return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-secondary">Chargement...</div>;
  }

  // Introuvable
  if (item === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Image src="/mth_M_hero_1.png" alt="MTH" width={110} height={110} className="mx-auto rounded-3xl opacity-30 grayscale mb-6" />
        <h1 className="text-2xl font-bold text-navy tracking-tight">Aucune importation trouvée</h1>
        <p className="text-secondary mt-2 text-sm">
          Vérifiez le numéro (format IMP-2026-XXXXXX) ou contactez votre conseiller MTH.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 mt-6 text-orange font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const activeIdx = STATUS_ORDER.indexOf(item.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="card-glass p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
        <ProgressRing progress={item.progress} />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-2xl font-bold text-navy tracking-tight">{item.tracking_number}</h1>
            <span className="text-xs font-semibold bg-orange/10 text-orange border border-orange/30 rounded-full px-3 py-1">
              {STATUS_LABELS[item.status]}
            </span>
          </div>
          <p className="text-secondary">{item.produit} — {item.origin_city}, {item.origin_country} → {item.destination_port}</p>
          <p className="text-secondary text-sm mt-1">Incoterm {item.incoterm} · ETA {new Date(item.eta).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="text-sm text-navy font-medium mt-3 flex items-center justify-center md:justify-start gap-1.5">
            <MapPin className="w-4 h-4 text-orange" /> {item.current_location}
          </p>
        </div>
      </div>

      {/* Map route */}
      {item.status === "en_transit" && (
        <div className="relative bg-navy rounded-3xl p-6 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "linear-gradient(#3b5b8c 1px, transparent 1px), linear-gradient(90deg, #3b5b8c 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative flex flex-col gap-4">
            <div className="flex justify-between text-white/80 text-xs font-medium">
              <span>{item.origin_city}</span><span>{item.destination_port}</span>
            </div>
            <div className="route-dash relative">
              <Ship className="absolute -top-2.5 text-orange" style={{ left: `${item.progress}%` }} />
              <MapPin className="absolute -top-3 -right-2 w-6 h-6 text-orange fill-orange" />
            </div>
            <p className="text-white/80 text-xs">
              🚢 Votre conteneur est actuellement en mer — Départ {new Date(item.events[item.events.length - 1]?.created_at ?? item.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })},
              {" "}Arrivée estimée {new Date(item.eta).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}, Progression {item.progress}%
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(
          [
            ["timeline", "Timeline", CheckCircle2],
            ["documents", "Documents", FileText],
            ["paiements", "Paiements", CreditCard],
            ["discussion", "Discussion", MessageSquare],
          ] as [Tab, string, typeof CheckCircle2][]
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key ? "bg-navy text-white" : "bg-white border border-border text-secondary hover:text-navy"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Contenu tabs */}
      {tab === "timeline" && (
        <div className="card-glass p-8">
          <ol className="relative border-l-2 border-border ml-3 space-y-8">
            {STATUS_ORDER.map((st, idx) => {
              const done = idx < activeIdx;
              const active = idx === activeIdx;
              const event = item.events.filter((e) => e.status === st);
              return (
                <li key={st} className="ml-6">
                  <span className={`absolute -left-[15px] w-7 h-7 rounded-full flex items-center justify-center bg-white border-2 ${done || active ? "border-orange" : "border-border"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4 text-orange" /> : <Circle className={`w-3 h-3 ${active ? "text-orange" : "text-border"}`} />}
                  </span>
                  <p className={`font-semibold ${active ? "text-orange text-lg" : done ? "text-navy" : "text-secondary"}`}>
                    {STATUS_LABELS[st]}
                  </p>
                  {active && <p className="text-sm text-secondary">Étape actuelle — {item.current_location}</p>}
                  {event.map((e) => (
                    <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 bg-white border border-border rounded-2xl p-4 text-sm">
                      <p className="font-medium text-navy">{e.title}</p>
                      <p className="text-secondary mt-1">{e.description}</p>
                      <p className="text-xs text-secondary mt-2">{new Date(e.created_at).toLocaleString("fr-FR")}</p>
                      {e.photo_url && (
                        <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden bg-navy/5">
                          {/* En production: <Image src={e.photo_url} fill alt="Preuve" /> — placeholder ci-dessous */}
                          <div className="absolute inset-0 flex items-center justify-center text-secondary text-xs">📷 Preuve photo : {e.photo_url}</div>
                        </div>
                      )}
                      {e.video_url && (
                        <p className="mt-3 text-xs text-orange font-medium">▶ Vidéo de preuve : {e.video_url}</p>
                      )}
                    </motion.div>
                  ))}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {tab === "documents" && (
        <div className="card-glass p-8">
          {["Facture commerciale", "Bordereau d'embarquement (B/L)", "Déclaration SYDONIA"].map((doc) => (
            <div key={doc} className="flex items-center justify-between border-b border-border py-4 last:border-0">
              <div>
                <p className="font-medium text-navy text-sm">{doc}</p>
                <p className="text-xs text-secondary">PDF · Déposé par MTH</p>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-orange font-semibold hover:underline">
                <Download className="w-4 h-4" /> Télécharger
              </button>
            </div>
          ))}
          <p className="text-xs text-secondary mt-4">
            Documents servis depuis Supabase Storage (bucket <code>documents</code>).
          </p>
        </div>
      )}

      {tab === "paiements" && (
        <div className="card-glass p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-secondary text-xs border-b border-border">
                <th className="py-3 font-medium">Libellé</th>
                <th className="font-medium">Montant</th>
                <th className="font-medium">Statut</th>
                <th className="font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {SEED_PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-4 text-navy font-medium">{p.label}</td>
                  <td className="text-navy">{format(p.montant_usd)}</td>
                  <td>
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                      p.statut === "paye" ? "bg-green-50 text-green-700" : p.statut === "en_attente" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"
                    }`}>
                      {p.statut === "paye" ? "Payé" : p.statut === "en_attente" ? "En attente" : "À payer"}
                    </span>
                  </td>
                  <td className="text-right">
                    {p.statut === "a_payer" && (
                      <button className="bg-orange text-white text-xs font-semibold rounded-full px-4 py-2 hover:bg-orange/90">
                        Payer ({p.methode.replace("_", " ")})
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-secondary mt-4">Paiement Mobile Money : M-Pesa, Orange Money, Airtel Money — confirmation WhatsApp immédiate.</p>
        </div>
      )}

      {tab === "discussion" && (
        <div className="card-glass p-8 text-center">
          <MessageSquare className="w-10 h-10 text-orange mx-auto mb-3" />
          <p className="font-semibold text-navy">Discutez avec votre conseiller MTH</p>
          <p className="text-sm text-secondary mt-1 mb-5">La discussion continue sur WhatsApp — réponse sous 2h.</p>
          <a
            href={`https://wa.me/${item.client_whatsapp.replace(/\D/g, "")}`}
            className="inline-block bg-navy text-white font-semibold rounded-full px-8 py-3.5 hover:bg-navy/90 transition-colors"
          >
            Ouvrir WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
