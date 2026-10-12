# Mixpanel 대시보드 구성 가이드

Run-Smart에서 수집 중인 이벤트를 한눈에 보기 위한 Mixpanel 보드(Board) 구성 방법입니다.
Mixpanel 화면에서 직접 만들며, 별도 코드 변경은 필요하지 않습니다.

- 보드 이름: **Run-Smart**
- 구성: 사용량 / 온보딩 퍼널 / 가기·안 가기 결정 / 설정 민감도 분포
- 운영 도메인: `runners-fit.vercel.app`
- 요금제: 무료 플랜 (저장 리포트 **사용자당 5개** 제한, 아래 "2. 현재 보드 구성" 참고)

> 이벤트는 Amplitude와 Mixpanel 양쪽으로 전송됩니다. 이 문서는 Mixpanel 기준입니다.

---

## 1. 이벤트 사전

코드 기준 위치는 `src/lib/analytics.ts`(`ANALYTICS_EVENTS`)와 `src/constants/analytics.ts`(`CTA_IDS`)입니다.

| 이벤트 | 발생 시점 | 속성 |
|---|---|---|
| `[Auto] Page View` (`$mp_web_page_view`) | 페이지 경로가 바뀔 때 (자동 수집) | Mixpanel 기본 속성 (`$current_url` 등) |
| `cta_clicked` | 핵심 버튼 클릭 | `cta`: `onboarding_start` / `location_allow` / `location_settings` / `settings_save` (`location_allow`는 아래 주석 참고) |
| `onboarding_completed` | 온보딩 완료 | `activityCount`, `constraintCount`, `useCurrentLocation` |
| `settings_saved` | 설정 저장 성공 | `coldLevel`, `heatLevel`, `activityCount`, `constraintCount` |
| `decision_made` | 가기 선택 (홈의 '안 가기' 버튼 제거 후 `skip`은 새로 발생하지 않고 Mixpanel의 과거 데이터에만 남음) | `decision`(`go`), `activity`, `score`, `isChange`(오늘 같은 활동으로 이미 결정한 적이 있으면 `true`) |
| `decision_cancelled` | 출발 토스트의 '실행 취소' 또는 홈의 '출발 취소'로 오늘 결정을 취소 | `decision`(취소한 결정), `activity` |
| `run_score_viewed` | 활동·점수가 바뀌어 결과가 보일 때 | `activity`, `score`, `warningLevel`, `condition` |
| `activity_changed` | 활동 칩 변경 | `from`, `to` |
| `feedback_submitted` | 운동 후 체감 피드백 제출 | `feedback`(`cold`/`good`/`hot`), `activity`, `feelsLike` |
| `history_opened` | 기록 화면 진입 | - |
| `history_entry_viewed` | 기록 항목 열람 | `daysAgo`, `decision`, `activity` |
| `outfit_viewed` | 복장 패널이 50% 이상 1초 이상 화면에 보였을 때 (마운트당 1회, 2026-10-12 추가) | `source`(`home`/`history`), `activity`, `itemCount` |
| `hourly_forecast_scrolled` | 시간대별 예보 스크롤 | `maxHour` |
| `data_load_failed` | 날씨·가이드 로딩 실패 | `reason` 등 |

속성 이름은 camelCase이며, 위치·좌표 같은 개인정보는 수집하지 않습니다.
`useCurrentLocation`은 "현재 위치로 날씨 보기" 선호(true/false)일 뿐 좌표가 아닙니다.

### UT 참가자 코드 (`participantId`)

UT 참가자별로 이벤트를 구분하기 위해, URL에 참가자 코드를 붙여 접속하게 합니다.

```
https://runners-fit.vercel.app/?pid=P01
```

- 코드는 Mixpanel에서는 **모든 이벤트의 `participantId` 속성**(super property)으로,
  Amplitude에서는 **사용자 속성 `participantId`** 로 저장됩니다. 사용자 ID는 바꾸지 않습니다.
- 한 번 접속하면 브라우저에 저장되어, 이후 `?pid=` 없이 들어와도 같은 코드로 기록됩니다.
  다른 코드로 접속하면 새 코드로 덮어씁니다.
- 영문·숫자·`-`·`_`, 최대 32자만 허용합니다. 이름·이메일 같은 개인정보는 코드로 쓰지 마세요.
  (`P01`, `ut-02` 형태 권장. 허용 형식이 아니면 무시됩니다.)
- 참가자별로 보려면 Mixpanel은 `participantId`로 Breakdown/Filter,
  Amplitude는 User Lookup 또는 `participantId`로 세그먼트를 만듭니다.
- 참가자 코드와 실제 사람의 대응표는 이 저장소 밖(UT 운영 문서)에서 별도로 관리하세요.
- 2026-10-12 이후 발생한 이벤트부터 붙습니다.

### `location_allow` 발생 시점 변경 (2026-10-11 배포)

| 시기 | 발생 시점 |
|---|---|
| 변경 전 | 온보딩의 [위치 허용하기] 버튼 클릭 |
| 변경 후 | 온보딩 [시작하기]를 눌렀을 때 현재 위치 사용이 켜져 있을 때, 또는 설정에서 현재 위치 사용을 OFF → ON으로 바꿀 때 |

배포 전후 수치를 직접 비교하지 마세요. 의미가 달라졌습니다.

---

## 2. 현재 보드 구성 (운영 중)

무료 플랜의 저장 한도(5개)에 맞춰 아래 5개 리포트를 `Run-Smart` 보드에 저장해 두었습니다.

| # | 위젯 | 유형 | 설정 |
|---|---|---|---|
| 1 | 일별 방문자 | Insights | 이벤트 `[Auto] Page View`, 지표 **Uniques**, 기간 30D, 차트 Line |
| 2 | 온보딩 전환 | Funnels | 1단계 `[Auto] Page View` → 2단계 `cta_clicked`(`cta` is `onboarding_start`) → 3단계 `onboarding_completed`, 전환 창 1일 |
| 3 | 가기 / 안 가기 비율 (홈 '안 가기' 제거로 새 `skip`이 없어 과거 데이터 비교용) | Insights | 이벤트 `decision_made`, 지표 **Total Events**, 필터 `isChange` is `false`, Breakdown `decision`, 차트 Pie |
| 4 | 추위 민감도 분포 | Insights | 이벤트 `settings_saved`, 지표 **Total Events**, Breakdown `coldLevel`, 차트 Bar |
| 5 | 더위 민감도 분포 | Insights | 이벤트 `settings_saved`, 지표 **Total Events**, Breakdown `heatLevel`, 차트 Bar |

한계:
- 온보딩 중간 단계(다음 버튼)는 이벤트가 없어 단계별 이탈은 볼 수 없습니다.
  필요하면 단계 이벤트(`onboarding_step_viewed` 등) 추가를 별도로 진행합니다.
- 민감도는 1~5단계(3이 보통)입니다. 숫자 속성이라 Breakdown 시 구간으로 묶이면
  **Group by → Individual values**(개별 값)로 바꿔 보세요.

### 보드 새로 만들기

1. Mixpanel 왼쪽 위 **Create New → Board**를 선택합니다.
2. 이름을 `Run-Smart`로 정합니다.
3. 위 표의 리포트를 하나씩 만들어 보드에 추가합니다. (리포트 화면 오른쪽 위 **Save**에서 보드 선택)

---

## 3. 저장 한도를 넘는 추가 분석

무료 플랜은 저장 리포트가 5개까지입니다. 아래 리포트는 저장하지 않고 **Insights에서 일회성으로 조회**하세요.
(저장하려면 기존 리포트를 지우거나 요금제를 올려야 합니다.)

| 분석 | 유형 | 설정 |
|---|---|---|
| 페이지별 조회수 | Insights | 이벤트 `[Auto] Page View`, 지표 **Total Events**, Breakdown `$current_url`, 차트 Bar |
| 주간 재방문 | Retention | 시작·복귀 이벤트 모두 `[Auto] Page View`, 주 단위(Weekly) |
| 활동별 결정 | Insights | `decision_made`, Breakdown `activity`, 두 번째 Breakdown `decision` |
| 점수 구간별 결정 | Insights | `decision_made`, Breakdown `score`(숫자 구간으로 묶기), 두 번째 Breakdown `decision` |
| 취소 비율 | Insights (Formula) | `A = decision_cancelled`, `B = decision_made`, 수식 `A / B` |
| 설정 저장 추이 | Insights | 이벤트 `settings_saved`, 지표 **Total Events**, 기간 30D, 차트 Line |
| 온보딩 시 현재 위치 사용 비율 | Insights | 이벤트 `onboarding_completed`, 지표 **Total Events**, Breakdown `useCurrentLocation`, 차트 Pie |

---

## 4. 배치 권장 순서

위에서 아래로 읽는 흐름이 되도록 배치합니다.

1. 일별 방문자 (전체 규모)
2. 온보딩 전환 퍼널 (유입 → 활성화)
3. 가기 / 안 가기 비율 (핵심 행동)
4. 추위·더위 민감도 분포 (사용자 성향)

---

## 5. 운영 데이터만 보기

Preview 배포에서 발생한 이벤트도 같은 프로젝트에 쌓입니다. 운영 데이터만 보려면
보드 상단 **Filter**에서 `$current_url`이 `runners-fit.vercel.app`을 **포함(contains)** 하도록 설정하세요.

주의:
- `$current_url`은 Mixpanel 브라우저 SDK가 모든 이벤트에 붙이는 기본 속성입니다.
  필터 후 일부 리포트의 데이터가 사라지면 그 리포트는 보드 필터 대신 리포트 개별 설정으로 확인하세요.
- 수집은 배포 이후부터 시작됩니다. 그 이전 데이터는 없습니다.

### `isChange` 필터 (가기 / 안 가기)

가기 → 취소 → 안 가기처럼 하루에 결정을 바꿔도 이벤트는 누른 횟수만큼 쌓입니다.
하루 **최초 결정**만 집계하려면 `decision_made`에 필터 `isChange` is `false`를 겁니다.
바꾼 결정만 보려면 값을 `true`로 바꿉니다.

- `isChange`는 배포 이후 발생한 이벤트부터 붙습니다. 이전 이벤트는 필터에서 제외됩니다.
- 이력은 기기·브라우저 단위(`localStorage`)로 관리되어, 다른 기기에서는 각각 첫 결정으로 기록됩니다.

---

## 6. 자주 겪는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 이벤트 선택 목록에 `All Events`만 보임, Lexicon에 우리 이벤트가 없음 | 새 이벤트가 카탈로그(Lexicon)에 올라오는 데 시간이 걸림 (데이터 수집은 정상) | 이벤트 이름을 직접 입력해 지정. Events 화면(실시간 목록)에서 수신 확인 |
| 리포트에서 `Page View`를 찾았는데 데이터가 없음 | 페이지뷰의 실제 이름은 `$mp_web_page_view`(표시명 `[Auto] Page View`) | 표시명 `[Auto] Page View`를 선택하거나 `$mp_web_page_view`를 직접 입력 |
| 보드 위젯이 "데이터 없음"인데 편집 화면에서는 보임 | 저장된 쿼리가 아직 갱신되지 않음 | 위젯을 열어 **Save**로 덮어쓰기, 보드에서 기간 `30D` 선택 후 새로고침 |
| Insights 지표에 `isChange`를 넣었더니 조건 선택이 안 나옴 | `isChange`를 지표(Metric)에 넣음 | Metric이 아니라 **Filter**의 `+`로 추가 |
| 필터의 속성 이름이 `is`로 표시됨 | 조건 이름을 속성 칸에 잘못 선택 | 속성을 `cta`처럼 올바른 속성으로 다시 선택 |
| 저장 시 "Saved Report Limit" 안내 | 무료 플랜 5개 한도 도달 | **Continue With Free Plan**을 선택하고 쓰지 않는 리포트·보드를 삭제 |
| `location_allow` 수치가 배포 전후로 크게 달라 보임 | 2026-10-11부터 발생 시점이 바뀜 ([위치 허용하기] 클릭 → [시작하기]/설정 ON 전환) | 배포일 이후 데이터만 비교하고, 이전 수치와 직접 비교하지 않기 |
| `onboarding_completed`에 `useCurrentLocation`이 없는 이벤트가 보임 | 속성은 2026-10-11 배포 이후 이벤트부터 붙음 | 기간을 배포일 이후로 좁혀 확인 |
| Mixpanel Agent가 만든 보드의 위젯이 비어 있음 | 에이전트 초안의 쿼리가 완성되지 않음 | Events 또는 Insights에서 직접 만들어 보드에 추가 |

---

## 7. 공유와 구독

- **공유**: 보드 오른쪽 위 **Share**에서 링크를 복사하거나 프로젝트 멤버를 초대합니다.
- **정기 확인**: 보드 오른쪽 위 **Subscribe**에서 이메일 구독을 설정할 수 있습니다.

메뉴 이름은 Mixpanel 버전에 따라 다를 수 있습니다.

---

## 8. 검증 체크리스트

- [ ] 일별 방문자 수가 **Data → Events**의 `[Auto] Page View` 흐름과 맞는지
- [ ] `decision_made` 건수가 Events 화면의 `isChange=false` 건수와 같은지 (과거 `skip` 포함)
- [ ] `settings_saved`의 `coldLevel`·`heatLevel` 값이 1~5 안에 있는지
- [ ] 온보딩 전환 퍼널의 1단계 숫자가 일별 방문자 합계와 비슷한 규모인지
- [ ] 운영 도메인 필터 적용 시 데이터가 사라지지 않는지
