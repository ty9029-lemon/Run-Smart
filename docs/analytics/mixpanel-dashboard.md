# Mixpanel 대시보드 구성 가이드

Run-Smart에서 수집 중인 이벤트를 한눈에 보기 위한 Mixpanel 보드(Board) 구성 방법입니다.
Mixpanel 화면에서 직접 만들며, 별도 코드 변경은 필요하지 않습니다.

- 보드 이름: **Run-Smart**
- 구성(2026-10-12 UT 개편): 핵심 퍼널 / 결정까지 걸린 시간 / 체감 피드백 / 재방문 리텐션 / 온보딩 전환
- 가설: 유저는 러닝을 할지 말지와 어떻게 입을지 한눈에 파악하고, 앱에 만족하며, 재방문한다.
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
| `onboarding_completed` | 온보딩 완료 | `activityCount`, `timeSlotCount`, `constraintCount`, `useCurrentLocation` |
| `settings_saved` | 설정 저장 성공 | `coldLevel`, `heatLevel`, `activityCount`, `timeSlotCount`, `constraintCount`, `useCurrentLocation` |
| `decision_made` | 가기 선택 (홈의 '안 가기' 버튼 제거 후 `skip`은 새로 발생하지 않고 Mixpanel의 과거 데이터에만 남음) | `decision`(`go`), `activity`, `score`, `isChange`(오늘 같은 활동으로 이미 결정한 적이 있으면 `true`), `timeToDecisionMs`(결과 화면이 준비된 뒤 결정까지 걸린 시간(ms). 재결정(`isChange=true`)에는 붙지 않으며 2026-10-12 추가) |
| `decision_cancelled` | 출발 토스트의 '실행 취소' 또는 홈의 '출발 취소'로 오늘 결정을 취소 | `decision`(취소한 결정), `activity` |
| `activity_ended` | 홈의 타이머 버튼을 누르고 종료 확인 팝업에서 '종료하기'를 눌러 활동을 종료 | `activity`, `durationSec`(활동 시간, 초) |
| `activity_end_dismissed` | 종료 확인 팝업에서 '계속하기'(또는 ESC·바깥 탭)로 종료를 취소 | `activity` |
| `run_score_viewed` | 활동·점수가 바뀌어 결과가 보일 때 | `activity`, `score`, `warningLevel`, `condition` |
| `activity_changed` | 활동 칩 변경 | `from`, `to` |
| `feedback_submitted` | 운동 후 체감 피드백 제출 | `feedback`(`cold`/`good`/`hot`), `activity`, `feelsLike`, `source`(`sheet`: 종료 직후 바텀 시트 / `card`: 홈 상단 카드 / `history`: 기록 화면에서 직접 남김, 시트 도입 이후 추가) |
| `feedback_sheet_dismissed` | 종료 직후 피드백 바텀 시트를 답하지 않고 닫음 (이후 앱 재방문 시 상단 카드가 다시 묻는다) | `activity` |
| `history_opened` | 기록 화면 진입 | - |
| `history_entry_viewed` | 기록 항목 열람 | `daysAgo`, `decision`, `activity` |
| `outfit_viewed` | 복장 패널이 50% 이상 1초 이상 화면에 보였을 때 (마운트당 1회, 2026-10-12 추가) | `source`(`home`/`history`), `activity`, `itemCount` |
| `hourly_forecast_scrolled` | 시간대별 예보 스크롤 | `maxHour` |
| `app_review_shown` | 재방문 시 앱 만족도 팝업이 열렸을 때 | `entryCount`(출발 기록 수) |
| `app_review_submitted` | 별점(과 메시지)을 제출해 저장에 성공했을 때 | `rating`(1~5), `hasMessage`(메시지 작성 여부), `entryCount`. **메시지 본문은 분석 도구로 보내지 않음** |
| `app_review_dismissed` | 팝업을 응답 없이 닫았을 때 | `dismissCount`(누적 닫은 횟수) |
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

### 유입 채널 속성 (`utmSource`, `utmMedium`, `utmCampaign`)

SNS 게시글 링크의 `utm` 파라미터로 어느 채널에서 왔는지 구분합니다.

```
https://runners-fit.vercel.app/?utm_source=threads&utm_campaign=ut1
https://runners-fit.vercel.app/?utm_source=x&utm_campaign=ut1
https://runners-fit.vercel.app/?utm_source=instagram&utm_campaign=ut1
```

- **첫 접속의 값만 유지**합니다 (first-touch). 이후 다른 링크로 들어와도 처음 채널이 남습니다.
  Mixpanel은 모든 이벤트의 속성, Amplitude는 사용자 속성(`setOnce`)으로 저장됩니다.
- SDK 자동 수집(`utm_source` 등)은 신규 사용자가 `/onboarding`으로 리다이렉트되면서 쿼리가 사라지면
  Amplitude에서 놓치는 것이 확인되어, 초기화 시점에 직접 읽어 따로 저장합니다.
  마지막 방문 기준 값은 기존 `utm_source` 속성(Mixpanel)을 보세요.
- 영문·숫자·`-`·`_`·`.`, 최대 64자만 허용하며 그 외 값은 무시됩니다.
- 채널 값은 소문자로 통일하세요 (`x`, `threads`, `instagram`, `kakao`, `community`).
- 2026-10-12 이후 발생한 이벤트부터 붙습니다.

### 접속 호스트 속성 (`hostname`)

개발(`localhost`)·미리보기·운영 트래픽을 구분하기 위한 속성입니다.
Amplitude는 이벤트에 접속 도메인이 따로 없어, 이 속성이 없으면 개발 중 접속을 걸러낼 수 없습니다.

| 값 | 의미 |
|---|---|
| `runners-fit.vercel.app` | 운영 |
| `localhost` | 로컬 개발·테스트 |
| 그 외 `*.vercel.app` | 미리보기(Preview) 배포 |

- Mixpanel에서는 모든 이벤트의 속성, Amplitude에서는 사용자 속성으로 저장됩니다.
  (Mixpanel에는 자동 속성 `current_domain`, `$current_url`도 있어 기존 방식으로도 구분할 수 있습니다.)
- **운영 데이터만 보려면** `hostname` **is** `runners-fit.vercel.app` 필터를 겁니다.
  개발 접속만 빼려면 `hostname` **is not** `localhost`를 걸되, 이 속성이 붙기 전의 이벤트는 값이 없어 포함됩니다.
- 이 속성이 배포된 이후의 이벤트부터 붙습니다.

### 인앱 브라우저 속성 (`isInAppBrowser`, `inAppBrowserName`)

SNS·메신저 앱 안의 웹뷰로 열린 접속을 구분하기 위한 속성입니다.
인앱 브라우저는 일반 브라우저와 저장소가 분리되어 있어 같은 사람이 매번 새 사용자로 잡힐 수 있고,
그만큼 **재방문율이 실제보다 낮게** 나옵니다. 재방문 지표는 인앱 접속을 분리해서 보세요.

| 속성 | 값 | 설명 |
|---|---|---|
| `isInAppBrowser` | `true` / `false` | 앱 안의 웹뷰로 열렸는지 |
| `inAppBrowserName` | `instagram`, `threads`, `x`, `facebook`, `kakaotalk`, `naver`, `line`, `band`, `daum`, `tiktok`, `webview`, `none` | 앱 이름. 앱을 특정하지 못한 웹뷰는 `webview`, 일반 브라우저는 `none` |

- Mixpanel에서는 모든 이벤트의 속성(super property), Amplitude에서는 사용자 속성으로 저장됩니다.
- User-Agent 기반 판별이라 앱 업데이트로 달라질 수 있습니다. 분석용 세그먼트로만 쓰세요.
- **X(트위터)의 iOS 인앱 브라우저는 일반 Safari와 User-Agent가 같아 구분되지 않을 수 있습니다.**
  채널 구분은 링크의 `utm_source`(예: `x`, `threads`)를 기준으로 하고, 이 속성은 보조로 쓰세요.
- 새 사용자의 첫 `[Auto] Page View`부터 붙습니다. (2026-10-12 이후)
- 재방문율 비교 예: `isInAppBrowser`가 `false`인 사용자만 Retention, 또는 `inAppBrowserName`별 Breakdown.

#### 페이지뷰 수집 방식 변경 (2026-10-12)

Mixpanel 자동 페이지뷰 수집은 초기화 시점에 발생해 사용자 속성이 빠지므로 끄고,
속성을 등록한 뒤 경로(pathname)가 바뀔 때마다 앱이 직접 `$mp_web_page_view`를 기록합니다.
이벤트 이름과 표시명(`[Auto] Page View`)은 그대로입니다. 쿼리·해시만 바뀐 경우는 기록하지 않습니다.
온보딩을 마치지 않은 신규 사용자는 `/` → `/onboarding` 리다이렉트로 페이지뷰가 2건 기록됩니다.

### `location_allow` 발생 시점 변경 (2026-10-11 배포)

| 시기 | 발생 시점 |
|---|---|
| 변경 전 | 온보딩의 [위치 허용하기] 버튼 클릭 |
| 변경 후 | 온보딩 [시작하기]를 눌렀을 때 현재 위치 사용이 켜져 있을 때, 또는 설정에서 현재 위치 사용을 OFF → ON으로 바꿀 때 |

배포 전후 수치를 직접 비교하지 마세요. 의미가 달라졌습니다.

---

## 2. 보드 구성 (UT용, 2026-10-12 개편)

가설 "한눈에 파악 → 만족 → 재방문"을 검증하도록 5개 리포트를 구성합니다.
무료 플랜의 저장 한도(5개)에 맞춘 구성이며, 아래 "공통 필터"를 모든 리포트에 적용합니다.

### 성공 기준 (최소 표본: 신규 방문자 30명, 피드백 20건. 미만이면 판단 보류)

| # | 기준 | 확인 리포트 |
|---|---|---|
| 1 | 첫 세션 결정 도달 ≥ 70% | 리포트 1 |
| 2 | 결정 전 옷차림 확인 ≥ 70% | 리포트 1 |
| 3 | 체감 피드백 `good` ≥ 60% | 리포트 3 |
| 4 | 첫 결정 후 7일 내 재방문 ≥ 20% | 리포트 4 |

성공 기준은 **합계**로 판단하고, 채널별 비교는 참고용입니다. 표본이 작아 채널별로 나누면 판단 보류가 됩니다.

### 공통 필터 (모든 리포트)

| 필터 | 이유 |
|---|---|
| `utmCampaign` **is not** `ut0` | 게시 전 테스트 접속 제외 |
| `participantId` **is not** `P00` | 테스트 참가자 제외 |
| `hostname` **is** `runners-fit.vercel.app` | 로컬·Preview·호스트 속성이 없던 시기의 개발 데이터 제외 |
| 기간: `2026-10-13` 이후 | 이 프로젝트 시간대는 한국 시간이 아니고 하루가 한국 시간 오후 4시에 시작하므로, 오후 4시 이후에 게시해야 `Oct 13`으로 집계됨 |

호스트 필터가 게시 전 데이터를 대부분 제외하며, 남는 것은 `ut0` 없이 운영에 접속한 소수 이벤트입니다.

### 리포트 5개

| # | 리포트 | 유형 | 설정 |
|---|---|---|---|
| 1 | 핵심 퍼널 | Funnels | 1단계 `run_score_viewed` → 2단계 `outfit_viewed` → 3단계 `decision_made`, 전환 창 1일, 집계 Uniques |
| 2 | 결정까지 걸린 시간 | Insights | 이벤트 `decision_made`, 필터 `isChange` is `false`, 지표 **Median of** `timeToDecisionMs`, 차트 Line (일 단위) |
| 3 | 체감 피드백 분포 | Insights | 이벤트 `feedback_submitted`, 지표 **Total Events**, Breakdown `feedback`, 차트 Bar |
| 4 | 재방문 리텐션 | Retention | 시작·복귀 이벤트 모두 `decision_made`, 일(Day) 단위 (7일 내 재방문 기준) |
| 5 | 온보딩 전환 | Funnels | 1단계 `[Auto] Page View` → 2단계 `cta_clicked`(`cta` is `onboarding_start`) → 3단계 `onboarding_completed`, 전환 창 1일 |

리포트 설명:

- **1. 핵심 퍼널**: "한눈에 파악"의 핵심. 결과를 본 사용자 중 옷차림을 확인하고 결정까지 간 비율입니다.
  오래 걸리거나 중간에서 이탈하면 홈 정보 위계를 의심합니다.
- **2. 결정까지 걸린 시간**: 짧을수록 한눈에 파악했다는 신호입니다. 평균보다 **중앙값**을 봅니다.
  앱을 백그라운드로 두었다가 돌아온 경우 값이 매우 크게 나옵니다. 재결정(`isChange=true`)은 값이 붙지 않습니다.
- **3. 체감 피드백**: `good` 비율이 성공 기준 3번입니다. `cold`/`hot` 쏠림은 옷차림 추천 보정이 필요하다는 신호입니다.
- **4. 재방문 리텐션**: 인앱 브라우저(인스타그램·카카오톡 등)는 저장소가 분리되어 같은 사람이 새 사용자로 잡혀 낮게 나올 수 있습니다.
  `isInAppBrowser`로 분리해서 비교하세요.
- **5. 온보딩 전환**: SNS 유입의 첫 관문입니다. `isInAppBrowser`·`utmSource`로 Breakdown 하면 채널·환경별 이탈을 볼 수 있습니다.

### 이전 보드에서 내린 리포트

| 이전 리포트 | 내린 이유 |
|---|---|
| 일별 방문자 | UT에서는 규모보다 전환·재방문이 핵심. 필요하면 3장의 일회성 조회로 확인 |
| 가기 / 안 가기 비율 | 홈의 '안 가기' 제거로 새 `skip`이 없어 의미가 없음 |
| 추위·더위 민감도 분포 | 가설 검증과 직접 관련이 없음. 필요하면 3장에서 일회성 조회 |

한계:
- 온보딩 중간 단계(다음 버튼)는 이벤트가 없어 단계별 이탈은 볼 수 없습니다.
  필요하면 단계 이벤트(`onboarding_step_viewed` 등) 추가를 별도로 진행합니다.
- 민감도는 1~5단계(3이 보통)입니다. 숫자 속성이라 Breakdown 시 구간으로 묶이면
  **Group by → Individual values**(개별 값)로 바꿔 보세요.

### 보드 새로 만들기

1. Mixpanel 왼쪽 위 **Create New → Board**를 선택합니다.
2. 이름을 `Run-Smart`로 정합니다.
3. 위 표의 리포트를 하나씩 만들어 보드에 추가합니다. (리포트 화면 오른쪽 위 **Save**에서 보드 선택)
4. 기존 리포트(일별 방문자, 가기/안 가기, 추위·더위)는 저장 한도 확보를 위해 삭제하거나 새 보드로 옮깁니다.
5. 보드 상단 **Filter**에 공통 필터를 적용합니다.

---

## 3. 저장 한도를 넘는 추가 분석

무료 플랜은 저장 리포트가 5개까지입니다. 아래 분석은 저장하지 않고 **Insights 등에서 일회성으로 조회**하세요.
(저장하려면 기존 리포트를 지우거나 요금제를 올려야 합니다.)

| 분석 | 유형 | 설정 |
|---|---|---|
| 채널별 사용자 | Insights | 이벤트 `run_score_viewed`, 지표 **Uniques**, Breakdown `utmSource`, 차트 Bar |
| 인앱 vs 일반 브라우저 | Insights | 이벤트 `run_score_viewed`, 지표 **Uniques**, Breakdown `inAppBrowserName` |
| 옷차림 확인률 | Insights (Formula) | `A = outfit_viewed`(필터 `source` is `home`) Uniques, `B = run_score_viewed` Uniques, 수식 `A / B` |
| 결정 취소 비율 | Insights (Formula) | `A = decision_cancelled`, `B = decision_made`, 수식 `A / B` |
| 탐색 행동 | Insights | 이벤트 `activity_changed`, `hourly_forecast_scrolled`, 지표 **Average per user** |
| 데이터 로딩 실패율 | Insights (Formula) | `A = data_load_failed`, `B = run_score_viewed`, 수식 `A / B` |
| 주간 결정 횟수 | Insights | 이벤트 `decision_made`, 지표 **Frequency per user**, 주 단위 |
| 활동별·점수 구간별 결정 | Insights | `decision_made`, Breakdown `activity` 또는 `score`(숫자 구간) |
| 앱 만족도 응답률 | Funnels | `app_review_shown` → `app_review_submitted`, 전환 창 1일 (제출 이벤트는 첫 수신 후 목록에 나타남) |
| 별점 분포 | Insights | `app_review_submitted`, **Total Events**, Breakdown `rating`, 차트 Bar |
| 평균 별점 | Insights | `app_review_submitted`, 지표 **Average of** `rating`, 차트 Line (주 단위 권장) |
| 메시지 작성 비율 | Insights | `app_review_submitted`, **Total Events**, Breakdown `hasMessage`, 차트 Pie |
| 저점수(1~3점) 비율 | Insights (Formula) | `A = app_review_submitted`(필터 `rating` ≤ 3), `B = app_review_submitted`, 수식 `A / B` |
| 팝업 닫기 비율 | Insights (Formula) | `A = app_review_dismissed`, `B = app_review_shown`, 수식 `A / B` |
| 페이지별 조회수 | Insights | `[Auto] Page View`, **Total Events**, Breakdown `$current_url`, 차트 Bar |
| 민감도 분포 | Insights | `settings_saved`, **Total Events**, Breakdown `coldLevel` 또는 `heatLevel` |
| 참가자 개별 흐름 | Insights | 필터 `participantId` is `P01`, 이벤트 전체 |

---

## 4. 배치 권장 순서

위에서 아래로 읽는 흐름이 되도록 배치합니다.

1. 온보딩 전환 (유입 → 활성화)
2. 핵심 퍼널 (한눈에 파악)
3. 결정까지 걸린 시간 (한눈에 파악의 속도)
4. 체감 피드백 분포 (만족)
5. 재방문 리텐션 (재방문)

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
| `onboarding_completed`에 `timeSlotCount`, `settings_saved`에 `useCurrentLocation`이 없는 이벤트가 보임 | 두 속성은 2026-10-20 배포 이후 이벤트부터 붙음 | 기간을 배포일 이후로 좁혀 확인 |
| Mixpanel Agent가 만든 보드의 위젯이 비어 있음 | 에이전트 초안의 쿼리가 완성되지 않음 | Events 또는 Insights에서 직접 만들어 보드에 추가 |

---

## 7. 공유와 구독

- **공유**: 보드 오른쪽 위 **Share**에서 링크를 복사하거나 프로젝트 멤버를 초대합니다.
- **정기 확인**: 보드 오른쪽 위 **Subscribe**에서 이메일 구독을 설정할 수 있습니다.

메뉴 이름은 Mixpanel 버전에 따라 다를 수 있습니다.

---

## 8. 검증 체크리스트

- [ ] 보드 필터에 `utmCampaign` ≠ `ut0`, `participantId` ≠ `P00`, `hostname` = `runners-fit.vercel.app`, 기간(`2026-10-13` 이후)이 적용되어 있는지
- [ ] 핵심 퍼널 1단계(`run_score_viewed`) 사용자 수가 Events 화면의 같은 이벤트 흐름과 맞는지
- [ ] `timeToDecisionMs`가 숫자로 들어오고, `isChange` is `false` 필터에서만 값이 있는지
- [ ] `feedback_submitted`의 `feedback` 값이 `cold`/`good`/`hot` 안에 있는지
- [ ] 운영 도메인 필터 적용 시 데이터가 사라지지 않는지
- [ ] 채널·인앱 비교를 할 때 표본이 최소 기준(신규 30명, 피드백 20건) 이상인지

---

## 9. 앱 만족도 팝업 (별점·메시지)

재방문한 사용자에게 별점(1~5)과 선택 메시지(최대 200자)를 묻는 팝업입니다. 성공 기준의 "만족" 가설을 직접 확인하는 데이터입니다.

| 항목 | 내용 |
|---|---|
| 노출 대상 | 이전 세션이 있던 재방문(마지막 활동 후 30분 이상) + 출발 기록 1건 이상 |
| 노출 시점 | 화면 진입 약 3초 뒤. 토스트·체감 피드백 카드가 떠 있으면 그 뒤 |
| 닫기 | "다음에 할게요" → 7일 쿨다운, 최대 2회 |
| 분석 이벤트 | `app_review_shown` / `app_review_submitted` / `app_review_dismissed` (1장 참고) |
| 저장 | Supabase `app_reviews` 테이블 (별점, 메시지, 출발 기록 수, 익명 사용자 ID) |

### 어디서 무엇을 보나

| 보고 싶은 것 | 위치 |
|---|---|
| 별점 분포, 평균, 응답률, 팝업 닫기 비율 | Mixpanel / Amplitude (3장의 일회성 조회) |
| 메시지 본문, 저점수 사유 | **Supabase** (`docs/analytics/app-review-queries.md`의 조회 쿼리) |

### 해석 주의

- **생존자 편향**: 재방문자만 묻기 때문에 첫 방문에서 떠난 사용자의 불만은 포함되지 않습니다. 별점은 "남은 사용자의 만족"으로 읽습니다.
- **낮은 응답률**: 닫을 수 있어 표본이 작을 수 있습니다. 평균보다 분포와 메시지를 중심으로 보고, 최소 20건 이상일 때 판단합니다.
- **인앱 브라우저**: 저장소가 분리되면 재방문으로 인식되지 않아 팝업이 안 뜰 수 있습니다. `inAppBrowserName`별로 응답률을 비교하세요.
- **메시지 개인정보**: 자유 입력이라 연락처 등이 적힐 수 있습니다. 외부로 공유할 때는 마스킹하세요.

