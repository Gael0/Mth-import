"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, MessagesSquare, Percent, ArrowLeftRight, Users,
  Search, Upload, X,
} from "lucide-react";
import { SEED_IMPORTS, SEED_TICKETS, RATES, SEED_PAYMENTS } from "@/lib/seed";
import { STATUS_ORDER, STATUS_LABELS, ImportStatus } from "@/lib/types";
import { DEFAULT_TARIFS } from "@/lib/tax";
import { useCurrency } from "@/lib/currency";

type View = "overview" | "imports" | "tickets" | "tarifs" | "taux" | "clients";

const MENU: [View, string, typeof LayoutDashboard][] = [
  ["overview", "Overview", LayoutDashboard],
  ["imports", "Imports", Package],
  ["tickets", "Tickets Humains", MessagesSquare],
  ["tarifs", "Tarifs RDC", Percent],
  ["taux", "Taux de change", ArrowLeftRight],
  ["clients", "Clients", Users],
];

export default function Admin() {
  const [view, setView] = useState<View>("overview");
  const [imports, setImports] = useState(SEED_IMPORTS);
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ id: string; status: ImportStatus } | null>(null);
  const [rates, setRates] = useState(RATES);
  const { format } = useCurrency();

  const humanTickets = tickets.filter((t) => t.status === "escalade_humaine");
  const filtered = imports.filter((i) =>
    i.tracking_number.toLowerCase().includes(query.toLowerCase()) ||
    i.client_whatsapp.includes(query)
  );

  const applyStatus = () => {
    if (!modal) return;
    // En production: supabase.from("imports").update(...) + upload Storage + insert import_events
    setImports((list) =>
      list.map((i) =>
        i.id === modal.id
          ? { ...i, status: modal.status, progress: Math.max(i.progress, Math.round(((STATUS_ORDER.indexOf(modal.status) + 1) / 11) * 100)), current_location: STATUS_LABELS[modal.status] }
          : i
      )
    );
    setModal(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar style Linear */}
      <aside className="w-56 shrink-0 border-r border-border bg-white p-4 hidden md:block">
        <div className="flex items-center gap-2 px-2 mb-6">
          <Image src="/mth_M_hero_1.png" alt="MTH" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-navy text-sm">MTH Admin</span>
        </div>
        <nav className="space-y-1">
          {MENU.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                view === key ? "bg-navy text-white" : "text-secondary hover:bg-navy/5 hover:text-navy"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {key === "tickets" && humanTickets.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{humanTickets.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* OVERVIEW */}
            {view === "overview" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-8">Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Importations actives", value: "248", icon: "/mth_M_hero_1.png" },
                    { label: "En transit", value: String(imports.filter((i) => i.status === "en_transit").length + 96), icon: "/mth_M_hero_1.png" },
                    { label: "Tickets humains", value: String(humanTickets.length), alert: humanTickets.length > 0, icon: "/mth_M_hero_1.png" },
                    { label: "CA estimé du mois", value: format(182400), icon: "/mth_M_hero_1.png" },
                  ].map((s) => (
                    <div key={s.label} className={`card-glass p-5 ${s.alert ? "border-red-300" : ""}`}>
                      <Image src={s.icon} alt="" width={32} height={32} className="rounded-lg mb-3 opacity-80" />
                      <p className={`text-2xl font-bold ${s.alert ? "text-red-500" : "text-navy"}`}>{s.value}</p>
                      <p className="text-xs text-secondary mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IMPORTS */}
            {view === "imports" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">Imports</h1>
                <div className="card-glass p-3 flex items-center gap-2 mb-5">
                  <Search className="w-4 h-4 text-secondary ml-2" />
                  <input
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un tracking ou WhatsApp..."
                    className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-secondary"
                  />
                </div>
                <div className="card-glass overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-left text-xs text-secondary border-b border-border">
                        <th className="p-4 font-medium">Tracking</th>
                        <th className="font-medium">Client</th>
                        <th className="font-medium">Route</th>
                        <th className="font-medium">Incoterm</th>
                        <th className="font-medium">Status</th>
                        <th className="font-medium">Progress</th>
                        <th className="font-medium">ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((i) => (
                        <tr key={i.id} className="border-b border-border last:border-0 hover:bg-navy/[0.02]">
                          <td className="p-4">
                            <a href={`/tracking/${i.tracking_number}`} className="font-semibold text-orange hover:underline">{i.tracking_number}</a>
                          </td>
                          <td>
                            <a href={`https://wa.me/${i.client_whatsapp.replace(/\D/g, "")}`} className="text-navy hover:underline">{i.client_whatsapp}</a>
                            <p className="text-xs text-secondary">{i.client_nom}</p>
                          </td>
                          <td className="text-secondary">{i.origin_city} → {i.destination_port}</td>
                          <td><span className="text-xs font-semibold bg-navy/5 rounded-full px-2.5 py-1">{i.incoterm}</span></td>
                          <td>
                            <select
                              value={i.status}
                              onChange={(e) => setModal({ id: i.id, status: e.target.value as ImportStatus })}
                              className="text-xs font-medium border border-border rounded-full px-2.5 py-1.5 bg-white text-navy outline-none cursor-pointer"
                            >
                              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-orange rounded-full" style={{ width: `${i.progress}%` }} />
                              </div>
                              <span className="text-xs text-secondary">{i.progress}%</span>
                            </div>
                          </td>
                          <td className="text-secondary text-xs">{new Date(i.eta).toLocaleDateString("fr-FR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TICKETS */}
            {view === "tickets" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">Tickets humains</h1>
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div key={t.id} className="card-glass p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-navy">{t.sujet}</p>
                          <p className="text-xs text-secondary">{t.client_whatsapp}</p>
                        </div>
                        <span className={`text-xs font-semibold rounded-full px-3 py-1 ${t.status === "resolu" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {t.status === "resolu" ? "Résolu" : "À traiter"}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {t.messages.map((m, idx) => (
                          <p key={idx} className={`text-sm ${m.from === "client" ? "text-navy" : "text-secondary"}`}>
                            <span className="font-medium">{m.from === "client" ? "Client" : m.from === "ia" ? "IA" : "Admin"} :</span> {m.text}
                          </p>
                        ))}
                      </div>
                      {t.status !== "resolu" && (
                        <button
                          onClick={() => setTickets((ts) => ts.map((x) => x.id === t.id ? { ...x, status: "resolu" } : x))}
                          className="text-xs font-semibold bg-navy text-white rounded-full px-4 py-2 hover:bg-navy/90"
                        >
                          Marquer résolu + réponse WhatsApp envoyée
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TARIFS */}
            {view === "tarifs" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">Tarifs RDC (DGDA)</h1>
                <div className="card-glass overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-xs text-secondary border-b border-border">
                        <th className="p-4 font-medium">Catégorie</th>
                        <th className="font-medium">DD %</th>
                        <th className="font-medium">Accise %</th>
                        <th className="font-medium">TVA %</th>
                        <th className="font-medium">Frais fixes Matadi ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEFAULT_TARIFS.map((t) => (
                        <tr key={t.categorie} className="border-b border-border last:border-0">
                          <td className="p-4 font-medium text-navy">{t.categorie}</td>
                          <td><input defaultValue={t.dd_pourcent} className="w-16 border border-border rounded-lg px-2 py-1 outline-none" /></td>
                          <td><input defaultValue={t.accise_pourcent} className="w-16 border border-border rounded-lg px-2 py-1 outline-none" /></td>
                          <td><input defaultValue={t.tva_pourcent} className="w-16 border border-border rounded-lg px-2 py-1 outline-none" /></td>
                          <td><input defaultValue={t.frais_fixes_matadi_usd} className="w-24 border border-border rounded-lg px-2 py-1 outline-none" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="mt-5 bg-navy text-white font-semibold rounded-full px-6 py-3 text-sm hover:bg-navy/90">
                  Enregistrer les tarifs
                </button>
              </div>
            )}

            {/* TAUX */}
            {view === "taux" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">Taux de change</h1>
                <div className="card-glass p-8 max-w-md space-y-5">
                  {([["bcc", "BCC (officiel)"], ["parallele", "Marché parallèle"]] as const).map(([key, label]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-navy">{label}</label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-secondary text-sm">1 USD =</span>
                        <input
                          type="number" value={rates[key]}
                          onChange={(e) => setRates({ ...rates, [key]: Number(e.target.value) })}
                          className="flex-1 border border-border rounded-xl px-4 py-3 outline-none text-navy font-semibold"
                        />
                        <span className="text-secondary text-sm">FC</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full bg-orange text-white font-semibold rounded-full py-3.5 hover:bg-orange/90">
                    Mettre à jour
                  </button>
                  <p className="text-xs text-secondary">Le site entier se met à jour en direct (Realtime Supabase).</p>
                </div>
              </div>
            )}

            {/* CLIENTS */}
            {view === "clients" && (
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight mb-6">Clients</h1>
                <div className="card-glass overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="text-left text-xs text-secondary border-b border-border">
                        <th className="p-4 font-medium">Nom</th>
                        <th className="font-medium">WhatsApp</th>
                        <th className="font-medium">Ville</th>
                        <th className="font-medium">Débutant</th>
                        <th className="font-medium">Imports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {imports.map((i) => (
                        <tr key={i.id} className="border-b border-border last:border-0">
                          <td className="p-4 font-medium text-navy">{i.client_nom}</td>
                          <td className="text-secondary">{i.client_whatsapp}</td>
                          <td className="text-secondary">Kinshasa</td>
                          <td><span className="text-xs bg-navy/5 rounded-full px-2.5 py-1 text-secondary">{Number(i.id.slice(1)) % 2 === 0 ? "Oui" : "Non"}</span></td>
                          <td className="text-secondary">{1 + (Number(i.id.slice(1)) % 3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal changement de status : note + preuve photo/vidéo */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="card-glass p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-navy text-lg">Changer le statut</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-secondary" /></button>
              </div>
              <p className="text-sm text-secondary mb-4">
                Nouveau statut : <span className="font-semibold text-orange">{STATUS_LABELS[modal.status]}</span>
              </p>
              <textarea
                placeholder="Note visible par le client (ex: conteneur scellé, photos jointes)..."
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-3 outline-none text-sm text-navy mb-4 resize-none"
              />
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 text-sm text-secondary cursor-pointer hover:border-orange hover:text-orange transition-colors mb-5">
                <Upload className="w-5 h-5" /> Ajouter une preuve photo / vidéo
                <input type="file" accept="image/*,video/*" className="hidden"
                  onChange={(e) => alert(`Fichier sélectionné : ${e.target.files?.[0]?.name}\nEn production : upload vers bucket Supabase Storage "preuves" + insert import_events.`)}
                />
              </label>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 border border-border rounded-full py-3 text-sm font-medium text-secondary">Annuler</button>
                <button onClick={applyStatus} className="flex-1 bg-navy text-white rounded-full py-3 text-sm font-semibold hover:bg-navy/90">
                  Confirmer + notifier WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
