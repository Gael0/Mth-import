export type ImportStatus =
  | "commande_enregistree" | "chez_fournisseur" | "recu_agence"
  | "preparation_expedition" | "conteneur_charge" | "navire_parti"
  | "en_transit" | "arrive_port" | "dedouanement" | "disponible" | "livre";

export const STATUS_ORDER: ImportStatus[] = [
  "commande_enregistree", "chez_fournisseur", "recu_agence",
  "preparation_expedition", "conteneur_charge", "navire_parti",
  "en_transit", "arrive_port", "dedouanement", "disponible", "livre",
];

export const STATUS_LABELS: Record<ImportStatus, string> = {
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

export interface ImportEvent {
  id: string;
  status: ImportStatus;
  title: string;
  description: string;
  photo_url?: string;
  video_url?: string;
  created_at: string;
}

export interface ImportItem {
  id: string;
  tracking_number: string;
  client_whatsapp: string;
  client_nom: string;
  origin_country: string;
  origin_city: string;
  destination_port: string;
  incoterm: "EXW" | "FOB" | "CIF";
  type: "vehicule" | "marchandise" | "conteneur";
  produit: string;
  status: ImportStatus;
  progress: number;
  current_location: string;
  eta: string;
  created_at: string;
  events: ImportEvent[];
}

export interface Payment {
  id: string; label: string; montant_usd: number;
  statut: "paye" | "a_payer" | "en_attente";
  methode: "m-pesa" | "orange_money" | "airtel_money" | "usd_cash" | "bank";
}

export interface ConseilTicket {
  id: string; client_whatsapp: string; sujet: string;
  messages: { from: "client" | "ia" | "admin"; text: string; at: string }[];
  status: "ia" | "escalade_humaine" | "resolu";
}
