# UT 종료 후 PR 머지 순서

UT 도중에는 화면과 지표가 바뀌지 않도록 개선안 PR을 머지하지 않고 쌓아 두었다. UT가 끝난 뒤 아래 순서대로 머지한다.
머지가 곧 운영 배포이므로 **한 번에 하나씩** 머지하고, 매번 CI(린트·테스트·빌드)와 홈 화면을 확인한 뒤 다음 PR로 넘어간다.

- 작성일: 2026-10-15
- 기준: `main` `7d13037` (PR #59 머지 시점)
- 머지 예상: UT 종료 후 (2026-10-17 ~ 10-18경, 확정 아님)
- 머지는 직접 `gh pr merge`/GitHub 화면에서 한다. 각 머지 시각은 분석 보드에 기록해 둔다.

## 1. 머지 순서 한눈에 보기

| 순서 | PR | 브랜치 | 내용 | 충돌 | 머지 전 필수 조치 |
|---|---|---|---|---|---|
| 1 | #61 | `fix/toast-contrast` | 출발 토스트 컨테이너를 흰색으로 변경 | 없음 | - |
| 2 | #63 | `fix/home-score-unit` | 홈 점수 `/ 100` → `/ 100점` | 없음 | - |
| 3 | #66 | `fix/outfit-cold-shorts` | 복장 경계 특성화 테스트 추가(동작 변화 없음) | 없음 | - |
| 4 | #67 | `feat/running-score-tiers` | 러닝 점수 5단계 헤드라인 + AI 가이드 `scoreTier` | 없음 | `api/` 서버리스 함수가 함께 배포되는지 확인 |
| 5 | #60 | `feat/bottom-tab-bar` | 홈/기록/설정 하단 탭바 | 없음 | 실기기 iOS 하단 여백 확인 |
| 6 | #62 | `feat/activity-timer` | 활동 타이머, 종료 확인 팝업, 종료 직후 피드백 시트 | `DepartureToast.tsx` 1곳 | **Supabase 마이그레이션 먼저 적용** |
| 7 | #64 | `feat/hourly-discoverability` | 점수 아래 추천 시간대 한 줄 요약 | `messages.ts`, `messages.test.ts` | - |
| 8 | #65 | `fix/previous-departure-notice` | 재출발 가능 시점의 이전 출발 기록 안내 | `HomeReady.tsx`, `messages.test.ts` | #62 머지 완료 |
| 9 | #68 | `feat/history-activity-info` | 기록 화면: 진행 중 표시·활동 시간·체감 남기기 | 없음 | #62 머지 완료 |

### 순서를 이렇게 정한 이유
- **충돌이 없는 작은 PR을 먼저** 머지해 위험을 줄이고, 변경이 큰 #62를 중간에 둔다.
- **#60보다 #62를 뒤에** 둔다. 두 PR이 `DepartureToast.tsx`의 같은 줄(토스트 위치)을 바꾸는데, #62의 방식(버튼 기준 배치)이 탭바 높이와 무관하게 동작하므로 #62 쪽을 채택한다.
- **#65, #68은 #62 위에 쌓은 PR**이라 반드시 #62 이후에 머지한다(base가 `feat/activity-timer`).
- **#64는 #62 이후**에 머지한다. 둘 다 `messages.ts`에 함수를 추가해 충돌하므로, #62를 먼저 넣고 #64의 충돌을 해결하는 편이 쉽다.

## 2. 머지 전 사전 조치

### 2-1. Supabase 마이그레이션 (#62 머지 전, 필수)
`supabase/migrations/0003_history_duration.sql`을 먼저 적용한다.

```sql
alter table public.history_entries
  add column duration_sec integer check (duration_sec is null or duration_sec >= 0);
```

- 적용 전에 #62를 머지하면 **클라우드 동기화 저장(upsert)만 실패**한다. 로컬 저장은 정상이다.
- 적용은 직접 한다(운영 DB 변경). 적용 후 컬럼이 생겼는지 확인한다.

### 2-2. 상태 재확인
- `main`이 `7d13037`에서 움직였다면, 각 PR이 여전히 `MERGEABLE`인지 확인하고 충돌 해결 가이드(4장)를 다시 맞춰 본다.
- 모든 PR의 CI가 통과 상태인지 확인한다.

## 3. 단계별 확인 사항

각 머지 직후 `main`에서 `npm run lint`, `npm run test`, `npm run build`와 홈 화면 확인을 한다.

| PR | 머지 후 확인할 것 |
|---|---|
| #61 | 출발 후 토스트가 흰색으로 보이고 문구·[실행 취소]가 읽힌다 |
| #63 | 점수 링 하단이 `/ 100점`으로 표시된다 |
| #66 | 테스트만 추가(앱 동작 변화 없음) |
| #67 | 러닝 점수 구간별 헤드라인이 맞다. **배포 후 AI 가이드 문구 품질 확인**(`/api/guide`) |
| #60 | 홈/기록/설정 탭 이동, 활성 탭 표시, 기록·설정에서 홈으로 돌아가기 |
| #62 | 출발 → 타이머 흐름, 종료 확인 팝업(타이머 고정), 종료 후 피드백 시트, 재방문 시 상단 카드, 새로고침 후 타이머 유지 |
| #64 | 점수 링 아래 추천 시간대 한 줄 요약이 보인다 |
| #65 | 종료 30분 뒤(또는 종료 기록 없이 30분 뒤) `오늘 N시에 …출발한 기록이 있어요.` 안내 |
| #68 | 기록 화면의 `진행 중 · 00:21`, `오후 10:07 · 21분`, 체감 남기기 |

## 4. 충돌 해결 가이드

아래는 위 순서대로 머지했을 때 실제로 발생한 충돌과 올바른 해결 결과다.
`git merge-file --union`이나 `-X union` 같은 **자동 병합은 쓰지 않는다**. 충돌 경계가 함수 본문 중간에 걸려 문법이 깨진다(시뮬레이션에서 확인).

### 4-1. #62 머지 시: `src/components/DepartureToast.tsx` (#60과 충돌)
**#62 쪽을 채택**한다. #60의 `bottom-[calc(5.5rem+…)]` 고정 오프셋은 더 이상 필요 없다.

```tsx
<ToastViewport className="absolute bottom-full mb-2 max-w-none px-0" />
```

### 4-2. #64 머지 시: `src/constants/messages.ts`
두 곳이 충돌한다. 양쪽 내용을 **모두** 유지한다.

1. import 영역: #67의 `ScoreTier`와 #64의 `RECOMMEND_MIN_SCORE`를 둘 다 둔다.

```ts
import type { ScoreTier, WarningLevel } from '../types';
import { RECOMMEND_MIN_SCORE } from './thresholds';
```

2. 함수 영역: #62가 추가한 `formatEndedNotice`, `formatTimerButtonLabel`, `formatEndDialogTitle`, `formatEndDialogDescription`과 #64의 `formatRecommendSummary`는 **서로 독립된 함수**다. 충돌 표시가 함수 본문 중간에서 갈리므로, 각 함수가 자기 JSDoc과 닫는 `}`를 갖도록 모두 남긴다(어느 쪽도 지우지 않는다).

### 4-3. #64 머지 시: `src/constants/messages.test.ts`
- import: `formatEndedNotice` 등 #62 항목에 `formatRecommendSummary`를 추가한다.
- 테스트 블록: #62의 `describe`들(`formatEndedNotice`, `formatTimerButtonLabel`, `종료 확인 팝업 문구`)과 #64의 `describe('formatRecommendSummary')`를 모두 남긴다.

### 4-4. #65 머지 시: `src/components/HomeReady.tsx`
import 줄이 충돌한다. 세 함수를 한 줄에 모은다.

```ts
import { formatPreviousDeparture, formatRawWeather, formatRecommendSummary } from '../constants/messages';
```

### 4-5. #65 머지 시: `src/constants/messages.test.ts`
- import: `formatRecommendSummary`와 `formatPreviousDeparture`를 모두 둔다.
- 테스트 블록: `describe('formatRecommendSummary')`(#64)와 `describe('formatPreviousDeparture')`(#65)를 모두 남긴다. 충돌 경계가 `it` 본문 중간이므로 닫는 `);`, `});`, `});`를 각 블록에 맞게 둔다.

### 4-6. 충돌 해결 후
충돌을 푼 뒤 반드시 `npm run lint`, `npx tsc --noEmit`, `npm run test`, `npm run build`를 돌린다.

## 5. PR base 주의 (#65, #68)

#65와 #68은 base가 `feat/activity-timer`다.
- #62가 `main`에 머지되면 GitHub이 이 둘의 base를 `main`으로 바꾼다. **머지 전에 base가 `main`인지 확인**한다.
- #62의 브랜치를 머지 직후 삭제해도 base는 `main`으로 바뀌지만, 삭제 후 #65·#68이 `main` 대상인지 반드시 확인한다.
- base가 `main`으로 바뀌지 않으면 PR 화면에서 base를 `main`으로 직접 바꾼다.

## 6. 분석 지표 영향

머지 후 UT 전후 비교 시 감안한다.

| 구분 | 내용 |
|---|---|
| 새 이벤트 | `activity_ended`(activity, durationSec), `activity_end_dismissed`(activity), `feedback_sheet_dismissed`(activity) |
| 속성 추가 | `feedback_submitted.source` = `sheet` / `card` / `history` |
| 진입 경로 변화 | 기록 진입이 홈 헤더 버튼에서 하단 탭으로 바뀜(`history_opened`는 유지) — #60 |
| 화면 변화 | 홈 헤더라인 5단계(#67), 점수 단위(#63), 추천 시간대 요약(#64), 출발→타이머→종료 흐름(#62) |
| 응답률 | 종료 직후 시트 도입으로 체감 응답률이 오를 수 있음 → `source`로 구분 |

문서 갱신은 각 PR에 포함되어 있다(`docs/analytics/mixpanel-dashboard.md`).

## 7. 롤백

문제가 생기면 **머지의 역순**으로 되돌린다. PR 단위로 revert하면 된다.

- #68 → #65 → #64 → #62 → #60 → #67 → …
- #62를 되돌려도 DB의 `duration_sec` 컬럼은 `null`로 남을 뿐이라 안전하다(컬럼 삭제는 필요 없다).
- 되돌린 뒤 `localStorage`의 `run-smart-active-session` 키는 무시된다(코드가 읽지 않는다).

## 8. 사전 검증 결과 (2026-10-15)

- **병합 시뮬레이션**: 위 순서대로 9개 PR을 임시 worktree에서 실제로 머지하고 충돌을 4장처럼 해결했다.
- **최종 상태 검증**: `npm run lint`, `npx tsc --noEmit`, `npm run test`(440개), `npm run build` 통과.
- **브라우저 스모크(390px)**: 탭바, 점수 단위, 5단계 헤드라인, 추천 시간대 요약, 타이머, 토스트(버튼 위 8px, 흰색), 종료 후 피드백 시트, 기록 화면 활동 시간·체감 선택지, 페이지 오류 없음.
- **한계**: 위 확인은 `main` `7d13037` 기준이다. 그 사이 `main`이 바뀌면 다시 확인한다. 로컬 개발 서버에서는 `/api/guide`가 동작하지 않아 AI 가이드의 `scoreTier` 어조는 배포 후 확인이 필요하다.

## 9. 폐기·정리된 브랜치

| 브랜치 | 사유 |
|---|---|
| `fix/outfit-simplify-items` | 이미 머지된 #59가 같은 변경을 반영해 중복·충돌 |
| `fix/post-departure-clarity` | #62가 역할을 상당 부분 대체해 #65로 축소 재작성 |

## 10. 머지 기록

머지할 때마다 아래 표를 채운다.

| PR | 머지 시각 | 머지한 커밋 | 확인 결과 |
|---|---|---|---|
| #61 | | | |
| #63 | | | |
| #66 | | | |
| #67 | | | |
| #60 | | | |
| #62 | | | |
| #64 | | | |
| #65 | | | |
| #68 | | | |
