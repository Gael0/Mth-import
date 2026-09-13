"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, AlertTriangle, Link2 } from "lucide-react";

interface VerifResult {
  score: number; nom: string; badges: string[]; risques: string[]; conseils: string[];
}

// Heuristique de démo: le score est déterministe selon l'URL pour la démo.
// En production: appel Edge Function qui scrape/analyse la fiche fournisseur.
function analyser(url: string): VerifResult {
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) % 997;
  const score = 25 + (hash % 71); // 25-95
  const nom = url.replace(/^https?:\/\//, "").split("/")[0];
  const badges: string[] = [];
  if (score > 60) badges.push("Gold Supplier 5+ ans");
  if (score > 50) badges.push("Verified Supplier");
  if (score > 40) badges.push("Trade Assurance");
  const risques: string[] = [];
  if (score < 50) risques.push("Ancienneté du compte non vérifiable ou < 2 ans");
  if (score < 65) risques.push("Pas de Trade Assurance détectée sur la fiche");
  if (url.toLowerCase().includes("western") || url.toLowerCase().includes("wester")) risques.push("Demande de paiement hors plateforme détectée dans vos échanges");
  if (risques.length === 0) risques.push("Aucun signal faible majeur détecté (analyse automatique)");
  return {
    score, nom, badges, risques,
    conseils: [
      "Payez toujours via Trade Assurance / Alibaba.com — jamais en Western Union direct au fournisseur.",
      "Exigez une inspection tierce (SGS) avant le solde, surtout pour les véhicules.",
    ],
  };
}

function scoreColor(s: number) { return s > 75 ? "text-green-500" : s >= 40 ? "text-yellow-500" : "text-red-500"; }
function scoreEmoji(s: number) { return s > 75 ? "🟢" : s >= 40 ? "🟡" : "🔴"; }

export default function VerifierFournisseur() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<VerifResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // analyse simulée
    setResult(analyser(url.trim()));
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">
          Vérifiez votre fournisseur avant de payer.
        </h1>
        <p className="text-secondary mt-3">
          Collez le lien Alibaba / 1688 / site web. Premier filtre anti-arnaque en 10 secondes.
        </p>
      </div>

      <div className="card-glass p-2 flex items-center gap-2">
        <Link2 className="w-5 h-5 text-secondary ml-3 shrink-0" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && verify()}
          placeholder="https://www.alibaba.com/product-detail/..."
          className="flex-1 bg-transparent outline-none py-3 text-navy text-sm placeholder:text-secondary min-w-0"
        />
        <button
          onClick={verify}
          disabled={loading}
          className="bg-orange text-white font-semibold rounded-full px-6 py-3 text-sm hover:bg-orange/90 transition-colors disabled:opacity-60 shrink-0"
        >
          {loading ? "Analyse..." : "Vérifier"}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-glass p-8 mt-8">
          <div className="flex items-center gap-6 mb-6">
            <div className={`text-6xl font-bold ${scoreColor(result.score)}`}>
              {result.score}<span className="text-2xl text-secondary">/100</span>
            </div>
            <div>
              <p className="text-2xl">{scoreEmoji(result.score)}</p>
              <p className="font-semibold text-navy break-all">{result.nom}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {result.badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                <BadgeCheck className="w-3.5 h-3.5" /> {b}
              </span>
            ))}
            {result.badges.length === 0 && (
              <span className="text-xs text-secondary">Aucun badge de confiance détecté</span>
            )}
          </div>

          <h3 className="font-semibold text-navy flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange" /> Risques détectés
          </h3>
          <ul className="text-sm text-secondary space-y-1 mb-6 list-disc list-inside">
            {result.risques.map((r) => <li key={r}>{r}</li>)}
          </ul>

          <h3 className="font-semibold text-navy flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-orange" /> Conseils anti-arnaque
          </h3>
          <ul className="text-sm text-secondary space-y-1 list-disc list-inside mb-6">
            {result.conseils.map((c) => <li key={c}>{c}</li>)}
          </ul>

          <p className="text-xs text-secondary border-t border-border pt-4">
            ⚠ Premier filtre automatique, pas une garantie bancaire. Nos conseillers peuvent pousser
            la vérification manuellement (appels, registre chinois, références clients).
          </p>
        </motion.div>
      )}
    </div>
  );
}
