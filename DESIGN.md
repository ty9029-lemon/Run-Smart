# Home — 스타일 레퍼런스
> 한밤중의 네온 게이밍 아레나 — 검은 바닥, 단 하나의 일렉트릭 라임, 그리고 벽에서 외치는 토너먼트 규모의 타이포그래피.

**테마:** 다크

원본 측정값은 정규화되었으며, 역할과 권장 사항은 해석을 거친 것입니다. 폰트 요약 목록은 서로 독립적이며 순서대로 짝지어지지 않습니다. HTML 예시는 원본 컴포넌트가 아니라 재구성한 것입니다.

Swoosh는 한밤중의 아레나 콘솔처럼 작동합니다. 거의 완전한 검정 캔버스(#111111), 모든 인터랙션을 담당하는 단 하나의 일렉트릭 라임 포인트 컬러(#b7ff2c), 그리고 웹 카피가 아니라 토너먼트 간판처럼 기능하는 초대형 압축 디스플레이 타입(110px, 줄 간격 0.85)으로 구성됩니다. 이 시스템은 의도적으로 절제되어 있습니다. 유채색은 단 하나뿐이며, 채워진 CTA 버튼과 얇은 액션 테두리에만 등장하기 때문에 라임은 어둠 속에서 '켜진' 것처럼 보입니다. 사진은 화면을 가득 채우는 어두운 분위기이며, 그 위에 흰색 또는 흰색에 가까운 카드가 떠 있어 에디토리얼 타이포그래피와 사진이 번갈아 나타나는 포스터 같은 레이어링을 만듭니다. 영문은 Plus Jakarta Sans, 한글은 Pretendard가 모든 크기에서 목소리를 담당합니다. 굵고 촘촘한 디스플레이 웨이트가 시그니처이며, 카드·내비게이션·이미지 컨테이너의 20px radius와 pill 형태의 버튼이 설계된 듯한 일관된 둥근 형태를 줍니다.

## 토큰 — 색상

| 이름 | 값 | 토큰 | 역할 |
|------|-------|-------|------|
| Lime Pulse | `#b7ff2c` | `--color-lime-pulse` | 채워진 버튼, 선택된 내비게이션 상태, 집중해야 할 전환 순간에 쓰는 초록색 액션 컬러 |
| Midnight Canvas | `#111111` | `--color-midnight-canvas` | 페이지 배경, 히어로 캔버스, 내비게이션 표면, 본문 기반 — 나머지 모든 것이 놓이는 구조적 바닥 |
| Card Charcoal | `#1f1f21` | `--color-card-charcoal` | 떠 있는 카드 표면, 모달 배경, 패널 기반 — 레이어드 컨테이너를 위해 Midnight Canvas보다 한 단계 위 |
| Card Border Ink | `#28282a` | `--color-card-border-ink` | 구분선, 진행 막대 트랙, 가로 스크롤바 트랙, 드롭다운 메뉴 면 — 카드에는 테두리로 쓰지 않음(카드는 면 대비로 구분) |
| Footer Rule | `#39393b` | `--color-footer-rule` | 푸터 상단 테두리, 페이지 영역 사이의 구조적 구분선 |
| Steel Border | `#707072` | `--color-steel-border` | 이미지 프레임 가장자리, 칩·슬라이더·입력창 테두리, 가로 스크롤바 썸 — 눈에 띄되 조용한 구분을 위한 중간 대비의 중성색. 글자에는 쓰지 않음(Subtle Text 사용) |
| Subtle Text | `#8e8e90` | `--color-subtle-text`, `--muted-foreground` | 서브 텍스트(지표 이름, 보조 설명) — 어두운 카드·캔버스 위에서 대비 4.5:1 이상. 테두리에는 쓰지 않음 |
| Placeholder | `#636366` | `--color-placeholder` | 입력창 placeholder 전용 — 입력한 글자(Pure White)와 한눈에 구분되도록 Subtle Text보다 옅은 회색 |
| Fog Border | `#e5e5e5` | `--color-fog-border` | 라이트 모드 헤어라인 테두리, 텍스트/제목 밑줄, 아이콘 스트로크 — 반전된 맥락(흰 카드, 밝은 표면)에서 등장 |
| Pure White | `#ffffff` | `--color-pure-white` | 어두운 표면 위의 밝은 텍스트, 반전 라벨, 고대비 캡션. 기본 CTA 컬러로 승격하지 말 것 |
| Carbon Black | `#000000` | `--color-carbon-black` | 밝은 표면 위의 주요 제목, 본문 텍스트, 아이콘 채움. 기본 CTA 컬러로 승격하지 말 것 |
| Level Good | `#4da3ff` | `--color-level-good` | 등급 표시 전용: 미세먼지 '좋음', 자외선 '낮음' |
| Level Normal | `#ff9a3c` | `--color-level-normal` | 등급 표시 전용: '보통', 점수 '보통' 막대 |
| Level Bad | `#ff7a6b` | `--color-level-bad` | 등급 표시 전용: '나쁨'·'높음', 점수 '나쁨' 막대 |
| Destructive | `#ff7a6b` | `--destructive` (= Level Bad) | 오류·위험 표시 전용: Destructive 버튼의 글자와 10% 면, 입력 오류 테두리, 오류 안내 문구 |

### 상태 레벨 색
홈의 등급 지표(미세먼지, 자외선)와 시간대 막대·점수 단계에만 쓰는 예외 색입니다. 글자·아이콘·작은 막대에만 쓰고, 면 배경이나 버튼·강조에는 쓰지 않습니다. 색만으로 구분하지 않도록 항상 등급 문구(좋음·보통·나쁨 등)를 함께 적습니다. 점수의 '좋음'은 이 색이 아니라 라임을 씁니다. 코드는 `src/constants/levelStyles.ts`가 등급·점수 단계와 색 클래스를 한 곳에서 연결합니다.

## 토큰 — 타이포그래피

### Plus Jakarta Sans — 영문(라틴 문자)과 숫자에 쓰는 기본 브랜드 서체. 내비게이션, 본문, 제목, 디스플레이 전반을 하나의 패밀리로 담당하며, 400/500/700 웨이트로 본문부터 디스플레이까지 커버합니다. 110px / 줄 간격 0.85의 디스플레이 헤드라인에서는 굵은 웨이트와 약간 좁힌 자간으로 포스터 규모의 밀도를 만듭니다. · `--font-plus-jakarta-sans`
- **폴백:** Pretendard Variable, Pretendard, system-ui, -apple-system, Segoe UI, Roboto
- **웨이트:** 400, 500, 700
- **크기:** 14, 16, 20, 24, 64, 110
- **줄 간격(영문 기준):** 0.85 (디스플레이), 1.00 (heading-lg), 1.20 (heading-sm), 1.40 (서브헤딩), 1.50 (본문, body-sm)
- **역할:** 영문과 숫자의 기본 서체. 기본 폰트 스택의 맨 앞에 두어 라틴 글리프에 먼저 적용되고, 한글은 다음 순서의 Pretendard로 자연스럽게 넘어갑니다.

### Pretendard — 한글 텍스트에 쓰는 기본 브랜드 서체. 영문 글리프도 포함하고 있어 한글과 영문이 섞인 문장에서도 굵기와 크기가 어긋나지 않습니다. 400/500/700 웨이트를 Plus Jakarta Sans와 맞춰 사용합니다. · `--font-pretendard`
- **폴백:** Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, system-ui, sans-serif
- **웨이트:** 400, 500, 700
- **크기:** 14, 16, 20, 24, 64, 110
- **줄 간격:** 한글 헤드라인(디스플레이, heading-lg, heading-sm)은 모두 1.4. 한글은 글자 높이가 커서 0.85에서 글자가 겹치므로 영문 스케일을 그대로 쓰지 않습니다. 서브헤딩 이하와 본문은 영문과 같은 스케일
- **자간:** 한글 display −0.01em, heading-lg·heading-sm +0.02em, subheading −0.01em, body 0, body-sm·버튼 +0.01em. 영문은 기존 자간 유지 (Figma에서 조정한 값이 기준)
- **역할:** 한글 전용 기본 서체. Plus Jakarta Sans 뒤에 폴백으로 배치해, 별도 언어 분기 없이 한글 글리프에만 적용되도록 합니다.

### ui-sans-serif — 커스텀 폰트 로딩이 필요 없는 일반 UI 요소(보조 링크, 인라인 라벨, 작은 도움말 문구)를 위한 시스템 폴백. 두 기본 서체와 같은 웨이트 범위를 사용해 자연스럽게 대체되도록 합니다. · `--font-ui-sans-serif`
- **대체 폰트:** system-ui, -apple-system, Segoe UI, Roboto
- **웨이트:** 400, 500, 700
- **크기:** 14, 16
- **줄 간격:** 1.20, 1.50
- **역할:** 커스텀 폰트 로딩이 필요 없는 일반 UI 요소(보조 링크, 인라인 라벨, 작은 도움말 문구)를 위한 시스템 폴백. 두 기본 서체와 같은 웨이트 범위를 사용해 자연스럽게 대체되도록 합니다.

### 타입 스케일

| 역할 | 패밀리 | 웨이트 | 크기 | 줄 간격 | 자간 | 토큰 |
|------|--------|--------|------|-------------|----------------|-------|
| body-sm | — | — | 14px | 1.5 | — | `--text-body-sm` |
| body | — | — | 16px | 1.5 | — | `--text-body` |
| subheading-sm | — | — | 18px | 1.4 | — | `--text-subheading-sm` |
| subheading | — | — | 20px | 1.4 | — | `--text-subheading` |
| heading-sm | — | — | 24px | 1.2 | — | `--text-heading-sm` |
| heading-lg | — | — | 64px | 1 | — | `--text-heading-lg` |
| display | — | — | 110px | 0.85 | — | `--text-display` |

위 표는 영문 기준입니다. **한글**은 display·heading-lg·heading-sm의 줄 간격을 1.4로 적용합니다(`--leading-heading-ko`). 자간은 역할별로 다릅니다.

| 역할 | 한글 자간 | 토큰 |
|------|-----------|-------|
| display | −0.01em | `--tracking-ko-display` |
| heading-lg, heading-sm | +0.02em | `--tracking-ko-heading` |
| subheading, subheading-sm | −0.01em | `--tracking-ko-subheading` |
| body | 0 | `--tracking-ko-body` |
| body-sm, 버튼 | +0.01em | `--tracking-ko-small` |

### 폰트 로딩

```css
/* Plus Jakarta Sans — Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap");

/* Pretendard Variable — jsDelivr CDN */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");
```

`@import`는 스타일시트 맨 위에 둡니다. Pretendard Variable의 font-family 이름은 `'Pretendard Variable'`입니다.

## 토큰 — 간격과 형태

**기본 단위:** 4px

**밀도:** 여유로움

### 간격 스케일

| 이름 | 값 | 토큰 |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 36 | 36px | `--spacing-36` |
| 48 | 48px | `--spacing-48` |
| 96 | 96px | `--spacing-96` |
| 144 | 144px | `--spacing-144` |

### Border Radius

| 요소 | 값 |
|---------|-------|
| 내비게이션 | 20px |
| 카드 | 20px |
| 이미지 | 20px |
| 모달 | 20px |
| 바텀 시트 | 위쪽 모서리 32px, 아래쪽 0 (`BOTTOM_SHEET_CLASS`) |
| 입력창 | 8px (`--radius-input`) |
| 드롭다운 메뉴와 메뉴 항목, 지표 타일 같은 작은 박스 | 12px (`rounded-[12px]`) |
| 버튼 | 9999px (pill) |

Tailwind 기본 radius 클래스는 `--radius: 20px` 기준으로 계산되어 `rounded-sm` = 12px, `rounded-md` = 6px(`--radius-md`로 고정), `rounded-lg` = 20px, `rounded-xl` = 28px입니다. 이름에서 짐작하는 값과 달라 작은 요소에 `rounded-lg`·`rounded-xl`을 쓰면 알약처럼 크게 둥글어지므로, 작은 요소는 `rounded-[12px]`처럼 값을 직접 지정하고 컨테이너는 `rounded-panel`을 씁니다.

### 그림자

| 이름 | 값 | 토큰 |
|------|-------|-------|
| sm | `rgba(17, 17, 17, 0.125) 0px 2px 6px 0px` | `--shadow-sm` |

### 레이아웃

- **페이지 최대 너비:** 1440px
- **섹션 간격:** 48-64px
- **카드 패딩:** 20-24px
- **요소 간격:** 16-20px

## 컴포넌트

### Primary CTA Button
**역할:** 채워진 액션 트리거

Lime Pulse(#b7ff2c) 배경, Carbon Black(#000000) 텍스트, 9999px border radius(pill), 높이 40px(default) / 가로 20px 패딩, Plus Jakarta Sans / Pretendard 700 16px, 줄 간격 1.20. 채움색과 같은 1px solid #b7ff2c 테두리. 어느 페이지에서든 가장 채도가 높은 단 하나의 요소이며, 전기가 켜진 듯한 느낌이어야 합니다.

### Button 사이즈
텍스트 버튼은 아이콘 버튼과 같은 높이 체계(48/40/32/24px)를 씁니다. 글자 굵기는 xs만 500(Medium)이고 나머지 크기는 700(Bold)입니다. 아이콘과 글자 사이 간격은 lg·default·sm이 8px, xs가 4px입니다.

| size | 높이 | 폰트 | 용도 |
|------|------|------|------|
| lg | 48px | 16px | 터치 강조·단독 CTA |
| default | 40px | 16px | 기본 버튼 |
| sm | 32px | 14px | 내비게이션 바 |
| xs | 24px | 12px (500) | 칩·인라인 보조 액션 |

화면 하단의 주요 CTA(온보딩 이전/다음/시작하기, 홈 이대로 출발하기, 설정 저장)는 `size="lg"`를 씁니다. 버튼은 직접 스타일링하지 않고 항상 `Button` 컴포넌트를 사용합니다. 온보딩 1단계에는 이전 버튼이 없고 다음 버튼이 전체 너비를 차지하며, 이전 버튼은 2단계부터 보입니다.

### Secondary Navigation Button
**역할:** 내비게이션의 보조 액션 (예: 기록, 설정)

Card Charcoal(#1f1f21) 배경, Pure White(#ffffff) 텍스트, 테두리 없음, 9999px radius(pill), 높이 32px(sm) / 가로 20px의 컴팩트한 패딩, Plus Jakarta Sans / Pretendard 700 14px. 구현은 `Button`의 `variant="secondary" size="sm"`입니다. 라임을 쓰지 않으므로 같은 내비게이션 안의 채워진 CTA와 경쟁하지 않고 공존할 수 있습니다.

### Icon Button
**역할:** 텍스트 없이 아이콘만으로 동작하는 정사각형 액션 (예: 설정)

정사각형 + 9999px radius(pill). 아이콘은 Lucide만 사용하며 이모지는 쓰지 않습니다. 텍스트가 없으므로 `aria-label`이 필수이고, 아이콘은 `currentColor`를 따릅니다. 내비게이션에서는 Secondary Navigation Button과 같은 secondary 처리를 사용합니다.

| size | 버튼 | 아이콘 | 용도 |
|------|------|--------|------|
| icon-lg | 48px | 20px | 터치 강조·단독 액션 |
| icon | 40px | 16px | 기본 아이콘 버튼 |
| icon-sm | 32px | 16px | 내비게이션 바 (Secondary Navigation Button과 같은 높이) |
| icon-xs | 24px | 12px | 칩·인라인 보조 액션 |

허용 variant는 secondary(내비게이션), ghost(보조), default(주요 단독 액션)입니다.

### Input
**역할:** 한 줄 텍스트·숫자 입력 (예: 주소, 거리, 실제 착용 복장)

높이 48px, 가로 16px·세로 12px 패딩, **8px radius**(`--radius-input`), 1px Steel Border(`--input`) 외곽선, 투명 배경. 글자는 Pretendard 16px, placeholder는 `--color-placeholder`(#636366)입니다. 상태는 default / filled / focus(라임 외곽선) / disabled / invalid(`aria-invalid`, destructive 외곽선)입니다. 컨테이너 radius(20px)와 달리 입력창은 8px로 둡니다. 구현은 `Input`, Figma는 `Input` 컴포넌트(변수 `radius/input`)입니다. 여러 줄은 `Textarea`를 씁니다.

### Distance Input
**역할:** 거리(km)를 숫자로 직접 입력하거나 -/+로 조절

`Input`을 가운데 정렬로 쓰고, 오른쪽 안쪽(16px)에 단위 "km"를 얹습니다. 좌우에 Icon Button(`size="icon"`, default, 40px, Lucide Minus/Plus)을 12px 간격으로 둡니다. 입력 전에는 기본값(5)을 placeholder로 보여주되 입력한 값과 같은 흰색(`--foreground`)으로 써서 기본값이 들어 있는 것처럼 읽히게 하고, 거리 값으로 저장하지는 않습니다(단위 "km"도 항상 흰색). -/+는 0.5km씩, 0.5~100km 범위이며 범위를 벗어나는 글자는 `aria-invalid`로 알립니다. 구현은 `DistanceStepper`입니다.

### Feedback Sheet
**역할:** 다녀온 뒤 체감·거리·실제 복장을 한 번에 기록하는 바텀 시트

Card Charcoal(`--card`) 배경, 위쪽 모서리 32px radius, 오른쪽 위에 닫기(X) 버튼(32px 고스트 아이콘, 오른쪽·위 16px — 제목과 겹치지 않도록 머리글 오른쪽에 40px 여백), 가로 24px·위 28px 패딩, 아래 34px(홈 인디케이터 여백), 섹션 간격 36px. 위에서부터 ① 제목(Pretendard 700 18px `subheading-sm`, "오전 7:34 러닝, 어땠어요?" — 같은 날이면 날짜 말머리 없이, 지난 날이면 "어제 오전 7:34 러닝, 어땠어요?"처럼 "어제"(그보다 전이면 "10월 15일"처럼 월/일)를 앞에 붙임)과 체감 칩 3개(간격 8, 하나만 선택, 체크 없음) ② "몇 키로 뛰었나요? (선택)" + Distance Input ③ "실제 착용한 복장 (선택)" + 설명 + `Input`(placeholder "예: 나이키 반팔, 언더아머 반바지, 호카 러닝화") (②·③ 섹션 제목은 Pretendard 700 18px, `--text-subheading-sm`) ④ 저장(Button lg, 체감을 고르기 전에는 비활성) ⑤ "저장 안 할래요"(link, 회색) 순서입니다. "저장 안 할래요"를 누르면 이 활동 기록을 기록 화면에서 지웁니다(나중에 다시 묻지 않음). 닫기(X) 버튼과 바깥 탭·ESC로 닫으면 기록을 남기고, 앱을 다시 열 때 홈 상단 카드가 이어서 묻습니다. 뒤 화면은 검정 60% 오버레이로 덮습니다. 거리·복장은 선택 입력이라 비워 두고 저장할 수 있습니다. 구현은 `FeedbackForm`(입력 폼)을 종료 직후 `FeedbackSheet`(Dialog 기반)와 재방문 `FeedbackCard`가 함께 쓰는 구조이고 Figma는 개선안 페이지의 `Feedback Sheet / …` 프레임입니다.

### Score Breakdown Sheet
**역할:** 점수가 왜 그렇게 나왔는지 항목별로 보여주는 바텀 시트 (UT 인사이트: 점수 산정 근거 부족)

**점수 카드의 이유 한 줄:** 카드 맨 아래, 1px Card Border Ink 구분선 위 12px 간격. 왼쪽에 이유 문구(14px 500, Pure White)를, 오른쪽 끝에 "왜 이 점수예요?" 링크(14px, Subtle Text, 밑줄 오프셋 4px, 위아래 4px 패딩)를 둡니다. 이유 문구는 감점이 3점 이상인 항목을 큰 순서로 최대 2개까지 "미세먼지 −9점 · 바람 −5점"처럼 쓰고, 해당하는 항목이 없으면 "점수를 깎는 요인이 없어요"로 대신합니다. 질환·민감도 설정 때문에 더 엄격하게 본 항목이 있으면 그 아래에 "내 설정을 반영해 더 엄격하게 봤어요"를 Subtle Text 14px로 붙입니다.

**시트:** Feedback Sheet와 같은 모양(Card Charcoal, 위쪽 모서리 32px radius, 아래에서 올라옴, 오른쪽 위 닫기 버튼과 바깥 탭·ESC로 닫음)이고 높이는 화면의 85%까지, 넘치면 안에서 스크롤합니다. 위에서부터 ① 제목 "점수는 이렇게 계산돼요 (N점)"(18px, `subheading-sm`)과 설명(100점 만점 합산, 활동·설정에 따라 비중이 달라진다는 안내) ② 항목 목록입니다. 시트의 섹션 간격은 24px(설명과 항목 목록 사이)이고 항목끼리는 16px입니다. 항목은 감점이 큰 순서이며, 한 줄에 이름과 현재 값(단위 포함, Subtle Text, 이름과 값 사이 8px)·받은 점수/배점(숫자는 tabular)·깎인 점수(−N, 나쁨 레벨 색, 점수와 8px 간격)를 두고, 그 아래에 6px 높이 pill 막대(받은 비율만큼 라임, 나머지는 Card Border Ink)와 한 줄 해석("좋아요" / "보통이에요" / "점수를 많이 깎았어요", 14px)을 둡니다. "좋아요"는 Subtle Text 그대로 두고 "보통이에요"는 보통 레벨 색(주황), "점수를 많이 깎았어요"는 나쁨 레벨 색(빨강)으로 칠해, 대부분이 좋은 날에는 조용하고 감점 항목만 눈에 띄게 합니다. 항목 이름은 체감온도·기온·강수·바람·습도·미세먼지·일조 시간·자외선이고, 일조 시간의 값은 러닝·산책이 "해 떠 있음"/"해 짐", 등산·자전거는 "일몰까지 2.5시간"처럼 일몰까지 남은 시간입니다(한낮에도 일몰이 가까우면 감점되는 이유를 설명하기 위해서). 막대의 라임은 '채워진 상태'를 뜻하므로 활성 표시 규칙의 범위 안입니다. 스크롤 맨 끝에는 전체 너비 닫기 버튼(Button lg, Secondary — 시트 배경과 같은 Card Charcoal 면이라 구분되도록 Card Border Ink 면을 씀)을 둡니다. **선택한 시간 상세의 비교 한 줄:** 시간대 막대로 고른 시각의 `N점 좋음` 줄 바로 아래에 "지금보다 바람 +4점 · 미세먼지 −3점"처럼 지금과 항목 점수가 3점 이상 달라진 항목을 큰 순서로 최대 2개 보여줍니다(14px, Subtle Text, 올라가면 좋음 레벨 색 +, 내려가면 나쁨 레벨 색 −). 차이가 모두 3점 미만이면 "지금과 비슷한 조건이에요"로 대신하고, 지금 시각을 고른 경우에는 비교할 대상이 같아 표시하지 않습니다. 구현은 `ScoreDeltaLine`이고 계산은 `buildScoreDeltas`입니다.

구현은 `ScoreReasonLine`(이유 한 줄), `ScoreBreakdownSheet`(시트)이고 항목 계산은 `src/lib/scoreReasons.ts`, 문구와 기준값은 `src/constants/scoreReasons.ts`에 있습니다.

### Outfit Reason Line
**역할:** 복장을 왜 이렇게 추천했는지 홈의 복장 카드 안에서 바로 알려주는 근거 문구 (UT 인사이트: 옷차림 근거 부족)

복장 카드(Card Charcoal) 안, 아이콘 그리드 아래에 1px Card Border Ink 구분선(위 16px 간격, 구분선 아래 12px 패딩)을 두고 14px Subtle Text로 씁니다. 첫 줄은 기본 근거("체감 7°C 구간이라 기능성 긴팔 · 긴바지 차림으로 맞췄어요.")이고, 러닝·자전거는 "운동하면 체온이 올라 한 단계 가볍게 맞췄어요."를 이어 붙입니다. 둘째 줄은 비·강풍·어두움·자외선·미세먼지·찬 공기(비염)·무릎·빙판 때문에 더해진 장비를 "비가 와서 방수 바람막이 · 자외선이 강해 러닝 캡"처럼 우선순위 순서로 최대 2개까지 보여주며, 해당하는 장비가 없으면 줄 자체를 두지 않습니다. 추천 결과에 실제로 있는 장비만 설명하고, 같은 장비를 기본 근거에서 또 부르지 않습니다. AI 가이드 문단과 달리 규칙으로 만든 문구라 로딩·실패와 상관없이 아이콘과 항상 일치합니다. 구현은 `OutfitReasonLine`, 계산은 `src/lib/outfitReasons.ts`, 문구는 `src/constants/outfitReasons.ts`입니다.

### Navigation Bar
**역할:** 최상위 사이트 내비게이션

전체 너비의 Midnight Canvas(#111111) 바, 20px 컨테이너 radius, 6px/24px 패딩. Swoosh 로고 마크, Pure White(16px Plus Jakarta Sans / Pretendard 500)의 텍스트 내비게이션 링크, 오른쪽의 Secondary Navigation Button을 포함합니다. 은은한 0px 2px 6px rgba(17,17,17,0.125) 그림자가 딱딱한 구분선 없이 바를 고정해 줍니다.

### Hero Headline
**역할:** 화면을 가득 채우는 오프닝 디스플레이

Plus Jakarta Sans / Pretendard 700 110px, 줄 간격 0.85(한글은 1.4), Pure White(#ffffff), 왼쪽 정렬, 화면을 가득 채우는 어두운 사진 위에 오버레이. 극단적인 압축이 글자를 하나의 시각적 덩어리로 쌓아 이벤트 간판처럼 읽히게 합니다. 그 아래에 Plus Jakarta Sans / Pretendard 400 20px, 줄 간격 1.40의 20px 서브헤드가 이어집니다.

### White Floating Card
**역할:** 이미지 위에 놓이는 반전 텍스트 컨테이너

Pure White(#ffffff) 배경, 20px radius, 20-24px 패딩. Carbon Black의 heading-sm(24px / 1.20)과 Carbon Black의 본문(16px / 1.50)을 담습니다. 화면을 가득 채우는 어두운 사진 위에 떠서 잡지 표지 같은 레이어링 효과를 만듭니다.

### Dark Card
**역할:** 떠 있는 콘텐츠 패널

Card Charcoal(#1f1f21) 배경, 테두리 없음(면 대비로 구분), 20px radius, 20px 패딩. Midnight Canvas보다 한 단계 위에 놓이며, 같은 표면처럼 느껴질 만큼 은은하면서도 콘텐츠 블록을 담을 만큼 분명합니다.

### Confirm Dialog
**역할:** 되돌리기 어렵거나 실수하기 쉬운 동작을 한 번 더 묻는 확인 팝업 (러닝 종료 "러닝을 종료할까요?", 기록 삭제 "이 기록을 삭제할까요?")

Popover 면(Card Charcoal) 배경, 20px radius, 24px 패딩, 가운데 뜨는 Dialog입니다. 제목은 Pretendard 700 24px(`font-heading`, 줄 간격 1.2), 설명은 Subtle Text, 닫기 버튼은 두지 않으며 바깥 탭·ESC는 "취소"와 같습니다. **제목·설명과 버튼 영역 사이에 구분선을 두지 않습니다**(푸터의 `border-t`를 `border-t-0`으로 끔). 버튼은 같은 너비의 2열(간격 8px)로, 왼쪽이 안전한 선택지(outline, "계속하기"·"취소"), 오른쪽이 실행 버튼(default, "종료하기"·"삭제")입니다. 구현은 `EndActivityDialog`, `DeleteEntryDialog`입니다.

### Cookie Settings Modal
**역할:** 오버레이 환경설정 패널

Card Charcoal(#1f1f21) 배경, 20px radius, 24px 패딩, 1px Card Border Ink 테두리. 제목은 Pure White, 본문은 16px / 1.50의 Pure White, 체크 상태에 Lime Pulse를 쓰는 체크박스 컨트롤, 하단에 고정된 Primary CTA Button으로 구성됩니다.

### Marquee Display Section
**역할:** 흘러가는 초대형 헤드라인

가운데 정렬된 Plus Jakarta Sans / Pretendard 700 64-110px, 줄 간격 1.00-0.85(한글은 1.4), Midnight Canvas 위의 Pure White. '.SWOOSH IS NIKE'S HOME FOR GAMING' 같은 문장에 사용합니다. 거대한 크기와 압축된 행간이 텍스트가 움직일 때 광고판 같은 리듬을 만듭니다.

### Section Heading Pair
**역할:** 흘러가는 에디토리얼 헤드라인 + 캡션

가운데 정렬된 큰 Pure White 디스플레이 줄(64-110px Plus Jakarta Sans / Pretendard 700)과 그 위나 아래에 14-16px Plus Jakarta Sans / Pretendard 500의 작은 대문자 또는 문장형 캡션. 페이지 전반에 토너먼트 발표 같은 리듬을 만듭니다.

### Image Card
**역할:** 사진 또는 렌더 컨테이너

20px radius, 컨테이너 안에서 가득 채움, 맥락에 따라 1px Steel Border(#707072) 또는 테두리 없음. White Floating Card가 자주 겹치거나 오버레이 텍스트와 짝을 이룹니다. 사진은 어둡고 대비가 높으며 바짝 크롭되어, 사물이나 사람이 곧 콘텐츠입니다.

### Footer
**역할:** 하단 구조 영역

Midnight Canvas 배경, 1px Footer Rule(#39393b) 상단 테두리, 14px / 1.50의 Pure White 작은 텍스트 링크, 넉넉한 세로 패딩(48-64px). 미니멀하게 — 무거운 카드 처리나 이미지는 쓰지 않습니다.

## 홈 화면 구성
위에서 아래로: 위치·현재 시각 → 활동 칩 → 헤드라인(24px) → 점수·날씨 카드(링 88px, 지표 6칸, 맨 아래에 구분선 위로 "점수가 깎인 이유" 한 줄과 "왜 이 점수예요?" 링크 — 아래 Score Breakdown Sheet 참고) → 베스트 시간(카드 최대 2장: 1순위 온보딩에서 고른 시간대, 2순위 오늘 가장 좋은 오전 1개 + 오후 1개, 3순위 오전이 지났으면 오늘 오후 1개 + 내일 가장 좋은 오전 1개(좋은 오전이 없으면 내일 오후). '좋은' 기준은 좋음 배지(70점 이상). 한 장이면 시각과 배지·점수를 한 줄에 나란히 두고 배지를 오른쪽 끝에 배치) → 현재 날씨 추천 복장(가이드 문단 + 복장 카드와 팁 불릿, 복장 이름은 띄어쓰기에서만 줄바꿈 — `break-keep`) → 시간대 막대 차트(제목은 연속 구간이 있으면 "오늘 18~20시 러닝하기 좋아요"처럼 구간을, 없으면 "오늘 러닝은 21시가 가장 좋아요."처럼 대표 시각을 Lime Pulse로 강조하며 점수는 적지 않습니다) → 선택한 시간 상세(지표 6칸). 섹션 사이는 40px, 차트와 상세 사이는 24px입니다. 차트는 점수 단계로 막대 색을 정하고(좋음 라임, 보통·나쁨 레벨 색), 선택한 막대만 불투명, 나머지는 40%, 22시 이후와 내일은 15%로 흐리게 그립니다. 22시 이후는 추천에서 제외한다는 구분선과 안내를 차트에 표시합니다. 차트의 가로 스크롤바는 기본 오버레이 대신 4px 막대(트랙 Card Border Ink, 썸 Steel Border, 둥근 끝)로 그리고, 평소에는 숨겼다가 좌우로 스크롤하는 동안에만 보여 줍니다(마지막 스크롤 1초 뒤 다시 숨김). 시간 라벨과 겹치지 않도록 라벨 아래 12px 여백 아래에 둡니다(`chart-scrollbar`, `data-scrolling`). [이대로 출발하기]는 탭바 위 12px에 고정하고, 본문은 CTA에 가리지 않도록 아래 여백을 둡니다. 정보 패널(점수 카드, 복장 카드, 지표 타일, 베스트 시간 카드)은 테두리 없이 면 대비로 구분합니다.

## 기록 화면 구성
위에서 아래로: 제목 "활동 기록"(24px)과 오른쪽 끝의 "오늘" 칩(누르면 오늘 날짜와 이번 달로 돌아옴) → 월 달력 카드 → 선택한 날짜 제목(16px 700) → 그날의 기록 카드 → "그날의 추천 보기" 접기 줄. 달력과 기록 카드는 테두리 없이 Card Charcoal 면으로 구분합니다. 달력은 오늘을 라임색 숫자, 선택한 날을 흰 원(오늘이면 라임 원), 미래 날짜를 흐리게 그리고 기록이 있는 날 아래에 활동 색 점을 찍습니다. 주 보기는 두지 않습니다(월 보기만).

**기록 카드:** 20px radius, 24px 패딩. ① 시작 시각(16px, Subtle Text — 진행 중이면 뒤에 "진행 중 · 00:21"을 라임색으로) ② 활동 이름(20px 700)과 오른쪽 끝의 체감 결과("체감 적당했어요", 16px — 적당했어요는 좋음 레벨 색 파랑, 추웠어요·더웠어요는 보통 레벨 색 주황) ③ 거리·페이스·시간을 24px 700 숫자 위, 14px Subtle Text 이름 아래로 나란히(칸 너비 균등, 값이 없는 칸은 빼고, 진행 중이면 숫자 줄 전체를 그리지 않음) ④ 아직 체감을 못 남겼고 남길 수 있으면 체감 선택지 ⑤ 날씨(16px, 이름은 Subtle Text)와 실제 복장 줄. 이름과 값 사이는 8px입니다(체감 결과도 같음). 페이스는 `6′49″` 형식이며 거리와 시간이 모두 있을 때만 `시간 ÷ 거리`로 계산합니다. 거리나 시간이 없는 기록(타이머 없이 만든 기록, '다음에 할게요')은 해당 칸이 없어도 카드가 자연스럽게 보여야 합니다.

**더보기(⋮) 메뉴:** 카드 오른쪽 위(오른쪽·위 12px)에 32px 고스트 아이콘 버튼(세로 점 3개)을 두고, 누르면 Card Border Ink(#28282a) 면의 12px radius 메뉴가 열립니다(항목에 마우스를 올리거나 키보드로 고르면 Card Charcoal 면에 같은 12px radius로 강조). 항목은 "거리·복장 수정"과 "삭제"(나쁨 레벨 색)입니다. 진행 중인 기록에는 메뉴를 두지 않습니다. "거리·복장 수정"은 피드백 시트와 같은 바텀 시트(제목 "기록 수정", 거리·실제 복장 입력, 저장 / 취소)로 열리며 현재 값에서 시작하고 둘 다 비우면 둘 다 지웁니다. 체감은 여기서 고치지 않습니다. "삭제"는 확인 팝업("이 기록을 삭제할까요?" / "삭제한 기록은 되돌릴 수 없어요." / 취소·삭제 — 종료 확인 팝업과 같은 모양)을 거친 뒤에만 지웁니다. 이벤트는 `history_entry_edited`, `history_entry_deleted`입니다. 구현은 `HistoryEntryMenu`, `HistoryEditSheet`, `DeleteEntryDialog`입니다.

**그날의 추천 보기:** 카드 아래에 접힌 줄(14px Subtle Text + 화살표, 열면 화살표가 뒤집힘)로 두고, 열면 그날의 AI 가이드와 추천 복장 카드가 나옵니다. "추천 복장 ↔ 실제 복장"을 비교할 수 있게 유지하되 기본은 접어 기록 카드를 깔끔하게 보여줍니다. 열 때 `history_recommendation_opened` 이벤트를 보냅니다. 구현은 `HistoryEntryStatus`, `HistoryStats`, `HistoryRecommendation`입니다.

## Do와 Don't

### Do
- #b7ff2c는 채워진 CTA 버튼, 활성/체크 상태에만 사용할 것 — 본문 텍스트, 장식용 배경, 넓은 면에는 절대 사용 금지
- 카드, 내비게이션, 모달, 이미지 등 모든 컨테이너에 20px border radius를 적용하고, 버튼은 pill(9999px)로 통일해 일관된 형태를 유지할 것
- 디스플레이 헤드라인은 110px Plus Jakarta Sans / Pretendard 700, 줄 간격 0.85로 설정할 것(영문 기준). 1.0 미만의 행간이 시그니처 압축이다. 한글 헤드라인은 글자가 겹치므로 줄 간격 1.4로 설정할 것
- #111111을 기본 페이지 배경으로, #1f1f21을 카드와 모달의 한 단계 높은 표면으로 사용할 것
- 화면을 가득 채우는 어두운 사진을 Pure White(#ffffff) 플로팅 카드와 짝지어 포스터 스타일 레이어링을 만들 것
- #e5e5e5 테두리는 반전된(흰 표면) 맥락에서만 사용하고, 어두운 표면에서는 #28282a 또는 #707072를 사용할 것
- 카드(점수·복장·베스트 시간 같은 정보 패널, 설정·온보딩·피드백 카드, 가이드 박스 모두)는 테두리 없이 Card Charcoal 면 대비로 구분할 것 — 테두리가 있는 것은 팝업(Dialog)과 입력창뿐이다
- 어두운 표면의 본문 텍스트는 16px Plus Jakarta Sans / Pretendard 400, 줄 간격 1.50, Pure White로 설정할 것
- 지표 이름, 보조 설명 같은 서브 텍스트는 Subtle Text(#8e8e90, `text-subtle-text`)를 사용할 것 — 어두운 카드 위에서 대비 4.5:1 이상을 확보한다. Steel Border(#707072)는 대비가 약 3.4:1이라 글자에 쓰지 않는다

### Don't
- 작은 요소(메뉴 항목, 타일)에 Tailwind의 `rounded-lg`·`rounded-xl`을 쓰지 말 것 — 이 프로젝트에서는 각각 20px·28px로 계산되어 의도보다 크게 둥글어진다. `rounded-[12px]`처럼 값을 직접 지정한다
- 서브 텍스트·placeholder에 Steel Border(#707072)를 글자 색으로 쓰지 말 것 — 서브 텍스트는 Subtle Text(#8e8e90), placeholder는 Placeholder(#636366)를 쓴다
- 두 번째 유채색을 도입하지 말 것 — 이 시스템은 모노크롬에 라임 하나다. 파랑, 빨강 등 어떤 색을 더해도 신호가 깨진다. 유일한 예외는 등급 표시용 '상태 레벨 색'과, 같은 코랄(#ff7a6b)을 쓰는 오류·위험 표시(Destructive)다
- 컨테이너에 0px 또는 28px 이상의 border radius를 사용하지 말 것(버튼의 pill, 입력창의 8px 제외) — 20px radius가 부드럽지만 느슨하지 않은 이 시스템의 정체성이다
- 영문 디스플레이 헤드라인의 줄 간격을 1.2 이상으로 설정하지 말 것 — 0.85-1.00의 압축이 타입을 간판처럼 느끼게 한다. 한글 헤드라인은 예외로 1.4를 사용한다
- 내비게이션 바의 2px 블러를 넘는 드롭 섀도를 사용하지 말 것 — 평평함은 의도된 것이다
- 라임(#b7ff2c)을 제목, 서브헤딩, 본문 텍스트에 적용하지 말 것 — 액션 전용이다
- 어두운 표면의 테두리에 #e5e5e5를 사용하지 말 것 — 너무 밝다. 흰 카드 맥락에 한정할 것
- 표면 컨테이너 없이 버튼이나 카드를 사진 위에 바로 올리지 말 것 — 플로팅 카드는 흰색 또는 차콜 배경이 있어야 읽힌다

## 표면

| 레벨 | 이름 | 값 | 용도 |
|-------|------|-------|---------|
| 0 | Midnight Canvas | `#111111` | 페이지 기반, 히어로 배경, 전체 폭 섹션 |
| 1 | Card Charcoal | `#1f1f21` | 캔버스 위에 놓이는 카드, 모달, 콘텐츠 패널 |
| 2 | Inverted White | `#ffffff` | 어두운 사진 위의 흰색 플로팅 카드, 반전 텍스트 패널 |

## 엘리베이션

- **내비게이션 바:** `0px 2px 6px 0px rgba(17, 17, 17, 0.125)`

## 이미지

사진은 화면을 가득 채우고 대비가 높으며 어두운 분위기입니다. 게임 컨트롤러를 쥔 손, 움직이는 사람들, 아레나 환경, 스니커즈와 게임 장비의 클로즈업 크롭이 대표적입니다. 처리는 어둡고 약간 채도를 낮추며, 깊은 검정이 #111111 캔버스와 이어지도록 합니다. 라이프스타일의 부드러움은 없으며, 피사체는 에디토리얼 의도로 연출되고 사물이나 제스처가 프레임을 채우도록 바짝 크롭됩니다. 흰색 텍스트와 흰색 플로팅 카드는 스크림 없이 사진 위에 바로 올라가 잡지 표지 또는 아레나 포스터 같은 레이어링을 만듭니다. 아이콘은 최소한으로, Pure White의 Swoosh 로고와 작은 UI 아이콘만 사용합니다. 일러스트, 3D 렌더, 장식 그래픽은 없으며, 분위기는 전적으로 사진이 담당합니다.

## 레이아웃

지속적인 최대 너비 컨테이너가 없는 전체 폭 다크 레이아웃으로, 섹션은 1440px 뷰포트 기준으로 좌우 끝까지 펼쳐집니다. 히어로는 화면을 가득 채우는 사진 이미지로 시작하고, 왼쪽 정렬된 디스플레이 헤드라인이 왼쪽 하단에 오버레이되며 그 아래에 라임 CTA가 놓입니다. 내비게이션은 왼쪽 로고, 가운데 텍스트 링크, 오른쪽 보조 버튼로 구성된 고정 상단 바입니다. 페이지 리듬은 전체 폭 다크 이미지 섹션, 가운데 정렬된 마키 텍스트 섹션(순수한 검정 위의 거대한 헤드라인), 어두운 사진 위에 White Floating Card가 놓이는 분할 레이아웃이 번갈아 나타납니다. 디스플레이 타입이 숨 쉴 수 있도록 섹션 간격은 넉넉합니다(48-64px). 콘텐츠는 대체로 가운데 또는 왼쪽 정렬이며, 비대칭이거나 그리드 중심의 구성은 없습니다. 모달(쿠키 설정)은 오른쪽 상단에 고정되며 전체 폭이 아닌 유일한 오버레이입니다.

## 에이전트 프롬프트 가이드

**빠른 색상 참조**
- 텍스트: #ffffff
- 배경: #111111
- 서브 텍스트(어두운 표면): #8e8e90
- 테두리(어두운 표면): #28282a / #707072
- 테두리(흰 표면): #e5e5e5
- 포인트: #b7ff2c
- 주요 액션: #b7ff2c (채워진 액션)

**컴포넌트 프롬프트 예시**

1. Primary Action Button 만들기: #b7ff2c 배경, #000000 텍스트, 9999px radius, 컴팩트한 알약형 패딩. 메인 CTA에 이 채워진 처리를 사용합니다.

2. *Primary CTA 버튼*: 9999px border radius(pill), 세로 패딩 16px, 가로 패딩 20px, 배경 #b7ff2c, 1px solid #b7ff2c 테두리, 텍스트 #000000, Plus Jakarta Sans / Pretendard 700 16px, 줄 간격 1.20. 그림자 없음. 페이지에서 유일하게 채도가 높은 요소이며 시각적 초점이 되어야 합니다.

3. *어두운 사진 위의 흰색 플로팅 카드*: 배경 #ffffff, 20px border radius, 24px 패딩. 제목은 Plus Jakarta Sans / Pretendard 700 24px, 줄 간격 1.20, 색상 #000000. 본문은 Plus Jakarta Sans / Pretendard 400 16px, 줄 간격 1.50, 색상 #000000. 스크림 없이 화면을 가득 채우는 어두운 이미지 위에 떠 있습니다.

4. *마키 디스플레이 섹션*: 배경 #111111, 가운데 정렬 헤드라인 Plus Jakarta Sans / Pretendard 700 110px, 줄 간격 0.85(한글은 1.4), 색상 #ffffff. 버튼도 이미지도 없이 타입만 뷰포트 높이를 채웁니다.

5. *내비게이션 바*: 전체 너비 배경 #111111, 20px 컨테이너 radius, 16px/24px 패딩, 은은한 0px 2px 6px rgba(17,17,17,0.125) 그림자. 왼쪽에 Swoosh 로고, Plus Jakarta Sans / Pretendard 500 16px 색상 #ffffff의 내비게이션 링크, 오른쪽에 secondary SIGN IN 버튼(#1f1f21 배경, #ffffff 텍스트, 테두리 없음, 9999px radius(pill), 8px/20px 패딩).

## 그라디언트 시스템

이 시스템에서는 그라디언트를 사용하지 않습니다. 모든 색상 전환은 평평하며, 표면 값의 이동(#111111 → #1f1f21 → #ffffff)과 단 하나의 유채색 포인트(#b7ff2c)가 모든 시각적 변화를 제공합니다. 선형 또는 방사형 그라디언트를 도입하지 마세요. 포스터처럼 평평한 미학이 깨집니다.

## 유사 브랜드

- **Adidas Confirmed** — 같은 다크 모드 + 단일 네온 포인트 패턴. 둘 다 드롭 공지와 오버레이 타입이 얹힌 전체 폭 제품 사진을 사용
- **PlayStation Store** — 굵고 압축된 디스플레이 타입과 전체 폭 히어로 사진을 쓰는 다크 게이밍 플랫폼 미학. 다만 Swoosh는 PlayStation의 파란 그라디언트와 달리 라임 하나로 더 절제됨
- **Gucci Garden / Vault** — 어두운 배경의 전체 폭 사진 위에 거대한 압축 헤드라인이 떠 있는 에디토리얼 포스터 레이아웃
- **Off-White / Virgil Abloh 아카이브** — 패션/게이밍 크로스오버에서 보이는 초대형 압축 산세리프 헤드라인, 따옴표 타이포그래피 모티프, 고대비 블랙-화이트-라임 컬러 로직
- **Apple Arcade** — 눈에 띄는 전체 폭 이미지와 디스플레이 규모 타이포그래피의 다크 게이밍 플랫폼 UI. 다만 Swoosh는 포인트 하나로 더 모노크롬에 가까움

## 빠른 시작

### CSS 커스텀 프로퍼티

```css
:root {
  /* Colors */
  --color-lime-pulse: #b7ff2c;
  --color-midnight-canvas: #111111;
  --color-card-charcoal: #1f1f21;
  --color-card-border-ink: #28282a;
  --color-footer-rule: #39393b;
  --color-steel-border: #707072;
  --color-subtle-text: #8e8e90;
  --color-placeholder: #636366;
  --color-fog-border: #e5e5e5;
  --color-pure-white: #ffffff;
  --color-carbon-black: #000000;

  /* 상태 레벨 색 (등급 표시 전용) */
  --color-level-good: #4da3ff;
  --color-level-normal: #ff9a3c;
  --color-level-bad: #ff7a6b;

  /* Typography — Font Families */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', 'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-pretendard: 'Pretendard Variable', Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", ui-sans-serif, system-ui, sans-serif;
  --font-ui-sans-serif: 'ui-sans-serif', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-subheading-sm: 18px;
  --leading-subheading-sm: 1.4;
  --text-subheading: 20px;
  --leading-subheading: 1.4;
  --text-heading-sm: 24px;
  --leading-heading-sm: 1.2;
  --text-heading-lg: 64px;
  --leading-heading-lg: 1;
  --text-display: 110px;
  --leading-display: 0.85;
  --leading-heading-ko: 1.4;
  --tracking-ko-display: -0.01em;
  --tracking-ko-heading: 0.02em;
  --tracking-ko-subheading: -0.01em;
  --tracking-ko-body: 0;
  --tracking-ko-small: 0.01em;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-36: 36px;
  --spacing-48: 48px;
  --spacing-96: 96px;
  --spacing-144: 144px;

  /* Layout */
  --page-max-width: 1440px;
  --section-gap: 48-64px;
  --card-padding: 20-24px;
  --element-gap: 16-20px;

  /* Border Radius */
  --radius-md: 20px;

  /* Named Radii */
  --radius-nav: 20px;
  --radius-cards: 20px;
  --radius-images: 20px;
  --radius-modals: 20px;
  --radius-input: 8px;
  --radius-buttons: 9999px;

  /* Shadows */
  --shadow-sm: rgba(17, 17, 17, 0.125) 0px 2px 6px 0px;

  /* Surfaces */
  --surface-midnight-canvas: #111111;
  --surface-card-charcoal: #1f1f21;
  --surface-inverted-white: #ffffff;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-lime-pulse: #b7ff2c;
  --color-midnight-canvas: #111111;
  --color-card-charcoal: #1f1f21;
  --color-card-border-ink: #28282a;
  --color-footer-rule: #39393b;
  --color-steel-border: #707072;
  --color-subtle-text: #8e8e90;
  --color-placeholder: #636366;
  --color-fog-border: #e5e5e5;
  --color-pure-white: #ffffff;
  --color-carbon-black: #000000;

  /* 상태 레벨 색 (등급 표시 전용) */
  --color-level-good: #4da3ff;
  --color-level-normal: #ff9a3c;
  --color-level-bad: #ff7a6b;

  /* Typography */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', 'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-pretendard: 'Pretendard Variable', Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", ui-sans-serif, system-ui, sans-serif;
  --font-ui-sans-serif: 'ui-sans-serif', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-subheading-sm: 18px;
  --leading-subheading-sm: 1.4;
  --text-subheading: 20px;
  --leading-subheading: 1.4;
  --text-heading-sm: 24px;
  --leading-heading-sm: 1.2;
  --text-heading-lg: 64px;
  --leading-heading-lg: 1;
  --text-display: 110px;
  --leading-display: 0.85;
  --leading-heading-ko: 1.4;
  --tracking-ko-display: -0.01em;
  --tracking-ko-heading: 0.02em;
  --tracking-ko-subheading: -0.01em;
  --tracking-ko-body: 0;
  --tracking-ko-small: 0.01em;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-36: 36px;
  --spacing-48: 48px;
  --spacing-96: 96px;
  --spacing-144: 144px;

  /* Border Radius */
  --radius-md: 20px;
  --radius-input: 8px;

  /* Shadows */
  --shadow-sm: rgba(17, 17, 17, 0.125) 0px 2px 6px 0px;
}
```
