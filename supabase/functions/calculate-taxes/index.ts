// Edge Function: calculate-taxes
// POST { prix_fob, prix_fret, prix_assurance, incoterm, categorie }
// Retourne le détail complet de taxation basé sur tarifs_rdc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const round2 = (n: number) => Math.round(n * 100) / 100;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { prix_fob = 0, prix_fret = 0, prix_assurance = 0, incoterm = "FOB", categorie } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: tarifs } = await supabase.from("tarifs_rdc").select("*");
  const tarif = tarifs?.find((t: { categorie: string }) => t.categorie === categorie) ?? tarifs?.[0];
  if (!tarif) return Response.json({ error: "categorie inconnue" }, { status: 400 });

  // EXW: transport intérieur Chine + frais export (fourchettes 150-350 / 80-150)
  const transportChine = incoterm === "EXW" ? 250 : 0;
  const fraisExport = incoterm === "EXW" ? 115 : 0;
  const fob = prix_fob + transportChine + fraisExport;
  const fret = incoterm === "CIF" ? 0 : prix_fret;
  const assurance = prix_assurance || round2(fob * 0.015);
  const caf = round2(fob + fret + assurance);

  const dd = round2((caf * tarif.dd_pourcent) / 100);
  const accise = round2((caf * tarif.accise_pourcent) / 100);
  const fpi = round2(((caf + dd) * tarif.fpi_pourcent) / 100);
  const ogefrem = round2((caf * tarif.ogefrem_pourcent) / 100);
  const occ = round2((caf * tarif.occ_pourcent) / 100);
  const tva = round2(((caf + dd + accise) * tarif.tva_pourcent) / 100);
  const fraisMatadi = tarif.frais_fixes_matadi_usd;
  const transportMatadiKin = 450;
  const fraisAgence = 200;

  const lignes = [
    { label: "Produit (FOB)", amount: prix_fob },
    ...(transportChine ? [{ label: "Transport intérieur Chine (EXW)", amount: transportChine }] : []),
    ...(fraisExport ? [{ label: "Frais export Chine (EXW)", amount: fraisExport }] : []),
    ...(fret ? [{ label: "Fret international", amount: fret }] : []),
    ...(incoterm !== "CIF" ? [{ label: "Assurance (~1.5%)", amount: assurance }] : []),
    { label: "Base CAF (valeur en douane)", amount: caf },
    { label: `Droit de douane ${tarif.dd_pourcent}% (DGDA)`, amount: dd },
    ...(accise ? [{ label: `Accise ${tarif.accise_pourcent}%`, amount: accise }] : []),
    { label: `FPI ${tarif.fpi_pourcent}% de (CAF+DD)`, amount: fpi },
    { label: `OGEFREM ${tarif.ogefrem_pourcent}% CAF`, amount: ogefrem },
    { label: `OCC ${tarif.occ_pourcent}% CAF`, amount: occ },
    { label: `TVA ${tarif.tva_pourcent}% sur (CAF+DD+Accise)`, amount: tva },
    { label: "Frais fixes Matadi (SEGUCE, SCTP, transit)", amount: fraisMatadi },
    { label: "Transport Matadi → Kinshasa", amount: transportMatadiKin },
    { label: "Frais agence MTH", amount: fraisAgence },
  ];

  const total_usd = round2(lignes.reduce((s, l) => s + l.amount, 0) - caf);

  return Response.json({
    lignes, base_caf: caf, total_usd, tarif,
    disclaimer: "Estimation indicative basée sur grille DGDA/OGEFREM 2024-2025 et taux BCC du jour. Montant final selon SYDONIA au jour du dédouanement.",
  });
});
