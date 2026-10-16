-- 운동 후 입력한 실제 이동 거리(km)와 실제 착용 복장 저장

alter table public.history_entries
  add column distance_km numeric check (distance_km is null or distance_km > 0),
  add column actual_outfit text check (actual_outfit is null or char_length(actual_outfit) <= 100);
