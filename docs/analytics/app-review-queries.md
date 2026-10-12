# 앱 만족도 응답 조회 가이드 (Supabase)

재방문 시 뜨는 앱 만족도 팝업(별점 1~5 + 선택 메시지)의 응답은 Supabase `app_reviews` 테이블에 저장됩니다.
메시지 본문은 분석 도구(Mixpanel, Amplitude)로 보내지 않으므로, 본문을 읽으려면 Supabase에서 조회합니다.
별점 분포·응답률 같은 집계는 Mixpanel/Amplitude에서도 볼 수 있습니다 (`mixpanel-dashboard.md` 3장, 9장).

## 테이블 구조

`supabase/migrations/0002_app_reviews.sql` 기준입니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 응답 ID |
| `user_id` | uuid | 익명 로그인 사용자 ID (이름·이메일 아님) |
| `rating` | smallint | 별점 1~5 |
| `message` | text | 남긴 메시지. 없으면 `null` (최대 200자) |
| `entry_count` | integer | 응답 시점의 출발 기록 수 |
| `created_at` | timestamptz | 응답 시각 (UTC 저장) |

## 조회하는 곳과 권한

1. Supabase 프로젝트 화면 왼쪽 메뉴의 **SQL Editor**를 엽니다.
2. 아래 쿼리를 붙여 넣고 실행합니다.
3. 결과 표 오른쪽 위의 CSV 내보내기로 파일로 저장할 수 있습니다.

- 테이블에는 RLS가 켜져 있어 앱(anon key)에서는 **본인 응답만** 읽을 수 있습니다.
- SQL Editor는 관리자 권한으로 실행되므로 전체 응답이 조회됩니다. (프로젝트 설정에 따라 다를 수 있으니, 행이 비어 있으면 권한 설정을 확인하세요.)
- 이 쿼리들은 읽기 전용(`select`)입니다. 데이터를 바꾸지 않습니다.

## 테스트 응답 제외

`app_reviews`에는 `utm`이나 참가자 코드가 없어서 **시각으로** 테스트를 제외합니다.
아래 쿼리의 `2026-10-13`을 실제 게시일(KST)로 바꿔 사용하세요.

## 쿼리 모음

### 1. 최근 응답 보기 (메시지 포함)

```sql
select
  created_at at time zone 'Asia/Seoul' as 응답시각_kst,
  rating                                as 별점,
  entry_count                           as 출발기록수,
  message                               as 메시지
from public.app_reviews
where created_at >= timestamptz '2026-10-13 00:00:00+09'
order by created_at desc
limit 50;
```

### 2. 별점 분포

```sql
select
  rating                                              as 별점,
  count(*)                                            as 건수,
  round(100.0 * count(*) / sum(count(*)) over (), 1)  as 비율_퍼센트
from public.app_reviews
where created_at >= timestamptz '2026-10-13 00:00:00+09'
group by rating
order by rating desc;
```

### 3. 건수·평균 별점·메시지 작성률 (판단 보류 기준: 20건)

```sql
select
  count(*)                                                      as 응답수,
  round(avg(rating)::numeric, 2)                                as 평균_별점,
  count(*) filter (where message is not null)                   as 메시지_작성수,
  round(100.0 * count(*) filter (where message is not null)
        / nullif(count(*), 0), 1)                               as 메시지_작성률_퍼센트,
  case when count(*) < 20 then '판단 보류(20건 미만)' else '판단 가능' end as 표본_판정
from public.app_reviews
where created_at >= timestamptz '2026-10-13 00:00:00+09';
```

### 4. 저점수(1~3점) 사유 모아 보기

```sql
select
  created_at at time zone 'Asia/Seoul' as 응답시각_kst,
  rating                                as 별점,
  message                               as 메시지
from public.app_reviews
where rating <= 3
  and message is not null
  and created_at >= timestamptz '2026-10-13 00:00:00+09'
order by rating asc, created_at desc;
```

### 5. 일별 응답 수와 평균 별점

```sql
select
  (created_at at time zone 'Asia/Seoul')::date as 날짜_kst,
  count(*)                                      as 응답수,
  round(avg(rating)::numeric, 2)                as 평균_별점
from public.app_reviews
where created_at >= timestamptz '2026-10-13 00:00:00+09'
group by 1
order by 1;
```

### 6. 사용 경험(출발 기록 수)별 평균 별점

많이 써 본 사용자가 더 만족하는지 확인합니다.

```sql
select
  case
    when entry_count <= 1 then '1건'
    when entry_count <= 3 then '2~3건'
    else '4건 이상'
  end                              as 출발기록_구간,
  count(*)                         as 응답수,
  round(avg(rating)::numeric, 2)   as 평균_별점
from public.app_reviews
where created_at >= timestamptz '2026-10-13 00:00:00+09'
group by 1
order by min(entry_count);
```

### 7. 재응답 사용자 수

한 사용자가 여러 번 남길 수 있으므로, 같은 사람이 몇 번 응답했는지 봅니다. (사용자 ID는 노출하지 않고 숫자만 봅니다.)

```sql
select
  응답횟수,
  count(*) as 사용자수
from (
  select user_id, count(*) as 응답횟수
  from public.app_reviews
  where created_at >= timestamptz '2026-10-13 00:00:00+09'
  group by user_id
) t
group by 응답횟수
order by 응답횟수;
```

## 읽을 때 주의

| 주의 | 설명 |
|---|---|
| 생존자 편향 | 재방문자에게만 묻기 때문에 첫 방문에서 떠난 사용자의 불만은 없습니다. |
| 낮은 응답률 | 닫을 수 있어 표본이 작습니다. 평균보다 분포와 메시지를 보세요. |
| 개인정보 | 메시지는 자유 입력이라 연락처 등이 있을 수 있습니다. 외부에 공유할 때는 마스킹하세요. |
| 시각 | `created_at`은 UTC로 저장됩니다. 위 쿼리는 `Asia/Seoul`(KST)로 변환합니다. |
