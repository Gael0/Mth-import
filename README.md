# MTH — Marchandise Tracking Hub

**Importez vers la RDC en toute confiance.**
Importez. Suivez. Recevez.

Plateforme SaaS: simulateur de taxes douanières (DGDA/OGEFREM/FPI/OCC), suivi temps réel avec preuves photo/vidéo, conseiller humain + anti-arnaque fournisseur.

## Stack
- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Framer Motion** (animations) + **Lucide React** (icônes)
- **Supabase**: Auth, Postgres, Storage, Edge Functions, Realtime, RLS

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner vos clés Supabase
npm run dev                  # http://localhost:3000
```

> Sans variables Supabase, le site tourne en **mode démo** avec des données fictives réalistes (5 imports seedés).

## Structure

| Chemin | Description |
|---|---|
| `/` | Landing: hero, 3 cards, démo tracking Yokohama→Matadi |
| `/simulateur` | Stepper 3 étapes: incoterm → 9 questions IA → résultat 3 offres (Éco/Std/Express) |
| `/debuter` | Chat conseiller débutant + escalation humaine automatique |
| `/tracking/IMP-2026-004582` | Suivi: anneau progression, timeline 11 étapes, map, documents, paiements Mobile Money |
| `/verifier-fournisseur` | Score fournisseur /100 + badges + risques |
| `/admin` | Dashboard: overview, imports (changement status + preuves), tickets, tarifs DGDA, taux BCC/parallèle, clients |

## Setup Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans le SQL Editor (tables + RLS + buckets + trigger + seed)
3. Déployer les Edge Functions:

```bash
supabase functions deploy calculate-taxes
supabase functions deploy send-whatsapp-update
```

4. Configurer les secrets pour le trigger WhatsApp:

```sql
alter database postgres set app.edge_function_url = 'https://VOTRE_PROJET.supabase.co/functions/v1';
alter database postgres set app.service_role_key = 'VOTRE_SERVICE_ROLE_KEY';
```

5. Dans Authentication > Users, créer les comptes admins avec `user_metadata.role = "admin"`

## Branding
- Logo icône: `public/mth_M_hero_1.png` (hero 140px, favicon, pin map, loader)
- Logo texte: `public/mth_v1.png` (header 32px, footer, documents)
- Couleurs: Navy `#0A2342` · Orange `#FF7A00` · Background `#FAFAFA`
- Police: Inter / SF Pro Display — style Apple.com / Linear.app / Stripe

## Numéros de tracking démo
`IMP-2026-004582` (RAV4 en transit 62%) · `IMP-2026-003921` (arrivé port 87%) · `IMP-2026-005103` · `IMP-2026-002845` · `IMP-2026-005977` (livré)
