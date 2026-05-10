-- Run this in the Supabase SQL Editor after creating your project.

-- Items (Kleidungsstücke)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  category text not null,
  color text,
  seasons text[] not null default '{}',
  occasions text[] not null default '{}',
  notes text,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists items_user_idx on public.items(user_id);

alter table public.items enable row level security;

drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert with check (auth.uid() = user_id);

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update using (auth.uid() = user_id);

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete using (auth.uid() = user_id);

-- Outfits (Kombinationen)
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  item_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists outfits_user_idx on public.outfits(user_id);

alter table public.outfits enable row level security;

drop policy if exists "outfits_select_own" on public.outfits;
create policy "outfits_select_own" on public.outfits
  for select using (auth.uid() = user_id);

drop policy if exists "outfits_insert_own" on public.outfits;
create policy "outfits_insert_own" on public.outfits
  for insert with check (auth.uid() = user_id);

drop policy if exists "outfits_update_own" on public.outfits;
create policy "outfits_update_own" on public.outfits
  for update using (auth.uid() = user_id);

drop policy if exists "outfits_delete_own" on public.outfits;
create policy "outfits_delete_own" on public.outfits
  for delete using (auth.uid() = user_id);

-- Storage bucket for clothing photos
insert into storage.buckets (id, name, public)
values ('clothes', 'clothes', true)
on conflict (id) do nothing;

drop policy if exists "clothes_public_read" on storage.objects;
create policy "clothes_public_read" on storage.objects
  for select using (bucket_id = 'clothes');

drop policy if exists "clothes_owner_write" on storage.objects;
create policy "clothes_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'clothes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "clothes_owner_delete" on storage.objects;
create policy "clothes_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'clothes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
