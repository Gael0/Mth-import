// Edge Function: send-whatsapp-update
// Appelée par le trigger PostgreSQL à chaque changement de status d'un import.
// Envoie un message WhatsApp au client via Evolution API (placeholder).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATUS_LABELS: Record<string, string> = {
  commande_enregistree: "Commande enregistrée",
  chez_fournisseur: "Chez le fournisseur",
  recu_agence: "Reçu agence",
  preparation_expedition: "Préparation expédition",
  conteneur_charge: "Conteneur chargé",
  navire_parti: "Navire parti",
  en_transit: "En transit",
  arrive_port: "Arrivé au port",
  dedouanement: "Dédouanement",
  disponible: "Disponible",
  livre: "Livré ✅",
};

Deno.serve(async (req) => {
  const { record } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: client } = await supabase
    .from("clients")
    .select("whatsapp, nom")
    .eq("id", record.client_id)
    .single();

  if (!client) return Response.json({ ok: false, reason: "client introuvable" });

  const message =
    `🚢 MTH - MISE À JOUR
` +
    `Votre ${record.produit} (${record.tracking_number}) est passé à: ${STATUS_LABELS[record.status] ?? record.status}
` +
    `📍 ${record.current_location ?? "—"}
` +
    `📈 ${record.progress}%
` +
    `ETA: ${record.eta ?? "—"}
` +
    `Voir: https://mth.cd/tracking/${record.tracking_number}`;

  // ---- Placeholder Evolution API ----
  // await fetch(`${Deno.env.get("EVOLUTION_API_URL")}/message/sendText/${instance}`, {
  //   method: "POST",
  //   headers: { "apikey": Deno.env.get("EVOLUTION_API_KEY")! },
  //   body: JSON.stringify({ number: client.whatsapp, text: message }),
  // });

  console.log(`[WhatsApp → ${client.whatsapp}]\n${message}`);
  return Response.json({ ok: true, to: client.whatsapp, message });
});
