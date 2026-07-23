-- PortfolioForge: 生成履歴テーブル
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null,
  industry text,
  strengths text,
  target text,
  output_md text not null,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

drop policy if exists "own select" on public.generations;
create policy "own select" on public.generations
  for select using (auth.uid() = user_id);

drop policy if exists "own insert" on public.generations;
create policy "own insert" on public.generations
  for insert with check (auth.uid() = user_id);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);
