// Shared tax engine — mirror of supabase/functions/calculate-taxes
// Base: grille DGDA / FPI / OGEFREM / OCC, TVA 16%.

export interface TarifRDC {
  categorie: string;
  dd_pourcent: number;
  accise_pourcent: number;
  tva_pourcent: number;
  fpi_pourcent: number;
  ogefrem_pourcent: number;
  occ_pourcent: number;
  frais_fixes_matadi_usd: number;
}

export const DEFAULT_TARIFS: TarifRDC[] = [
  { categorie: "vehicule_tourisme_-10ans", dd_pourcent: 10, accise_pourcent: 0, tva_pourcent: 16, fpi_pourcent: 2, ogefrem_pourcent: 0.59, occ_pourcent: 1.15, frais_fixes_matadi_usd: 1100 },
  { categorie: "vehicule_4x4", dd_pourcent: 10, accise_pourcent: 0, tva_pourcent: 16, fpi_pourcent: 2, ogefrem_pourcent: 0.59, occ_pourcent: 1.15, frais_fixes_matadi_usd: 1100 },
  { categorie: "electronique", dd_pourcent: 10, accise_pourcent: 0, tva_pourcent: 16, fpi_pourcent: 2, ogefrem_pourcent: 0.59, occ_pourcent: 1.15, frais_fixes_matadi_usd: 750 },
  { categorie: "vetements", dd_pourcent: 20, accise_pourcent: 0, tva_pourcent: 16, fpi_pourcent: 2, ogefrem_pourcent: 0.59, occ_pourcent: 1.15, frais_fixes_matadi_usd: 650 },
  { categorie: "pieces_auto", dd_pourcent: 10, accise_pourcent: 0, tva_pourcent: 16, fpi_pourcent: 2, ogefrem_pourcent: 0.59, occ_pourcent: 1.15, frais_fixes_matadi_usd: 700 },
];

export interface TaxInput {
  prix_fob: number;
  prix_fret: number;
  prix_assurance: number;
  incoterm: "EXW" | "FOB" | "CIF";
  categorie: string;
  transport_interieur_chine?: number; // auto si EXW
  frais_export?: number;              // auto si EXW
}

export interface TaxLine { label: string; amount: number }
export interface TaxResult {
  lignes: TaxLine[];
  base_caf: number;
  total_usd: number;
  tarif: TarifRDC;
}

export function calculateTaxes(input: TaxInput, tarifs: TarifRDC[] = DEFAULT_TARIFS): TaxResult {
  const tarif = tarifs.find((t) => t.categorie === input.categorie) ?? DEFAULT_TARIFS[0];

  // EXW: on ajoute transport intérieur Chine + frais export (fourchettes 150-350 / 80-150)
  const transportChine = input.incoterm === "EXW" ? (input.transport_interieur_chine ?? 250) : 0;
  const fraisExport = input.incoterm === "EXW" ? (input.frais_export ?? 115) : 0;

  const fob = input.prix_fob + transportChine + fraisExport;
  const fret = input.incoterm === "CIF" ? 0 : input.prix_fret; // CIF = fret inclus dans prix fournisseur
  const assurance = input.prix_assurance || Math.round(fob * 0.015); // ~1.5% si inconnue
  const caf = fob + fret + assurance;

  const dd = round2((caf * tarif.dd_pourcent) / 100);
  const accise = round2((caf * tarif.accise_pourcent) / 100);
  const fpi = round2(((caf + dd) * tarif.fpi_pourcent) / 100);
  const ogefrem = round2((caf * tarif.ogefrem_pourcent) / 100);
  const occ = round2((caf * tarif.occ_pourcent) / 100);
  const tva = round2(((caf + dd + accise) * tarif.tva_pourcent) / 100);
  const fraisMatadi = tarif.frais_fixes_matadi_usd;
  const transportMatadiKin = 450; // camion standard 20-40ft
  const fraisAgence = 200;

  const lignes: TaxLine[] = [
    { label: "Produit (FOB)", amount: input.prix_fob },
    ...(transportChine ? [{ label: "Transport intérieur Chine (EXW)", amount: transportChine }] : []),
    ...(fraisExport ? [{ label: "Frais export Chine (EXW)", amount: fraisExport }] : []),
    ...(fret ? [{ label: "Fret international", amount: fret }] : []),
    ...(input.incoterm !== "CIF" ? [{ label: "Assurance (~1.5%)", amount: assurance }] : []),
    { label: `Base CAF (Valeur en douane)`, amount: caf },
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

  const total_usd = round2(lignes.reduce((s, l) => s + l.amount, 0) - caf); // caf déjà inclus via ses composants
  return { lignes, base_caf: caf, total_usd, tarif };
}

function round2(n: number) { return Math.round(n * 100) / 100; }

export const DISCLAIMER_TAXES =
  "⚠ Estimation indicative basée sur grille DGDA/OGEFREM 2024-2025 et taux BCC du jour. " +
  "Montant final selon SYDONIA au jour du dédouanement. Peut varier selon poids/volume réel, " +
  "taux de change et frais réellement appliqués.";
