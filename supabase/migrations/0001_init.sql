-- 사용자별 기록/프로필 저장 (Supabase 익명 로그인 + RLS)

create table public.history_entries (
  id              text not null,
  user_id         uuid not null default auth.uid() references auth.users on delete cascade,
  date            timestamptz not null,
  activity        text not null,
  decision        text not null,
  weather_summary text not null,
  guide           jsonb not null,
  feels_like      numeric,
  outfit          jsonb,
  feedback        text,
  feedback_at     timestamptz,
  primary key (user_id, id)
);

create table public.profiles (
  user_id       uuid primary key default auth.uid() references auth.users on delete cascade,
  data          jsonb not null,
  has_onboarded boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- RLS: 본인 행만 읽고 쓸 수 있다. anon key는 공개되므로 반드시 켜 둔다.
alter table public.history_entries enable row level security;
alter table public.profiles enable row level security;

create policy "본인 기록만 접근" on public.history_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "본인 프로필만 접근" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
