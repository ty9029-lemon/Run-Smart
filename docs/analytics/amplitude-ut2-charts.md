# Amplitude 2차 UT 차트 정의

Amplitude `Run-Smart UT 대시보드`(id `ogjp215f`)에 2차 UT 지표를 추가한 내용과, 저장 차트 한도(Free 플랜 20개) 때문에 넣지 못한 후보 차트의 정의를 정리한다.

- 프로젝트 ID: `872681`
- 대시보드: https://app.amplitude.com/analytics/long-sun-432195/dashboard/ogjp215f
- 요금제: Free Plan. 저장 차트 한도 **20개**이고 현재 **20 / 20**이다. (Session Replay는 별도로 월 10k, 보관 30일)
- 기존 1차 차트(A1~D2, 15개)는 바꾸지 않고 아래에 2차 섹션을 붙였다. 1차와 2차를 따로 보려면 이 문서의 E·F 차트를 본다. A~D 차트는 필터가 `utmCampaign ≠ ut0`뿐이라 2차 참가자가 늘수록 1차와 섞인다.

## 대시보드 최종 구성 (2026-10-23)

기존 설명 → A1~D2(15개) → `2차 UT 지표 (E·F)` 설명 → E1·E2 → E3·E4 → F1

설명 블록의 성공 기준은 1차와 같고 E1(결정 도달·옷차림 확인), E2(체감 good), E3(7일 내 재방문)에 대응한다. F1은 기준값 없이 수치만 본다.

## 공통 기준

| 항목 | 값 |
|---|---|
| 2차 참가자 | 사용자 속성 `gp:utmCampaign` = `ut2` (모집 링크로 들어온 사람) |
| 1차 | 사용자 속성 `gp:utmCampaign` = `ut1` (E1~E4에서 2차와 나란히 비교) |
| 제외되는 것 | 내 테스트(`utm_campaign=test`), UTM 없이 직접 들어온 접속 |
| 날짜 | 모두 UTC. 1차 비교 E1~E4는 `1791849600`(10/13 00:00Z)부터, F1(신규 이벤트)은 `1792712940`(10/22 23:49Z, 배포 08:49 KST)부터 |
| 운영 도메인 | E1은 사용자 속성 `gp:hostname` = `runners-fit.vercel.app` 적용 |

주의: `appVersion`, `utmCampaign`, `utmSource`, `hostname`, `inAppBrowserName`은 이벤트 속성이 아니라 **사용자 속성**이라 차트에서 `gp:` 접두사와 `scope: user`로 쓴다.

## 추가한 차트 (E1~E4, F1)

| 차트 | 유형 | 구성 | 세그먼트 |
|---|---|---|---|
| **E1** 핵심 퍼널 1차 vs 2차 | 퍼널(막대) | `run_score_viewed` → `outfit_viewed` → `decision_made`, 전환 창 1일 | `ut1`, `ut2` (둘 다 hostname 적용) |
| **E2** 체감 피드백 분포 1차 vs 2차 | 이벤트 분석(막대) | `feedback_submitted`, 그룹 `feedback`, 합계 | `ut1`, `ut2` |
| **E3** 재방문 리텐션 1차 vs 2차 | 리텐션(선) | 시작 `decision_made` → 복귀 `decision_made`, `nday` | `ut1`, `ut2` |
| **E4** 피드백 제출 전환 1차 vs 2차 | 퍼널(막대) | `decision_made` → `feedback_submitted`, 전환 창 **7일** | `ut1`, `ut2` |
| **F1** 개선 요소별 도달 사용자 | 이벤트 분석(막대) | `section_viewed` 고유 사용자, 그룹 `section` | `ut2` |

`section` 값: `best_time`, `ai_guide`, `score_reason`, `score_delta`, `outfit_reason`, `distance_hint`, `hour_reminder`.

### 2026-10-23 계산 결과 (표본이 매우 작아 방향만 참고)
| 차트 | 1차 (ut1) | 2차 (ut2) |
|---|---|---|
| E1 | 72 → 71 → 45명 (최종 전환 62.5%) | 2 → 2 → 1명 (50%) |
| E2 | good 3건 | cold 1건 |
| E3 | 시작 45명, 7일째 재방문 1명(3.1%), 그 외 0 | 시작 2명, 재방문 0 |
| E4 | 6.7% (45명 → 3명) | 50% (2명 → 1명) |
| F1 | - | 6개 section이 각각 1명 (`hour_reminder`는 아직 없음) |

## 재방문 지표 대조 (2026-10-30)

Amplitude E3와 Mixpanel `재방문 리텐션`의 값이 크게 달라 같은 조건으로 맞춰 본 기록이다. 저장 차트는 늘리지 않고 `query_amplitude_data`로 조회만 했다.

### 정의 차이
- **E3는 `nday`(정확히 N일째)** 라서 성공 기준 "첫 결정 후 7일 내 재방문"보다 낮게 나온다. "7일 안에 한 번이라도"는 `bracket [1,7]` 또는 `rolling`으로 본다.
- **`decision_made`는 홈의 출발 버튼을 눌러야 발생한다**(`src/components/HomeReady.tsx`의 `handleDecide`). 돌아와서 점수만 보고 나간 사용자는 "결정 후 재방문"으로 잡히지 않는다. 같은 사용자를 아무 활동 기준으로 세면 값이 올라간다.
- Mixpanel `<7 Days` 값은 완료된 구간의 **가중 평균**이고, Amplitude `bracket`은 결정한 날짜별 시작 건수를 합친 값이다. 같은 사람이 여러 날 결정하면 여러 번 센다.
- 결과를 본 뒤 성공 기준을 바꾸지 않는다. E3(`nday`)는 그대로 두고, "7일 내" 값은 별도 지표로 읽는다.

### 같은 조건 대조 (결정 후 1~6일 내 복귀)
조건: 10/20 00:00 KST(`1792422000`) 이후, `gp:utmCampaign` ≠ `ut0`, `gp:hostname` = `runners-fit.vercel.app`. Mixpanel 보드의 필터(`utmCampaign` ≠ `ut0`, `participantId` ≠ `P00`, hostname)와 맞췄다.

| 복귀 기준 | 7일이 지난 코호트(10/19~10/24) | 비고 |
|---|---|---|
| 다시 출발 결정 | 시작 22건 중 3건 (13.6%) | 복귀는 10/19, 10/21, 10/24 코호트에서 각 1건 |
| 아무 활동 | 시작 22건 중 6건 (27.3%) | 10/19~10/24 코호트에서 각 1건 |

- Mixpanel `<7 Days`는 20% retention, 0.3333 users(average)였다. 하루 평균 시작이 약 1.67명이어서 복귀는 약 3명이고, Amplitude의 다시 결정 3건과 맞는다. 비율 차이(20% 대 13.6%)는 계산 방식 차이다.
- Amplitude `Overall` 요약 행(다시 결정 1건 16.67%, 아무 활동 2건 33.33%)은 날짜별 행의 합과 맞지 않았다. 이유는 확인하지 못해 위 표는 날짜별 행을 직접 합산한 값을 썼다.
- 10/25~10/28 코호트는 7일이 지나지 않아 값이 더 늘 수 있다.

### 기간별로 달라지는 값
| 조건 | 값 |
|---|---|
| 10/13 이후 ut1, 결정 7일째(`nday`) | 1/44 (2.3%) |
| 10/13 이후 ut1, 결정 후 7일 내 다시 결정(`bracket`) | 0/45 |
| 10/13 이후 ut1, 결정 후 7일 내 아무 활동 | 3/45 (6.7%) |
| 10/13 이후 신규 사용자, 아무 활동 D1 / D7 (`rolling`) | 전체 7.1% / 2.4%, ut1 8.3% / 4.3%, ut2 10.7% / 표본 부족 |
| 10/20 이후 운영 도메인(위 표) | 다시 결정 13.6%, 아무 활동 27.3% |

### 결론
- 값이 7%에서 20%대까지 움직이지만 **복귀한 사람은 3~6명**이다. 최소 표본(신규 30명, 결정 사용자도 10/20 이후 운영 도메인 기준 20명 안팎)에 못 미쳐 성공 기준(7일 내 20%)은 **판단 보류**다.
- 인앱 브라우저 여부별 D1은 아님 8.4%, 인앱 7.4%로 차이가 거의 없었다(Amplitude, 10/13 이후). Mixpanel은 사용자 식별 방식이 달라 확인하지 못했다.
- 신규 유입은 10/27 이후 하루 1~4명으로 거의 멈췄다. 표본이 쌓이려면 유입이 먼저 필요하다.
- 표본이 쌓이면 같은 조건으로 다시 조회한다. 다시 볼 때는 `bracket [1,7]`을 쓰고 완료된 코호트만 합산한다.

## 아직 추가하지 않은 후보 (한도 때문)

슬롯이 생기면 아래 순서로 추가한다. 모두 `ut2` 세그먼트, 신규 이벤트는 날짜 `1792712940`부터.

| 후보 | 유형 | 구성 |
|---|---|---|
| 채널별 2차 방문자 | 이벤트 분석 | `[Amplitude] Page Viewed` 고유 사용자, 그룹 `gp:utmSource`, 날짜 `1792661640`부터 |
| **F2** 점수 근거 노출 → 시트 열기 | 퍼널 | `section_viewed`(`section = score_reason`) → `score_reason_sheet_opened` |
| **F3** 알림 버튼 노출 → 클릭 | 퍼널 | `section_viewed`(`section = hour_reminder`) → `cta_clicked`(`cta = hour_reminder`) |
| **F4** 피드백 시트 열림 → 제출 | 퍼널 | `feedback_sheet_opened` → `feedback_submitted`(`source = sheet`) |
| **F5** 거리 안내 노출 → 거리 입력 저장 | 퍼널 | `section_viewed`(`section = distance_hint`) → `history_entry_edited`(`hasDistance = true`) |
| **G1** 온보딩 단계 퍼널 | 퍼널 | `onboarding_step_viewed`(`step` = `activity` → `offset` → `constraint` → `location`) → `onboarding_completed` |
| **G2** 온보딩 단계별 평균 소요 시간(초) | 이벤트 분석 | `onboarding_step_completed`, 측정 `property_avg`, 평균 속성 `durationSec`, 그룹 `step` |
| **G3** 테마 확정 분포 | 이벤트 분석 | `theme_saved`, 그룹 `theme`, 합계 |
| **G4** 제약사항 선택 분포 | 이벤트 분석 | `constraint_toggled`(`checked = true`), 그룹 `constraint`, 합계 |
| **G5** 활동 시간대 선택 분포 | 이벤트 분석 | `time_slot_toggled`(`checked = true`), 그룹 `slot`, 합계 |
| **H1** 비활성 활동 칩 클릭 | 이벤트 분석 | `activity_disabled_clicked`, 그룹 `activity`, 합계 |

한도가 풀리기 전에는 저장 없이 `query_amplitude_data`로 필요할 때 숫자를 조회한다. 한도를 늘리려면 Plus 플랜으로 올리거나 다른 차트를 정리해야 한다. (차트 삭제는 Amplitude 화면의 Chart Cleanup에서만 가능하다.)

### 온보딩 1차 vs 2차 비교는 보류
- `onboarding_start` 클릭은 마지막 단계의 [시작하기] 버튼이라 시작점으로 쓰면 완료율이 항상 100%가 된다.
- `/onboarding` 화면 진입(`[Amplitude] Page Viewed`)은 1차 사용자 상당수를 놓친다. (1차 온보딩 완료 68명 중 17명만 잡힘)
- 온보딩 단계별 이탈은 2차 신규 이벤트(G1)로만 볼 수 있고 1차와는 비교할 수 없다.

## 삭제한 차트 (되돌릴 수 없어 정의를 남김)

2026-10-23에 저장 한도를 확보하려고 아래 차트를 삭제했다. `Run Smart 핵심 지표` 대시보드(`wq8a7zdk`)의 10/06 차트였고, 필터가 없어 테스트·개발 접속이 섞여 있었다.

| 차트 | 정의 |
|---|---|
| 일별 핵심 이벤트 사용자 수 | 이벤트 분석, 고유 사용자 일별. 이벤트 7개(`onboarding_completed`, `run_score_viewed`, `decision_made`, `activity_changed`, `hourly_forecast_scrolled`, `history_opened`, `history_entry_viewed`), 최근 30일, 필터 없음 |
| 온보딩부터 결정까지 퍼널 | `onboarding_completed` → `run_score_viewed` → `decision_made`, 전환 창 1일, 최근 30일, 필터 없음 (당시 116 → 114 → 68명) |
| run_score_viewed 재방문 리텐션 | `run_score_viewed` → `run_score_viewed`, `rolling`, 시작·복귀 모두 `[Amplitude] Page Domain = runners-fit.vercel.app`, 최근 7일(Asia/Seoul) |

같은 날 어느 대시보드에도 쓰이지 않던 `A1. 핵심 퍼널`, `A2. 일별 결과 확인·결정 사용자` 사본(10/12 수정)도 삭제했다. 현재 대시보드가 쓰는 A1·A2는 그대로다.

## 만들 때의 함정
- `G2`는 평균을 낼 속성(`durationSec`)을 **이벤트 단위** `group_by`에 지정해야 컴파일된다. 구성 이벤트(`members`) 안에 두면 오류가 난다.
- 불리언 속성(`checked`, `hasDistance`)은 값을 문자열 `"true"`로 필터한다.
- 사용자 속성 필터는 `scope: user`와 `gp:` 접두사를 함께 쓴다.
- 대시보드 `edit`는 `expectedLastModified`가 필요한데 응답이 예전 값을 줄 때가 있다. `conflict`가 나면 에러에 나온 `actualLastModified`로 다시 시도한다.
- **대시보드 배치는 API로 바꾸지 않는다.** API로 행을 추가하자 화면에서 설명 블록이 아래로 밀렸고, Amplitude 화면에서 직접 드래그해 바로잡았다. 설명 블록은 API의 `rows`에 보이지 않는다. 배치와 설명 블록은 화면에서만 수정한다.
- 설명 블록(마크다운)에서 굵게(`**`) 바로 뒤에 한글이 이어지면 별표가 그대로 보였다. 굵게는 쓰지 않거나 공백을 둔다.
- 세션 리플레이는 `Sessions & Zoning → Session Replay → All Replays`에서 사용자 속성 `utmCampaign = ut2`로 필터한다. 입력창 글자는 `*`로 가려지고(medium) 화면 텍스트는 그대로 녹화된다. 세션이 끝난 뒤 목록에 올라오기까지 20~30분 걸렸다.
