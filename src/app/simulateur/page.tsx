"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, HelpCircle, ArrowLeft, ArrowRight, Save, MessageCircle } from "lucide-react";
import { calculateTaxes, DISCLAIMER_TAXES, TaxLine } from "@/lib/tax";
import { useCurrency } from "@/lib/currency";

type Incoterm = "EXW" | "FOB" | "CIF";

const INCOTERMS: { key: Incoterm; title: string; sub: string; desc: string; reco?: boolean }[] = [
  { key: "EXW", title: "EXW", sub: "À l'usine en Chine", desc: "Vous gérez tout: transport intérieur + export + fret." },
  { key: "FOB", title: "FOB", sub: "Au port de Chine", desc: "Le fournisseur met la marchandise dans le navire. Vous gérez la mer.", reco: true },
  { key: "CIF", title: "CIF", sub: "Jusqu'à Matadi", desc: "Le fournisseur gère le fret. Vous gérez le dédouanement." },
];

interface QA { key: string; question: string; placeholder: string; estimate: () => string }
const QUESTIONS: QA[] = [
  { key: "produit", question: "1. Quoi importer ?", placeholder: "Ex: Toyota RAV4 2022 / 15 cartons électroniques", estimate: () => "Toyota RAV4 (catégorie véhicule_4x4)" },
  { key: "pays", question: "2. Depuis quel pays ?", placeholder: "Chine, Japon, Dubaï...", estimate: () => "Chine" },
  { key: "ville", question: "3. Ville destination en RDC ?", placeholder: "Kinshasa, Lubumbashi...", estimate: () => "Kinshasa" },
  { key: "quantite", question: "4. Quantité ?", placeholder: "Ex: 1 véhicule, 15 cartons", estimate: () => "1" },
  { key: "prix", question: "5. Prix d'achat (USD) ?", placeholder: "Ex: 8500", estimate: () => "8500" },
  { key: "poids", question: "6. Poids / volume ?", placeholder: "Ex: 1650 kg / 0.8 CBM", estimate: () => "1650 kg" },
  { key: "mode", question: "7. Aérien ou maritime ?", placeholder: "maritime (recommandé) ou aérien", estimate: () => "Maritime" },
  { key: "fournisseur", question: "8. Fournisseur déjà connu / vérifié ?", placeholder: "Oui / Non", estimate: () => "Non — à vérifier" },
  { key: "domicile", question: "9. Livraison à domicile à Kinshasa ?", placeholder: "Oui / Non (retrait agence)", estimate: () => "Oui" },
];

function detectCategorie(produit: string): string {
  const t = produit.toLowerCase();
  if (t.includes("rav4") || t.includes("4x4") || t.includes("cr-v") || t.includes("land cruiser")) return "vehicule_4x4";
  if (t.includes("véhicule") || t.includes("vehicule") || t.includes("toyota") || t.includes("honda")) return "vehicule_tourisme_-10ans";
  if (t.includes("vêtement") || t.includes("vetement") || t.includes("habit")) return "vetements";
  if (t.includes("pièce") || t.includes("piece") || t.includes("auto")) return "pieces_auto";
  return "electronique";
}

interface Offre { nom: string; delai: string; multiplicateur: number }
const OFFRES: Offre[] = [
  { nom: "Économique", delai: "55-65 jours", multiplicateur: 0.92 },
  { nom: "Standard", delai: "40-45 jours", multiplicateur: 1 },
  { nom: "Express", delai: "12-18 jours (aérien)", multiplicateur: 2.1 },
];

export default function Simulateur() {
  const { format, taux } = useCurrency();
  const [step, setStep] = useState(1);
  const [incoterm, setIncoterm] = useState<Incoterm>("FOB");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const answer = (v: string) => {
    const next = { ...answers, [QUESTIONS[qi].key]: v };
    setAnswers(next);
    if (qi < QUESTIONS.length - 1) setQi(qi + 1);
    else setStep(3);
  };

  const prixFob = parseFloat((answers.prix || "8500").replace(/[^0-9.]/g, "")) || 8500;
  const categorie = detectCategorie(answers.produit || "");
  const result = calculateTaxes({
    prix_fob: prixFob,
    prix_fret: prixFob * 0.18, // fret maritime estimé ~18% du FOB
    prix_assurance: prixFob * 0.015,
    incoterm, categorie,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {["Incoterm", "Questions", "Résultat"].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm font-medium ${step >= i + 1 ? "text-orange" : "text-secondary"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${step > i + 1 ? "bg-orange border-orange text-white" : step === i + 1 ? "border-orange" : "border-border"}`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < 2 && <div className={`w-10 h-px ${step > i + 1 ? "bg-orange" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ÉTAPE 1 — INCOTERM */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            <h1 className="text-3xl font-bold text-navy tracking-tight text-center mb-10">
              Votre accord avec le fournisseur ?
            </h1>
            <div className="grid md:grid-cols-3 gap-5">
              {INCOTERMS.map((inc) => (
                <button
                  key={inc.key}
                  onClick={() => { setIncoterm(inc.key); setStep(2); }}
                  className={`card-glass p-7 text-left transition-all hover:border-orange ${incoterm === inc.key ? "border-orange" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-navy">{inc.title}</span>
                    {inc.reco && <span className="text-xs font-semibold bg-orange/10 text-orange rounded-full px-3 py-1">Recommandé ✓</span>}
                  </div>
                  <p className="font-medium text-navy text-sm mb-1">{inc.sub}</p>
                  <p className="text-secondary text-sm leading-relaxed">{inc.desc}</p>
                </button>
              ))}
            </div>
            {incoterm === "EXW" && (
              <p className="text-center text-sm text-secondary mt-6">
                ℹ️ Avec EXW, nous ajoutons automatiquement au calcul : transport intérieur Chine (~$150-350) + frais export (~$80-150).
              </p>
            )}
          </motion.div>
        )}

        {/* ÉTAPE 2 — 9 QUESTIONS */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="max-w-xl mx-auto">
            <div className="card-glass p-8">
              <p className="text-xs font-semibold text-orange mb-2">{qi + 1} / {QUESTIONS.length}</p>
              <h2 className="text-2xl font-bold text-navy tracking-tight mb-6">{QUESTIONS[qi].question}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = new FormData(e.currentTarget).get("rep") as string;
                  if (v?.trim()) answer(v.trim());
                }}
              >
                <input
                  name="rep" autoFocus
                  placeholder={QUESTIONS[qi].placeholder}
                  className="w-full card-glass px-4 py-4 outline-none text-navy placeholder:text-secondary mb-4"
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-navy text-white font-semibold rounded-full py-3.5 hover:bg-navy/90 transition-colors">
                    Continuer <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => answer(QUESTIONS[qi].estimate())}
                    className="flex items-center gap-2 border border-border rounded-full px-4 py-3.5 text-sm text-secondary hover:border-orange hover:text-orange transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" /> Je ne sais pas, estime pour moi
                  </button>
                </div>
              </form>
            </div>
            {qi > 0 && (
              <button onClick={() => setQi(qi - 1)} className="mt-4 text-sm text-secondary hover:text-navy flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Question précédente
              </button>
            )}
          </motion.div>
        )}

        {/* ÉTAPE 3 — RÉSULTAT 3 COLONNES */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-navy tracking-tight text-center mb-2">Votre estimation</h1>
            <p className="text-center text-secondary text-sm mb-10">
              {answers.produit || "Produit"} — {answers.pays || "Chine"} → Matadi ({incoterm})
            </p>

            <div className="grid md:grid-cols-3 gap-5">
              {OFFRES.map((offre, idx) => {
                const total = Math.round(result.total_usd * offre.multiplicateur);
                return (
                  <div key={offre.nom} className={`card-glass p-6 flex flex-col ${idx === 1 ? "border-orange" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-navy text-lg">{offre.nom}</h3>
                      {idx === 1 && <span className="text-xs font-semibold bg-orange text-white rounded-full px-2.5 py-1">Populaire</span>}
                    </div>
                    <p className="text-xs text-secondary mb-4">⏱ {offre.delai}</p>
                    <div className="flex-1 space-y-1.5 text-sm">
                      {result.lignes.map((l: TaxLine) => (
                        <div key={l.label} className="flex justify-between gap-2">
                          <span className="text-secondary truncate">{l.label}</span>
                          <span className="text-navy font-medium shrink-0">${Math.round(l.amount * (l.label.includes("Fret") ? offre.multiplicateur : 1)).toLocaleString("fr-FR")}</span>
                        </div>
                      ))}
                      {offre.nom === "Express" && (
                        <div className="flex justify-between gap-2">
                          <span className="text-secondary">Supplément aérien</span>
                          <span className="text-navy font-medium">inclus</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border mt-4 pt-4">
                      <p className="text-3xl font-bold text-navy">{format(total)}</p>
                      <p className="text-xs text-secondary mt-1">
                        ≈ {(total * taux.bcc).toLocaleString("fr-FR")} FC (BCC) ·{" "}
                        <span className="opacity-70">{(total * taux.parallele).toLocaleString("fr-FR")} FC (parallèle)</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-secondary max-w-3xl mx-auto mt-8 leading-relaxed">{DISCLAIMER_TAXES}</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => setSaved(true)}
                className="flex items-center justify-center gap-2 bg-navy text-white font-semibold rounded-full px-8 py-4 hover:bg-navy/90 transition-colors"
              >
                <Save className="w-4 h-4" /> {saved ? "Simulation enregistrée ✓" : "Enregistrer simulation"}
              </button>
              <a
                href="/debuter"
                className="flex items-center justify-center gap-2 border border-border font-semibold text-navy rounded-full px-8 py-4 hover:border-orange hover:text-orange transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Parler à un conseiller
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
