# UT 게시 체크리스트 (2026-10-13 오후 4시 이후 게시)

MVP UT를 SNS(X, 스레드, 인스타그램, 카카오톡)로 공개 게시하기 위한 최종 점검 목록입니다.
결정 사항, 게시 전 확인, 게시 후 작업을 한곳에 모았습니다.

## 1. 결정 사항

| 항목 | 결정 |
|---|---|
| 게시 시점 | **2026-10-13(화) 한국 시간 오후 4시 이후** (10/12 저녁 게시는 하지 않음) |
| 성공 기준 | 첫 세션 결정 도달 ≥ 70%, 결정 전 옷차림 확인 ≥ 70%, 체감 피드백 `good` ≥ 60%, 첫 결정 후 7일 내 재방문 ≥ 20% |
| 최소 표본 | 신규 방문자 30명, 피드백·별점 20건 (미만이면 판단 보류) |
| 온보딩 질문 추가 | 이번 UT에서는 하지 않음 (v2에서 구현, 후속 설문 링크로 보완) |
| 판단 단위 | 성공 기준은 합계로 판단, 채널 비교는 참고용 |

## 2. 게시 시점을 10/13 오후 4시 이후로 한 이유

| 이유 | 설명 |
|---|---|
| 날짜 기준이 깔끔함 | 대시보드는 하루 단위로 집계합니다. 오늘(10/12) 저녁에 게시하면 개발·테스트와 실제 사용자가 같은 날에 섞입니다. 10/13 오후 4시 이후에 게시하면 `10/13 ~ 오늘`로 기간만 잡으면 됩니다. |
| 일 경계 | Amplitude 프로젝트 시간대는 `Asia/Seoul`이라 한국 시간과 일치합니다. **Mixpanel은 한국 시간이 아닙니다.** `Today`가 한국 시간 10/13 오후에도 `Oct 12`로 표시되어 미국 서부(UTC-7)로 보이며, 하루가 한국 시간 오후 4시에 시작합니다. 그래서 한국 시간 오후 4시 이후에 게시하면 Mixpanel에서 `Oct 13`으로 집계되고, 보드 기간을 `Oct 13`부터 잡을 수 있습니다. 16시 직후 Insights에서 `Today`의 축이 `Oct 13, 12am`부터인지 확인하세요. |
| 게시 전 확인할 시간 | 아래 3장 항목을 오늘 밤에 차분히 처리할 수 있습니다. |
| 러닝 앱의 사용 시점 | 퇴근 후·저녁 러닝 시간대와 가까운 시점입니다. |
| 게시 직후 모니터링 | 게시 후 수집·오류를 바로 확인합니다. |

## 3. 게시 전 확인 (오늘 밤)

- [ ] X·스레드·인스타그램에서 링크 카드 표시 확인 (게시 전 미리보기, 비공개 DM)
- [ ] 개인정보처리방침·분석 도구 고지 필요 여부 확인 (만족도 메시지는 자유 입력)
- [ ] Mixpanel Lexicon 표시 이름 반영 확인 (`feedback_submitted` → 체감 피드백, `outfit_viewed` → 복장 확인)
- [x] Mixpanel 프로젝트 시간대 확인 (한국 시간이 아님. 위 "일 경계" 참고)
- [ ] 게시 링크 4개를 카카오톡 등에서 한 번씩 열어 오류 없는지 확인 (`ut0` 파라미터 사용)

## 4. 게시 링크

```
https://runners-fit.vercel.app/?utm_source=x&utm_campaign=ut1
https://runners-fit.vercel.app/?utm_source=threads&utm_campaign=ut1
https://runners-fit.vercel.app/?utm_source=instagram&utm_campaign=ut1
https://runners-fit.vercel.app/?utm_source=kakao&utm_medium=chat&utm_campaign=ut1
```

- 지인에게 개별로 보낼 때는 `&pid=P01`처럼 참가자 코드를 붙입니다.
- 채널 값은 소문자로 통일합니다.
- 게시글에는 "인앱 브라우저에서 열면 기록이 저장되지 않을 수 있으니 Safari/Chrome에서 열어 주세요" 안내를 넣습니다.

## 5. 테스트 접속 규칙

로컬과 Preview에서는 분석 도구가 초기화되지 않아(`runners-fit.vercel.app`만 전송) 데이터가 쌓이지 않습니다.
운영 사이트에서 테스트할 때만 첫 접속부터 아래를 붙이고 시크릿 창을 사용합니다.

```
?utm_source=test&utm_campaign=ut0&pid=P00
```

| 파라미터 | 효과 |
|---|---|
| `utm_campaign=ut0` | Amplitude 대시보드 모든 차트에서 제외됨 |
| `pid=P00` | Mixpanel 보드 필터 `participantId ≠ P00`로 제외됨 |

운영 사이트 접속은 최소한으로 하고, UI·기능 확인은 Preview(PR의 Vercel 링크)나 로컬에서 합니다. 분석 이벤트 전송 자체를 확인하려면 운영 호스트에서만 가능합니다.
로컬 개발 서버는 `api/` 함수가 동작하지 않아 날씨 장소명·AI 가이드가 실패합니다. API까지 보려면 Preview를 쓰세요.

## 6. 게시 후 작업

| 순서 | 작업 | 담당 |
|---|---|---|
| 1 | Mixpanel 보드 기간을 `Since Oct 13, 2026`으로 변경하고 `hostname` is `runners-fit.vercel.app` 필터 추가 (오후 4시 이전에 게시하면 `Oct 12`로 집계되니 반드시 오후 4시 이후에 게시) | 사용자 |
| 2 | Supabase 조회 쿼리(`docs/analytics/app-review-queries.md`)의 시작 시각을 게시 시각(`2026-10-13 16:00:00+09` 이후)으로 사용. `2026-10-13 00:00`으로 두면 오늘 낮 테스트 응답이 섞입니다 | 사용자 |
| 3 | 몇 시간~하루 뒤 데이터가 쌓이면 성공 기준 4개 대비 현황 점검 | Claude에게 요청 |
| 4 | `inAppBrowserName` 판별 패턴 보정 (스레드·X 유입 값 확인 후) | Claude에게 요청 |
| 5 | 별점·메시지 확인 (Amplitude B5·B6, Supabase 쿼리) | 사용자 |

## 7. 보류 중인 결정

| 항목 | 내용 |
|---|---|
| ~~개발·Preview 환경 분석 전송 차단~~ | 완료: 운영 호스트(`runners-fit.vercel.app`)가 아니면 Amplitude·Mixpanel 초기화를 건너뜁니다 (`PRODUCTION_HOSTNAME`, `src/constants/analytics.ts`). 운영 도메인이 바뀌면 이 상수도 바꿔야 합니다 |
| Amplitude 차트 추가 | 저장 한도 20개에 도달. 새 차트(예: `timeToDecisionMs` 중앙값)는 기존 차트를 지운 뒤 추가 |

## 8. 참고 위치

| 대상 | 위치 |
|---|---|
| Amplitude 대시보드 | https://app.amplitude.com/analytics/long-sun-432195/dashboard/ogjp215f |
| Mixpanel 보드 | `Run-Smart` 보드 (설정은 `mixpanel-dashboard.md` 2장) |
| 이벤트·속성 사전 | `docs/analytics/mixpanel-dashboard.md` 1장 |
| 만족도 응답 조회 | `docs/analytics/app-review-queries.md` |
