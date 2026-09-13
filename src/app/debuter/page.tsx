"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";

interface Msg { from: "user" | "ia"; text: string }

// Mots-clés déclenchant l'escalade humaine
const ESCALATION_KEYWORDS = ["arnaque", "litige", "fournisseur douteux", "humain", "conseiller", "escroquerie"];
const ESCALATION_REPLY =
  "Je transmets à un conseiller humain MTH, il vous répond sur WhatsApp sous 2h.";

function iaReply(input: string, countNotUnderstood: number): { text: string; escalate: boolean } {
  const t = input.toLowerCase();
  if (ESCALATION_KEYWORDS.some((k) => t.includes(k)) || countNotUnderstood >= 2) {
    return { text: ESCALATION_REPLY, escalate: true };
  }
  if (t.includes("fob") || t.includes("cif") || t.includes("exw")) {
    return {
      text:
        "Pensez à l'incoterm comme à « jusqu'où le fournisseur vous accompagne » : " +
        "EXW = il vous remet la marchandise à l'usine, vous gérez tout ensuite (comme acheter une voiture directement à l'usine). " +
        "FOB = il la met dans le bateau au port de Chine, vous gérez la mer (c'est l'option que je recommande aux débutants). " +
        "CIF = il gère aussi le fret jusqu'à Matadi, vous ne gérez que le dédouanement. " +
        "Je ne donne jamais de prix ferme, mais en fourchette : ça dépend du poids, du volume et du taux du jour. Voulez-vous essayer le simulateur ?",
      escalate: false,
    };
  }
  if (t.includes("prix") || t.includes("combien") || t.includes("coût")) {
    return {
      text:
        "Pour une estimation, j'ai besoin de 3 infos : quoi importer, depuis quel pays, et le prix d'achat. " +
        "Vous pouvez aussi utiliser le simulateur MTH — il calcule CAF, droits de douane, TVA 16%, OGEFREM et frais Matadi en 3 étapes. " +
        "⚠ Rappel : toute estimation reste indicative, le montant final est celui de SYDONIA au jour du dédouanement.",
      escalate: false,
    };
  }
  if (t.includes("comprends")) {
    return {
      text:
        countNotUnderstood === 1
          ? "Pas de souci, je reformule plus simplement. De quoi parliez-vous exactement : le prix, les documents, ou le transport ?"
          : ESCALATION_REPLY,
      escalate: countNotUnderstood >= 2,
    };
  }
  return {
    text:
      "Bonne question ! Pour bien vous orienter : quel produit voulez-vous importer, et depuis quel pays (Chine, Japon, Dubaï) ? " +
      "Si vous hésitez, je peux aussi vous aider à vérifier votre fournisseur avant tout paiement.",
    escalate: false,
  };
}

export default function Debuter() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ia", text: "Bonjour 👋 Je suis l'Assistant Import MTH. Décrivez votre projet d'importation, je vous guide pas à pas — même si c'est votre première fois." },
  ]);
  const [input, setInput] = useState("");
  const [escalated, setEscalated] = useState(false);
  const [notUnderstood, setNotUnderstood] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, escalated]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const isNotUnderstood = text.toLowerCase().includes("comprends");
    const nextCount = isNotUnderstood ? notUnderstood + 1 : notUnderstood;
    const reply = iaReply(text, nextCount);
    setMessages((m) => [...m, { from: "user", text }, { from: "ia", text: reply.text }]);
    setNotUnderstood(nextCount);
    if (reply.escalate) setEscalated(true);
    setInput("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">
          Vous voulez importer. On vous accompagne.
        </h1>
        <p className="text-secondary mt-2">Assistant IA + conseillers humains basés à Kinshasa.</p>
      </div>

      {/* Card escalation */}
      {escalated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="card-glass border-red-200 bg-red-50/80 p-5 mb-6 flex items-start gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-600">Conseiller humain prévenu</p>
            <p className="text-sm text-red-500/80">
              Un expert MTH vous recontacte sur WhatsApp sous 2h ouvrées. Votre conversation lui a été transmise.
            </p>
          </div>
        </motion.div>
      )}

      {/* Chat */}
      <div className="flex-1 card-glass p-6 flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: "55vh" }}>
          {messages.map((m, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.from === "user"
                    ? "bg-navy text-white rounded-br-md"
                    : "bg-white border border-border text-navy rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input style Spotlight Apple */}
        <div className="mt-4 flex items-center gap-2 card-glass px-4 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Décrivez votre projet..."
            className="flex-1 bg-transparent outline-none py-3 text-navy placeholder:text-secondary"
          />
          <button
            onClick={send}
            className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center hover:bg-orange/90 transition-colors shrink-0"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
