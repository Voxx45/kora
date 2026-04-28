create table prospects (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  source            text not null check (source in ('contact_form','manual','scanner')),
  prenom            text not null,
  email             text not null,
  telephone         text,
  entreprise        text,
  service_interesse text,
  message           text,
  score             int default 50 check (score >= 0 and score <= 100),
  pipeline_stage    text not null default 'nouveau'
                      check (pipeline_stage in ('nouveau','contacte','devis_envoye','negocia','gagne','perdu')),
  valeur_estimee    numeric(10,2),
  next_followup_at  timestamptz,
  notes             text,
  updated_at        timestamptz default now()
);

alter table prospects enable row level security;
create policy "admin only" on prospects using (auth.uid() is not null);

create table projects (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  prospect_id  uuid references prospects(id) on delete set null,
  client_nom   text not null,
  service      text not null,
  montant      numeric(10,2),
  statut       text not null default 'en_cours'
                 check (statut in ('en_cours','livre','facture')),
  deadline     date,
  notes        text,
  updated_at   timestamptz default now()
);

alter table projects enable row level security;
create policy "admin only" on projects using (auth.uid() is not null);

create table global_notes (
  id         uuid primary key default gen_random_uuid(),
  content    text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table global_notes enable row level security;
create policy "admin only" on global_notes using (auth.uid() is not null);
