import { ImportItem, Payment, ConseilTicket } from "./types";

// Données de démo — utilisées uniquement si Supabase n'est pas configuré.
export const SEED_IMPORTS: ImportItem[] = [
  {
    id: "a1", tracking_number: "IMP-2026-004582",
    client_whatsapp: "+243 810 000 001", client_nom: "Patrick M.",
    origin_country: "Japon", origin_city: "Yokohama", destination_port: "Matadi",
    incoterm: "FOB", type: "vehicule", produit: "Toyota RAV4 2022",
    status: "en_transit", progress: 62, current_location: "Océan Indien",
    eta: "2026-10-14", created_at: "2026-08-20T09:00:00Z",
    events: [
      { id: "e1", status: "commande_enregistree", title: "Commande enregistrée", description: "Dossier MTH ouvert. Conseiller attribué.", created_at: "2026-08-20T09:00:00Z" },
      { id: "e2", status: "recu_agence", title: "Reçu agence Yokohama", description: "Véhicule inspecté, photos jointes.", photo_url: "/demo/proof-rav4.jpg", created_at: "2026-08-28T14:30:00Z" },
      { id: "e3", status: "conteneur_charge", title: "Conteneur scellé", description: "Conteneur MSKU 882134-3 scellé, preuve vidéo.", video_url: "/demo/scan-rav4.mp4", created_at: "2026-09-02T10:15:00Z" },
      { id: "e4", status: "en_transit", title: "Navire en mer", description: "Départ Yokohama 8 sept. ETA Matadi 14 oct.", created_at: "2026-09-08T06:00:00Z" },
    ],
  },
  {
    id: "a2", tracking_number: "IMP-2026-003921",
    client_whatsapp: "+243 822 000 002", client_nom: "Grâce K.",
    origin_country: "Chine", origin_city: "Shenzhen", destination_port: "Matadi",
    incoterm: "FOB", type: "marchandise", produit: "15 cartons électroniques",
    status: "arrive_port", progress: 87, current_location: "Port de Matadi",
    eta: "2026-09-15", created_at: "2026-07-10T09:00:00Z",
    events: [
      { id: "e5", status: "commande_enregistree", title: "Commande enregistrée", description: "Dossier ouvert.", created_at: "2026-07-10T09:00:00Z" },
      { id: "e6", status: "navire_parti", title: "Navire parti de Shenzhen", description: "Photos du chargement jointes.", photo_url: "/demo/proof-cartons.jpg", created_at: "2026-08-01T08:00:00Z" },
      { id: "e7", status: "arrive_port", title: "Arrivée au port de Matadi", description: "Attente RDV dédouanement SYDONIA.", created_at: "2026-09-12T16:00:00Z" },
    ],
  },
  {
    id: "a3", tracking_number: "IMP-2026-005103",
    client_whatsapp: "+243 899 000 003", client_nom: "Junior T.",
    origin_country: "Chine", origin_city: "Guangzhou", destination_port: "Matadi",
    incoterm: "EXW", type: "marchandise", produit: "Vêtements (3 ballots)",
    status: "preparation_expedition", progress: 34, current_location: "Guangzhou",
    eta: "2026-11-02", created_at: "2026-08-30T09:00:00Z",
    events: [
      { id: "e8", status: "commande_enregistree", title: "Commande enregistrée", description: "Simulation validée, EXW confirmé.", created_at: "2026-08-30T09:00:00Z" },
      { id: "e9", status: "preparation_expedition", title: "Préparation expédition", description: "Regroupement des ballots en cours.", created_at: "2026-09-10T11:00:00Z" },
    ],
  },
  {
    id: "a4", tracking_number: "IMP-2026-002845",
    client_whatsapp: "+243 815 000 004", client_nom: "Naomi L.",
    origin_country: "Japon", origin_city: "Nagoya", destination_port: "Matadi",
    incoterm: "CIF", type: "vehicule", produit: "Honda CR-V 2021",
    status: "dedouanement", progress: 93, current_location: "Matadi - SEGUCE",
    eta: "2026-09-16", created_at: "2026-06-15T09:00:00Z",
    events: [
      { id: "e10", status: "arrive_port", title: "Arrivée Matadi", description: "Déclaration SYDONIA déposée.", created_at: "2026-09-10T09:00:00Z" },
      { id: "e11", status: "dedouanement", title: "Dédouanement en cours", description: "Visite physique programmée.", created_at: "2026-09-12T10:00:00Z" },
    ],
  },
  {
    id: "a5", tracking_number: "IMP-2026-005977",
    client_whatsapp: "+243 840 000 005", client_nom: "David B.",
    origin_country: "Dubaï", origin_city: "Jebel Ali", destination_port: "Matadi",
    incoterm: "FOB", type: "conteneur", produit: "Conteneur 40ft pièces auto",
    status: "livre", progress: 100, current_location: "Kinshasa - Limete",
    eta: "2026-08-28", created_at: "2026-05-01T09:00:00Z",
    events: [
      { id: "e12", status: "livre", title: "Livré ✅", description: "Remis au client à Kinshasa. Bon de livraison signé.", photo_url: "/demo/proof-livraison.jpg", created_at: "2026-08-28T15:00:00Z" },
    ],
  },
];

export const SEED_PAYMENTS: Payment[] = [
  { id: "p1", label: "Fret maritime", montant_usd: 1450, statut: "paye", methode: "m-pesa" },
  { id: "p2", label: "Frais fixes Matadi", montant_usd: 1100, statut: "en_attente", methode: "orange_money" },
  { id: "p3", label: "Transport Matadi → Kinshasa", montant_usd: 450, statut: "a_payer", methode: "airtel_money" },
];

export const SEED_TICKETS: ConseilTicket[] = [
  {
    id: "t1", client_whatsapp: "+243 810 000 001", sujet: "Fournisseur Alibaba douteux",
    status: "escalade_humaine",
    messages: [
      { from: "client", text: "Le fournisseur demande 100% Western Union, c'est normal ?", at: "2026-09-12T18:02:00Z" },
      { from: "ia", text: "Je transmets à un conseiller humain MTH, il vous répond sur WhatsApp sous 2h.", at: "2026-09-12T18:02:30Z" },
    ],
  },
  {
    id: "t2", client_whatsapp: "+243 822 000 002", sujet: "Je ne comprends pas la TVA",
    status: "escalade_humaine",
    messages: [
      { from: "client", text: "je ne comprends pas", at: "2026-09-11T10:00:00Z" },
      { from: "client", text: "je ne comprends pas la différence FOB CIF", at: "2026-09-11T10:01:00Z" },
      { from: "ia", text: "Je transmets à un conseiller humain MTH, il vous répond sur WhatsApp sous 2h.", at: "2026-09-11T10:01:30Z" },
    ],
  },
];

export const RATES = { bcc: 2855, parallele: 2950 };
