-- 앱 만족도(별점 + 메시지) 저장. 한 사용자가 여러 번 남길 수 있다.

create table public.app_reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  message     text check (message is null or char_length(message) <= 200),
  entry_count integer not null default 0,
  created_at  timestamptz not null default now()
);

-- RLS: 본인 행만 넣고 읽을 수 있다. anon key는 공개되므로 반드시 켜 둔다.
alter table public.app_reviews enable row level security;

create policy "본인 만족도만 작성" on public.app_reviews
  for insert with check (user_id = auth.uid());

create policy "본인 만족도만 조회" on public.app_reviews
  for select using (user_id = auth.uid());
