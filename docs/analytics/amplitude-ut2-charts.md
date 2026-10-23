# Amplitude 2차 UT 차트 정의

`Run-Smart UT 대시보드`(id `ogjp215f`)는 1차 UT 기준(차트 A1~D2, 15개)이다. 2차 UT에서 확인할 지표 15개(E1~H1)를 설계하고 모두 계산까지 마쳤지만, 2026-10-23에 Amplitude가 `Chart limit reached`로 저장을 거부해 **대시보드에는 아직 추가하지 못했다.** 이 문서는 한도가 풀리거나 슬롯이 확보되는 즉시 같은 차트를 다시 만들 수 있게 정의를 남긴다.

- 프로젝트 ID: `872681`, 요금제: `starter_v4`
- 대시보드: https://app.amplitude.com/analytics/long-sun-432195/dashboard/ogjp215f
- 기존 차트와 대시보드는 바꾸지 않고, 맨 아래에 행을 붙이는 방식으로 추가한다. (`use_amp_dashboards` `edit` → `insert_row`)

## 공통 기준

| 항목 | 값 |
|---|---|
| 2차 참가자 | 사용자 속성 `gp:utmCampaign` = `ut2` (모집 링크로 들어온 사람) |
| 1차 비교 | 사용자 속성 `gp:utmCampaign` = `ut1` (E1·E2만) |
| 제외되는 것 | 내 테스트(`utm_campaign=test`), UTM 없이 직접 들어온 접속 |
| 운영 도메인 | 사용자 속성 `gp:hostname` = `runners-fit.vercel.app` (E1에 적용) |
| 날짜 기준 | 모든 차트 UTC. 1차 비교 E1·E2는 `1791849600`(10/13 00:00Z), 2차 기존 지표 E3·E4·H1은 `1792661640`(10/22 09:34Z, 모집 게시 18:34 KST), 신규 이벤트 F·G는 `1792712940`(10/22 23:49Z, 배포 08:49 KST) |
| 퍼널 전환 창 | 1일 (기존 차트와 같음) |
| 측정 | 퍼널은 사용자(`User`) 기준 전환율, 분포는 이벤트 합계(`event_totals`) |

주의: `appVersion`, `utmCampaign`, `utmSource`, `hostname`, `inAppBrowserName`은 이벤트 속성이 아니라 **사용자 속성**이라 차트에서는 `gp:` 접두사로 쓴다.

## 대시보드 배치안 (기존 7개 행 다음, 인덱스 7부터)

| 인덱스 | 높이 | 내용 |
|---|---|---|
| 7 | 375 | 설명 블록(rich_text, 폭 12): 2차 기준, 시작일, 1차와 같은 성공 기준 4개(E1·E2·E3에 대응), 신규 지표는 기준값 없이 수치만, 주의 사항 |
| 8 | 500 | E1(6) + E2(6) |
| 9 | 375 | E3(6) + E4(6) |
| 10 | 500 | F1(6) + F2(6) |
| 11 | 375 | F3(4) + F4(4) + F5(4) |
| 12 | 500 | G1(6) + G2(6) |
| 13 | 375 | G3(4) + G4(4) + G5(4) |
| 14 | 375 | H1(6) + 세션 리플레이 안내 rich_text(6) |

설명 블록에 쓸 성공 기준(1차와 동일, 최소 표본 신규 30명 / 피드백 20건): ① 첫 세션 결정 도달 70% 이상, ② 결정 전 옷차림 확인 70% 이상, ③ 체감 피드백 good 60% 이상, ④ 첫 결정 후 7일 내 재방문 20% 이상.

## 차트 정의

### 2차 핵심 지표 (E)
| 차트 | 유형 | 구성 | 필터 |
|---|---|---|---|
| **E1** 핵심 퍼널 1차 vs 2차 | 퍼널 (막대) | `run_score_viewed` → `outfit_viewed` → `decision_made` | 세그먼트 2개: `ut1`, `ut2` (둘 다 hostname 적용) |
| **E2** 체감 피드백 분포 1차 vs 2차 | 이벤트 분석 (막대) | `feedback_submitted`, 그룹 `feedback`(이벤트 속성), 합계 | 세그먼트 2개: `ut1`, `ut2` |
| **E3** 2차 재방문 리텐션 | 리텐션 (선) | 시작 `decision_made` → 복귀 `decision_made`, `nday` | `ut2` |
| **E4** 채널별 2차 방문자 | 이벤트 분석 (막대) | `[Amplitude] Page Viewed` 고유 사용자, 그룹 `gp:utmSource` | `ut2` |

### 개선 요소 도달·사용 (F, 신규 이벤트)
| 차트 | 유형 | 구성 | 필터 |
|---|---|---|---|
| **F1** 개선 요소별 도달 사용자 | 이벤트 분석 (막대) | `section_viewed` 고유 사용자, 그룹 `section` | `ut2` |
| **F2** 점수 근거 노출 → 시트 열기 | 퍼널 | `section_viewed`(`section = score_reason`) → `score_reason_sheet_opened` | `ut2` |
| **F3** 알림 버튼 노출 → 클릭 | 퍼널 | `section_viewed`(`section = hour_reminder`) → `cta_clicked`(`cta = hour_reminder`) | `ut2` |
| **F4** 피드백 시트 열림 → 제출 | 퍼널 | `feedback_sheet_opened` → `feedback_submitted`(`source = sheet`) | `ut2` |
| **F5** 거리 안내 노출 → 거리 입력 저장 | 퍼널 | `section_viewed`(`section = distance_hint`) → `history_entry_edited`(`hasDistance = true`) | `ut2` |

`section` 값: `best_time`, `ai_guide`, `score_reason`, `score_delta`, `outfit_reason`, `distance_hint`, `hour_reminder`.

### 온보딩·설정 (G)
| 차트 | 유형 | 구성 | 필터 |
|---|---|---|---|
| **G1** 온보딩 단계 퍼널 | 퍼널 | `onboarding_step_viewed`(`step` = `activity` → `offset` → `constraint` → `location`) → `onboarding_completed` | `ut2` |
| **G2** 온보딩 단계별 평균 소요 시간(초) | 이벤트 분석 (막대) | `onboarding_step_completed`, 측정 `property_avg`, 평균 속성 `durationSec`, 그룹 `step` | `ut2` |
| **G3** 테마 확정 분포 | 이벤트 분석 (막대) | `theme_saved`, 그룹 `theme`, 합계 | `ut2` |
| **G4** 제약사항 선택 분포 | 이벤트 분석 (막대) | `constraint_toggled`(`checked = true`), 그룹 `constraint`, 합계 | `ut2` |
| **G5** 활동 시간대 선택 분포 | 이벤트 분석 (막대) | `time_slot_toggled`(`checked = true`), 그룹 `slot`, 합계 | `ut2` |

### 참고 (H)
| 차트 | 유형 | 구성 | 필터 |
|---|---|---|---|
| **H1** 비활성 활동 칩 클릭 | 이벤트 분석 (막대) | `activity_disabled_clicked`, 그룹 `activity`, 합계 | `ut2` |

### 만들 때의 함정
- `G2`는 평균을 낼 속성(`durationSec`)을 **이벤트 단위** `group_by`에 지정해야 컴파일된다. 구성 이벤트(`members`) 안에 두면 오류가 난다.
- 불리언 속성(`checked`, `hasDistance`)은 값을 문자열 `"true"`로 필터한다.
- 사용자 속성 필터는 `scope: user`와 `gp:` 접두사를 함께 쓴다.
- 세션 리플레이 안내 블록 문구: `Sessions & Zoning → Session Replay → All Replays`에서 `utmCampaign = ut2`로 필터. 입력창 글자는 `*`로 가려지고(medium) 화면 텍스트는 그대로 녹화된다. 세션이 끝난 뒤 처리까지 20~30분 걸렸다.
- 설명 블록의 마크다운에서 굵게(`**`) 표시 바로 뒤에 한글이 이어지면 별표가 그대로 보였다. 굵게는 쓰지 않거나 공백을 둔다.

## 2026-10-23 계산 결과 (스냅샷, 표본이 매우 작음)
| 차트 | 결과 |
|---|---|
| E1 | 1차(ut1) 전환 63.4% (결과 확인 71명 → 옷차림 확인 70 → 결정 45), 2차(ut2) 50% (2명 → 1명) |
| E2 | ut1 good 3건, ut2 cold 1건 |
| E3 | 2차 시작 2명, 1일 뒤 재방문 0명 |
| E4 | pickply 2명, kakao 1명 |
| F1 | 6개 section 값이 각각 1명 (`hour_reminder`는 아직 없음) |
| F2 | 노출 1명 → 시트 열기 1명 |
| F3 | 데이터 없음 (노출 수집은 10/23 09:40 KST 수정 배포 이후) |
| F4 | 시트 열림 1명 → 제출 1명 |
| F5 | 노출 1명 → 거리 입력 저장 0명 |
| G1 | 4단계 도달 후 완료까지 1명 |
| G2 | 평균 소요: 활동 5.3초, 민감도 2초, 제약사항 9초, 위치 3초 |
| G3 | 데이터 없음 |
| G4·G5 | 제약사항 3종(dustSensitive, footIssue, uvSensitive), 시간대 5종 선택 각 1~2건 |
| H1 | walking 6, cycling 2, hiking 1 |

## 한도 문제와 선택지
- 저장 시도 시 `Chart limit reached` (1개만 저장해도 실패). 현재 저장 차트는 기존 UT 대시보드 15개와 `Run Smart 핵심 지표` 3개 등이다.
- 선택지: ① 요금제 한도 확인·상향, ② `Run Smart 핵심 지표`(`wq8a7zdk`)의 10/06 차트 3개(`s9zwwudn`, `g7ykp5ri`, `bim4fiez`)는 A1·A2·C1과 겹치므로 정리 후 슬롯 확보(삭제는 되돌릴 수 없음), ③ 우선순위 5개(E1, E2, F1, F2 또는 F3, G1)만 먼저 추가.
- 한도가 풀리기 전에는 저장 없이 `query_amplitude_data`로 필요할 때 숫자를 조회한다.
