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
