-- ============================================================
-- MTH — Marchandise Tracking Hub | Schéma Supabase complet
-- À exécuter dans le SQL Editor Supabase
-- ============================================================

-- 1. clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  nom text,
  whatsapp text unique not null,
  email text,
  ville text default 'Kinshasa',
  is_debutant boolean default false
);

-- 2. Taux de change USD/CDF
create table if not exists exchange_rates (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('BCC','PARALLELE')),
  usd_to_cdf numeric not null,
  date date default current_date,
  created_at timestamp default now()
);

-- 3. Tarifs douane RDC (éditables admin)
create table if not exists tarifs_rdc (
  id uuid primary key default gen_random_uuid(),
  categorie text not null,
  dd_pourcent numeric default 10,
  accise_pourcent numeric default 0,
  tva_pourcent numeric default 16,
  fpi_pourcent numeric default 2,
  ogefrem_pourcent numeric default 0.59,
  occ_pourcent numeric default 1.15,
  frais_fixes_matadi_usd numeric default 950,
  note text,
  updated_at timestamp default now()
);

-- 4. Imports
create table if not exists imports (
  id uuid primary key default gen_random_uuid(),
  tracking_number text unique not null,
  client_id uuid references clients(id),
  origin_country text,
  origin_city text,
  destination_port text default 'Matadi',
  incoterm text check (incoterm in ('EXW','FOB','CIF')) default 'FOB',
  type text check (type in ('vehicule','marchandise','conteneur')),
  produit text,
  prix_fob numeric,
  prix_fret numeric,
  prix_assurance numeric,
  valeur_caf numeric generated always as (coalesce(prix_fob,0) + coalesce(prix_fret,0) + coalesce(prix_assurance,0)) stored,
  status text check (status in ('commande_enregistree','chez_fournisseur','recu_agence','preparation_expedition','conteneur_charge','navire_parti','en_transit','arrive_port','dedouanement','disponible','livre')) default 'commande_enregistree',
  progress int default 5,
  current_location text,
  eta date,
  total_estime_usd numeric,
  total_estime_cdf numeric,
  created_at timestamp default now()
);

-- 5. Timeline avec preuves
create table if not exists import_events (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references imports(id) on delete cascade,
  status text,
  title text,
  description text,
  photo_url text,
  video_url text,
  created_by_admin_id uuid,
  created_at timestamp default now()
);

-- 6. Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references imports(id) on delete cascade,
  type text,
  file_url text,
  file_name text,
  created_at timestamp default now()
);

-- 7. Paiements Mobile Money
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references imports(id) on delete cascade,
  label text,
  montant_usd numeric,
  montant_cdf numeric,
  statut text check (statut in ('paye','a_payer','en_attente')) default 'a_payer',
  methode text check (methode in ('m-pesa','orange_money','airtel_money','usd_cash','bank'))
);

-- 8. Conseil + vérif fournisseur
create table if not exists conseil_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  messages jsonb default '[]',
  status text check (status in ('ia','escalade_humaine','resolu')) default 'ia',
  assigned_admin_id uuid,
  created_at timestamp default now()
);

create table if not exists supplier_checks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  url text,
  nom_societe text,
  score int,
  badges jsonb,
  analyse text,
  created_at timestamp default now()
);

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('preuves', 'preuves', true),      -- photos/vidéos de preuve (import_events)
  ('documents', 'documents', false)  -- factures, B/L, déclarations
on conflict (id) do nothing;

-- Politiques Storage
create policy "Preuves publiques en lecture" on storage.objects for select
  using (bucket_id = 'preuves');
create policy "Admins upload preuves" on storage.objects for insert
  with check (bucket_id = 'preuves' and auth.role() = 'authenticated');
create policy "Documents: lecture client via tracking" on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Admins upload documents" on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

-- ============ RLS ============
alter table clients enable row level security;
alter table imports enable row level security;
alter table import_events enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table conseil_sessions enable row level security;
alter table supplier_checks enable row level security;
alter table tarifs_rdc enable row level security;
alter table exchange_rates enable row level security;

-- Helper: est-ce un admin ?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
  );
$$ language sql security definer stable;

-- Tarifs et taux: lecture publique (le simulateur en a besoin), écriture admin
create policy "Tarifs lecture publique" on tarifs_rdc for select using (true);
create policy "Tarifs écriture admin" on tarifs_rdc for all using (is_admin()) with check (is_admin());
create policy "Taux lecture publique" on exchange_rates for select using (true);
create policy "Taux écriture admin" on exchange_rates for all using (is_admin()) with check (is_admin());

-- Clients: un client ne voit que son propre profil (par téléphone renseigné), admin voit tout
create policy "Client lit son profil" on clients for select
  using (auth.uid() = id or is_admin());
create policy "Admin gère clients" on clients for all using (is_admin()) with check (is_admin());

-- Imports: lecture publique via tracking_number (le client suit avec son numéro),
-- mais colonnes sensibles protégées côté API. Écriture admin uniquement.
create policy "Import lisible par tracking" on imports for select using (true);
create policy "Admin gère imports" on imports for all using (is_admin()) with check (is_admin());

create policy "Events lisibles" on import_events for select using (true);
create policy "Admin gère events" on import_events for all using (is_admin()) with check (is_admin());
create policy "Documents lisibles" on documents for select using (true);
create policy "Admin gère documents" on documents for all using (is_admin()) with check (is_admin());
create policy "Payments admin" on payments for all using (is_admin()) with check (is_admin());

-- Conseil: le client insère/lit ses sessions, admin traite
create policy "Client crée sa session conseil" on conseil_sessions for insert
  with check (client_id = auth.uid());
create policy "Client lit ses sessions" on conseil_sessions for select
  using (client_id = auth.uid() or is_admin());
create policy "Admin traite sessions" on conseil_sessions for update
  using (is_admin()) with check (is_admin());
create policy "Client crée vérif fournisseur" on supplier_checks for insert
  with check (client_id = auth.uid());
create policy "Lecture vérifs" on supplier_checks for select
  using (client_id = auth.uid() or is_admin());

-- ============ TRIGGER : notification WhatsApp au changement de status ============
-- Nécessite l'extension http (disponible sur Supabase cloud)
create extension if not exists http with schema extensions;

create or replace function notify_import_status() returns trigger as $$
begin
  if old.status is distinct from new.status then
    perform extensions.http_post(
      url := current_setting('app.edge_function_url') || '/send-whatsapp-update',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('record', row_to_json(new), 'old_status', old.status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_status on imports;
create trigger trg_notify_status
  after update of status on imports
  for each row execute function notify_import_status();

-- ============ SEED DATA ============
insert into tarifs_rdc (categorie, dd_pourcent, accise_pourcent, frais_fixes_matadi_usd) values
  ('vehicule_tourisme_-10ans', 10, 0, 1100),
  ('vehicule_4x4', 10, 0, 1100),
  ('electronique', 10, 0, 750),
  ('vetements', 20, 0, 650),
  ('pieces_auto', 10, 0, 700)
on conflict do nothing;

insert into exchange_rates (source, usd_to_cdf) values
  ('BCC', 2855), ('PARALLELE', 2950)
on conflict do nothing;

-- Clients + imports fictifs
insert into clients (nom, whatsapp, ville, is_debutant) values
  ('Patrick M.', '+243810000001', 'Kinshasa', false),
  ('Grâce K.', '+243822000002', 'Kinshasa', true),
  ('Junior T.', '+243899000003', 'Kinshasa', true),
  ('Naomi L.', '+243815000004', 'Lubumbashi', false),
  ('David B.', '+243840000005', 'Kinshasa', false)
on conflict (whatsapp) do nothing;

insert into imports (tracking_number, client_id, origin_country, origin_city, destination_port, incoterm, type, produit, prix_fob, prix_fret, prix_assurance, status, progress, current_location, eta)
select 'IMP-2026-004582', id, 'Japon', 'Yokohama', 'Matadi', 'FOB', 'vehicule', 'Toyota RAV4 2022', 8500, 1530, 128, 'en_transit', 62, 'Océan Indien', '2026-10-14' from clients where whatsapp = '+243810000001'
union all
select 'IMP-2026-003921', id, 'Chine', 'Shenzhen', 'Matadi', 'FOB', 'marchandise', '15 cartons électroniques', 3200, 890, 48, 'arrive_port', 87, 'Port de Matadi', '2026-09-15' from clients where whatsapp = '+243822000002'
union all
select 'IMP-2026-005103', id, 'Chine', 'Guangzhou', 'Matadi', 'EXW', 'marchandise', 'Vêtements (3 ballots)', 1400, 520, 21, 'preparation_expedition', 34, 'Guangzhou', '2026-11-02' from clients where whatsapp = '+243899000003'
union all
select 'IMP-2026-002845', id, 'Japon', 'Nagoya', 'Matadi', 'CIF', 'vehicule', 'Honda CR-V 2021', 9200, 0, 0, 'dedouanement', 93, 'Matadi - SEGUCE', '2026-09-16' from clients where whatsapp = '+243815000004'
union all
select 'IMP-2026-005977', id, 'Dubaï', 'Jebel Ali', 'Matadi', 'FOB', 'conteneur', 'Conteneur 40ft pièces auto', 12400, 2100, 186, 'livre', 100, 'Kinshasa - Limete', '2026-08-28' from clients where whatsapp = '+243840000005'
on conflict (tracking_number) do nothing;

insert into import_events (import_id, status, title, description, photo_url, video_url)
select i.id, 'commande_enregistree', 'Commande enregistrée', 'Dossier MTH ouvert. Conseiller attribué.', null, null
from imports i where i.tracking_number = 'IMP-2026-004582'
union all
select i.id, 'recu_agence', 'Reçu agence Yokohama', 'Véhicule inspecté, photos jointes.', 'https://SUPABASE_URL/storage/v1/object/public/preuves/demo/rav4-inspection.jpg', null
from imports i where i.tracking_number = 'IMP-2026-004582'
union all
select i.id, 'conteneur_charge', 'Conteneur scellé', 'Conteneur MSKU 882134-3 scellé, preuve vidéo.', null, 'https://SUPABASE_URL/storage/v1/object/public/preuves/demo/rav4-scan.mp4'
from imports i where i.tracking_number = 'IMP-2026-004582'
union all
select i.id, 'en_transit', 'Navire en mer', 'Départ Yokohama 8 sept. ETA Matadi 14 oct.', null, null
from imports i where i.tracking_number = 'IMP-2026-004582'
union all
select i.id, 'arrive_port', 'Arrivée au port de Matadi', 'Attente RDV dédouanement SYDONIA.', null, null
from imports i where i.tracking_number = 'IMP-2026-003921';

insert into payments (import_id, label, montant_usd, statut, methode)
select id, 'Fret maritime', 1530, 'paye', 'm-pesa' from imports where tracking_number = 'IMP-2026-004582'
union all
select id, 'Frais fixes Matadi', 1100, 'en_attente', 'orange_money' from imports where tracking_number = 'IMP-2026-004582'
union all
select id, 'Transport Matadi → Kinshasa', 450, 'a_payer', 'airtel_money' from imports where tracking_number = 'IMP-2026-004582';
