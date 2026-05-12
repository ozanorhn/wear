-- Migration v2: Favoriten, Trage-Tagebuch, Try-On
-- Idempotent — du kannst das mehrfach ausführen.

-- 1. Favoriten + zuletzt getragen
alter table public.items
  add column if not exists is_favorite boolean not null default false,
  add column if not exists last_worn_at timestamptz,
  add column if not exists wear_count integer not null default 0;

alter table public.outfits
  add column if not exists is_favorite boolean not null default false,
  add column if not exists last_worn_at timestamptz,
  add column if not exists wear_count integer not null default 0,
  add column if not exists tryon_url text;

-- 2. Wears (Trage-Tagebuch)
create table if not exists public.wears (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid references public.outfits(id) on delete set null,
  item_ids uuid[] not null default '{}',
  worn_at timestamptz not null default now()
);

create index if not exists wears_user_idx on public.wears(user_id);
create index if not exists wears_worn_at_idx on public.wears(worn_at desc);

alter table public.wears enable row level security;

drop policy if exists "wears_select_own" on public.wears;
create policy "wears_select_own" on public.wears
  for select using (auth.uid() = user_id);

drop policy if exists "wears_insert_own" on public.wears;
create policy "wears_insert_own" on public.wears
  for insert with check (auth.uid() = user_id);

drop policy if exists "wears_delete_own" on public.wears;
create policy "wears_delete_own" on public.wears
  for delete using (auth.uid() = user_id);

-- 3. Trigger: wenn ein Wear eingetragen wird, update items + outfit
create or replace function public.handle_new_wear()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.outfit_id is not null then
    update public.outfits
      set last_worn_at = new.worn_at,
          wear_count = wear_count + 1
      where id = new.outfit_id and user_id = new.user_id;
  end if;

  if array_length(new.item_ids, 1) > 0 then
    update public.items
      set last_worn_at = new.worn_at,
          wear_count = wear_count + 1
      where id = any(new.item_ids) and user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_wear on public.wears;
create trigger trg_handle_new_wear
  after insert on public.wears
  for each row execute function public.handle_new_wear();
