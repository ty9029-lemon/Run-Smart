# 2차 UT 모집·안내 문구

`[ ]`로 표시한 곳은 게시 전에 채운다. 앱 주소는 운영 호스트(`runners-fit.vercel.app`) 기준이다.

## 채널별 앱 링크
`utm_source`는 채널마다 다르게 붙이고 소문자로 통일한다. 아래 모집 글의 `[앱 링크]`에는 게시하는 채널의 링크를 넣는다.

| 채널 | 링크 |
|---|---|
| X | `https://runners-fit.vercel.app/?utm_source=x&utm_campaign=ut2` |
| 스레드 | `https://runners-fit.vercel.app/?utm_source=threads&utm_campaign=ut2` |
| 인스타그램 | `https://runners-fit.vercel.app/?utm_source=instagram&utm_campaign=ut2` |
| 카카오톡 | `https://runners-fit.vercel.app/?utm_source=kakao&utm_medium=chat&utm_campaign=ut2` |
| 픽플리 | 설문(구글 폼) 링크 1개. 폼 설명에 `?utm_source=pickply&utm_campaign=ut2` 앱 링크가 들어간다 |

- 카카오톡·DM으로 개별 전달할 때는 `&pid=[참여자코드]`를 덧붙인다(예: `...&utm_campaign=ut2&pid=P101`). 픽플리는 `pid`를 쓰지 않는다.
- 카카오톡의 `utm_medium=chat`은 1차 링크 규칙을 따른 것이다. 2차에 필요 없으면 뺀다.
- 테스트·미리보기 확인용으로 공유할 때는 실제 채널 링크 대신 `?utm_source=test&utm_campaign=ut0&pid=P00`을 쓴다(대시보드에서 제외된다).

## SNS 모집 글 (X·스레드·인스타그램 공용)
> 러닝 나가기 전에 "오늘 나가도 될까, 뭘 입을까" 고민되시나요?
> 날씨 점수와 복장을 한 번에 알려 주는 Run-Smart를 써 보시고 설문에 답해 주실 분을 찾습니다.
>
> - 대상: 러닝을 하시는 분 (1차 테스트 참여자는 제외)
> - 방법: 아래 링크로 앱을 열어 둘러본 뒤 설문 작성 (약 [ ]분)
> - 앱: [앱 링크] (위 "채널별 앱 링크" 참고)
>
> 서비스 개선 분석을 위해 앱 사용 중 화면이 녹화됩니다(입력창 글자는 가려집니다).
>
> 솔직한 의견이 서비스에 큰 도움이 됩니다.

## 참여 안내 (카카오톡·DM용)
1. 아래 링크로 앱을 열어 주세요. 링크 안의 참여자 코드는 그대로 두세요.
   `https://runners-fit.vercel.app/?utm_source=[채널]&utm_campaign=ut2&pid=[참여자코드]`
2. 홈 화면의 점수, 복장 추천, 시간대별 날씨, 기록 화면을 자유롭게 둘러보세요.
3. 설문에서 참여자 코드를 입력하고 답해 주세요. [설문 링크]

※ 서비스 개선 분석을 위해 앱 사용 중 화면이 녹화됩니다(입력창 글자는 가려집니다). 녹화를 원하지 않으시면 앱을 열지 말고 알려 주세요.

## 픽플리 게시
- 픽플리에는 앱 주소가 아니라 **2차 설문(구글 폼) 링크 1개**를 올린다. 응답자별 링크는 만들 수 없다.
- 폼 설명에 앱 링크(`https://runners-fit.vercel.app/?utm_source=pickply&utm_campaign=ut2`)를 적어 둔다(`ut2-form-builder.gs`가 자동으로 넣는다).
- 참여자 코드(`pid`)는 쓰지 않는다. Amplitude·Mixpanel의 익명 ID 기준 Unique Users를 `utmCampaign = ut2` 또는 `appVersion = 1.1`로 필터해 본다. 1차는 `appVersion`이 없는 데이터다(`mixpanel-dashboard.md` 참고).
- 한계: 브라우저를 바꾸거나 사이트 데이터를 지우면 다른 사용자로 집계되고, 설문 응답과 앱 행동은 개인 단위로 잇지 못한다.

## 운영 체크리스트
- 채널별로 `utm_source`를 다르게 붙이고, 참여자마다 `pid`를 하나씩 발급한다(예: `P101`, `P102`).
- 대시보드는 `utmCampaign != ut0`로 테스트를 제외하므로 2차는 `ut2`처럼 다른 값을 쓴다. 기존 보드 필터가 `ut0` 제외만 걸려 있어 1차와 2차가 섞인다. 기간 필터로 구분하거나 `utmCampaign`으로 나눠 본다.
- 설문 편집 화면의 "미리 채워진 링크 받기"로 참여자 코드 칸을 자동 입력하는 링크를 만들 수 있다.
- 게시 전 시크릿 창에서 `?utm_source=test&utm_campaign=ut0&pid=P00`으로 접속해 흐름과 동의 분기를 확인한다.
- 화면 녹화(Amplitude Session Replay)는 배포 후부터 동작한다. 모집 글과 폼 설명에 녹화 안내를 넣었으며, 이미 올린 글·폼은 직접 고쳐야 한다(`ut2-form-builder.gs`는 새로 만들 때만 반영된다).
- 개인정보 처리 고지가 법적으로 충분한지는 게시 전에 확인한다(1차에서도 미결이었음). 녹화 보관 기간은 Amplitude 요금제 한도를 확인해 맞춘다.
