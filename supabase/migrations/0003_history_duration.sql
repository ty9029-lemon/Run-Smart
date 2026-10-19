-- 활동 종료 버튼을 눌렀을 때 저장하는 활동 시간(초). 종료하지 않은 기록은 null.

alter table public.history_entries
  add column duration_sec integer check (duration_sec is null or duration_sec >= 0);
