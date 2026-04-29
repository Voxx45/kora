-- supabase/migrations/002_scanner_tables.sql

create table if not exists scan_queue (
  id          uuid primary key default gen_random_uuid(),
  city        text not null,
  place_type  text not null,
  status      text not null default 'pending'
                check (status in ('pending','running','done','error')),
  error_msg   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists scan_queue_status_id on scan_queue (status, id);

create table if not exists scan_results (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null unique,
  name        text not null,
  city        text not null,
  place_type  text not null,
  score       int not null default 0 check (score >= 0 and score <= 100),
  website     text,
  phone       text,
  address     text,
  gmb_rating  numeric,
  gmb_reviews int,
  has_website boolean not null default false,
  has_https   boolean not null default false,
  promoted    boolean not null default false,
  promoted_at timestamptz,
  scanned_at  timestamptz not null default now()
);

create index if not exists scan_results_score on scan_results (score desc);

create table if not exists scan_status (
  id             int primary key default 1 check (id = 1),
  is_scanning    boolean not null default false,
  current_city   text,
  current_type   text,
  total_scanned  int not null default 0,
  total_results  int not null default 0,
  last_error     text,
  updated_at     timestamptz not null default now()
);

insert into scan_status (id) values (1) on conflict do nothing;

alter table scan_queue   enable row level security;
alter table scan_results enable row level security;
alter table scan_status  enable row level security;

create policy "admin only" on scan_queue   for all using (auth.uid() is not null);
create policy "admin only" on scan_results for all using (auth.uid() is not null);
create policy "admin only" on scan_status  for all using (auth.uid() is not null);
