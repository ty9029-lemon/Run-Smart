# Mixpanel 대시보드 구성 가이드

Run-Smart에서 수집 중인 이벤트를 한눈에 보기 위한 Mixpanel 보드(Board) 구성 방법입니다.
Mixpanel 화면에서 직접 만들며, 별도 코드 변경은 필요하지 않습니다.

- 보드 이름: **Run-Smart 개요**
- 구성: 사용량 / 온보딩 퍼널 / 가기·안 가기 결정 / 설정 민감도 분포 (총 4개 섹션)
- 운영 도메인: `runners-fit.vercel.app`

> 이벤트는 Amplitude와 Mixpanel 양쪽으로 전송됩니다. 이 문서는 Mixpanel 기준입니다.

---

## 1. 이벤트 사전

코드 기준 위치는 `src/lib/analytics.ts`(`ANALYTICS_EVENTS`)와 `src/constants/analytics.ts`(`CTA_IDS`)입니다.

| 이벤트 | 발생 시점 | 속성 |
|---|---|---|
| `[Auto] Page View` (`$mp_web_page_view`) | 페이지 경로가 바뀔 때 (자동 수집) | Mixpanel 기본 속성 (`$current_url` 등) |
| `cta_clicked` | 핵심 버튼 클릭 | `cta`: `onboarding_start` / `location_allow` / `location_settings` / `settings_save` |
| `onboarding_completed` | 온보딩 완료 | `activityCount`, `constraintCount` |
| `settings_saved` | 설정 저장 성공 | `coldLevel`, `heatLevel`, `activityCount`, `constraintCount` |
| `decision_made` | 가기 / 안 가기 선택 | `decision`(`go`/`skip`), `activity`, `score` |
| `decision_cancelled` | 오늘 결정 취소 | `decision`(취소한 결정), `activity` |
| `run_score_viewed` | 활동·점수가 바뀌어 결과가 보일 때 | `activity`, `score`, `warningLevel`, `condition` |
| `activity_changed` | 활동 칩 변경 | `from`, `to` |
| `feedback_submitted` | 운동 후 체감 피드백 제출 | `feedback`(`cold`/`good`/`hot`), `activity`, `feelsLike` |
| `history_opened` | 기록 화면 진입 | - |
| `history_entry_viewed` | 기록 항목 열람 | `daysAgo`, `decision`, `activity` |
| `hourly_forecast_scrolled` | 시간대별 예보 스크롤 | `maxHour` |
| `data_load_failed` | 날씨·가이드 로딩 실패 | `reason` 등 |

속성 이름은 camelCase이며, 위치·좌표 같은 개인정보는 수집하지 않습니다.

---

## 2. 보드 만들기

1. Mixpanel 왼쪽 위 **Create New → Board**를 선택합니다.
2. 이름을 `Run-Smart 개요`로 정합니다.
3. 아래 리포트를 하나씩 만들어 보드에 추가합니다. (리포트 화면 오른쪽 위 **Add to Board**)
4. 보드 전체 필터를 설정합니다. 아래 "4. 운영 데이터만 보기"를 참고하세요.

### A. 사용량

| 리포트 | 유형 | 설정 |
|---|---|---|
| 일별 방문자 | Insights | 이벤트 `[Auto] Page View`, 지표 **Uniques**, 기간 30D, 차트 Line |
| 페이지별 조회수 | Insights | 이벤트 `[Auto] Page View`, 지표 **Total**, Breakdown `$current_url`(경로), 차트 Bar |
| 주간 재방문 | Retention | 시작·복귀 이벤트 모두 `[Auto] Page View`, 주 단위(Weekly) |

### B. 온보딩 퍼널

| 리포트 | 유형 | 설정 |
|---|---|---|
| 온보딩 전환 | Funnels | 1단계 `[Auto] Page View` → 2단계 `cta_clicked`(필터 `cta` = `onboarding_start`) → 3단계 `onboarding_completed`, 전환 창 1일 |

한계: 온보딩 중간 단계(다음 버튼)는 이벤트가 없어 단계별 이탈은 볼 수 없습니다.
필요하면 단계 이벤트(`onboarding_step_viewed` 등) 추가를 별도로 진행합니다.

### C. 가기 / 안 가기 결정

| 리포트 | 유형 | 설정 |
|---|---|---|
| 결정 비율 | Insights | 이벤트 `decision_made`, 지표 **Total**, Breakdown `decision`, 차트 Bar |
| 활동별 결정 | Insights | `decision_made`, Breakdown `activity`, 두 번째 Breakdown `decision` |
| 점수 구간별 결정 | Insights | `decision_made`, Breakdown `score`(숫자 구간으로 묶기), 두 번째 Breakdown `decision` |
| 취소 비율 | Insights (Formula) | `A = decision_cancelled`, `B = decision_made`, 수식 `A / B` |

### D. 설정 민감도 분포

| 리포트 | 유형 | 설정 |
|---|---|---|
| 추위 민감도 분포 | Insights | 이벤트 `settings_saved`, 지표 **Total**, Breakdown `coldLevel`, 차트 Bar |
| 더위 민감도 분포 | Insights | 이벤트 `settings_saved`, 지표 **Total**, Breakdown `heatLevel`, 차트 Bar |
| 저장 횟수 추이 | Insights | 이벤트 `settings_saved`, 지표 **Total**, 기간 30D, 차트 Line |

민감도는 1~5단계(3이 보통)입니다. 숫자 속성이라 Breakdown 시 구간으로 묶이면
**Group by → Individual values**(개별 값)로 바꿔 보세요.

---

## 3. 배치 권장 순서

위에서 아래로 읽는 흐름이 되도록 배치합니다.

1. 일별 방문자 (전체 규모)
2. 온보딩 전환 퍼널 (유입 → 활성화)
3. 결정 비율, 취소 비율 (핵심 행동)
4. 활동별·점수 구간별 결정 (원인 분석)
5. 추위·더위 민감도 분포 (사용자 성향)
6. 주간 재방문 (정착도)

---

## 4. 운영 데이터만 보기

Preview 배포에서 발생한 이벤트도 같은 프로젝트에 쌓입니다. 운영 데이터만 보려면
보드 상단 **Filter**에서 `$current_url`이 `runners-fit.vercel.app`을 **포함(contains)** 하도록 설정하세요.

주의:
- `$current_url`은 페이지뷰 외 이벤트에도 기본 속성으로 붙어 있어야 필터가 적용됩니다.
  일부 이벤트에서 필터 후 데이터가 사라지면, 해당 이벤트에는 URL 속성이 없는 것이므로
  그 리포트는 보드 필터 대신 리포트 개별 설정으로 확인하세요.
- 수집은 배포 이후부터 시작됩니다. 그 이전 데이터는 없습니다.

---

## 5. 공유와 구독

- **공유**: 보드 오른쪽 위 **Share**에서 링크를 복사하거나 프로젝트 멤버를 초대합니다.
- **정기 확인**: 보드 오른쪽 위 **Subscribe**(또는 알림 아이콘)에서 주간 이메일 구독을 설정할 수 있습니다.

메뉴 이름은 Mixpanel 버전에 따라 다를 수 있습니다.

---

## 6. 검증 체크리스트

보드를 만든 뒤 아래를 확인합니다.

- [ ] 일별 방문자 수가 **Data → Events**의 `[Auto] Page View` 건수와 같은 흐름인지
- [ ] `decision_made`의 `go` + `skip` 합이 Events 화면의 `decision_made` 건수와 같은지
- [ ] 취소 비율이 0~100% 범위인지
- [ ] `settings_saved`의 `coldLevel`·`heatLevel` 값이 1~5 안에 있는지
- [ ] 운영 도메인 필터 적용 시 데이터가 사라지지 않는지
