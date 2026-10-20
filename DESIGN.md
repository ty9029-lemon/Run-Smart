# Home — 스타일 레퍼런스
> 한밤중의 네온 게이밍 아레나 — 검은 바닥, 단 하나의 일렉트릭 라임, 그리고 벽에서 외치는 토너먼트 규모의 타이포그래피.

**테마:** 다크 + 라이트. 기본은 기기 설정(시스템)을 따르고, 설정 화면에서 시스템/라이트/다크 중 직접 고를 수 있습니다. 아래 색상·표면·컴포넌트 설명은 다크를 기준으로 쓰였고, 라이트에서 값이 달라지는 부분은 '테마' 절에 모았습니다.

원본 측정값은 정규화되었으며, 역할과 권장 사항은 해석을 거친 것입니다. 폰트 요약 목록은 서로 독립적이며 순서대로 짝지어지지 않습니다. HTML 예시는 원본 컴포넌트가 아니라 재구성한 것입니다.

Swoosh는 한밤중의 아레나 콘솔처럼 작동합니다. 거의 완전한 검정 캔버스(#111111), 모든 인터랙션을 담당하는 단 하나의 일렉트릭 라임 포인트 컬러(#b7ff2c), 그리고 웹 카피가 아니라 토너먼트 간판처럼 기능하는 초대형 압축 디스플레이 타입(110px, 줄 간격 0.85)으로 구성됩니다. 이 시스템은 의도적으로 절제되어 있습니다. 유채색은 단 하나뿐이며, 채워진 CTA 버튼과 얇은 액션 테두리에만 등장하기 때문에 라임은 어둠 속에서 '켜진' 것처럼 보입니다. 사진은 화면을 가득 채우는 어두운 분위기이며, 그 위에 흰색 또는 흰색에 가까운 카드가 떠 있어 에디토리얼 타이포그래피와 사진이 번갈아 나타나는 포스터 같은 레이어링을 만듭니다. 영문은 Plus Jakarta Sans, 한글은 Pretendard가 모든 크기에서 목소리를 담당합니다. 굵고 촘촘한 디스플레이 웨이트가 시그니처이며, 카드·내비게이션·이미지 컨테이너의 20px radius와 pill 형태의 버튼이 설계된 듯한 일관된 둥근 형태를 줍니다.

## 토큰 — 색상

| 이름 | 값 | 토큰 | 역할 |
|------|-------|-------|------|
| Lime Pulse | `#b7ff2c` | `--color-lime-pulse` | 채워진 버튼, 선택된 내비게이션 상태, 집중해야 할 전환 순간에 쓰는 초록색 액션 컬러 |
| Midnight Canvas | `#111111` | `--color-midnight-canvas` | 페이지 배경, 히어로 캔버스, 내비게이션 표면, 본문 기반 — 나머지 모든 것이 놓이는 구조적 바닥 |
| Card Charcoal | `#1f1f21` | `--color-card-charcoal` | 떠 있는 카드 표면, 모달 배경, 패널 기반 — 레이어드 컨테이너를 위해 Midnight Canvas보다 한 단계 위 |
| Card Border Ink | `#28282a` | `--color-card-border-ink` | 카드 외곽 테두리 — 모노크롬을 깨지 않으면서 컨테이너를 정의하는 거의 보이지 않는 윤곽선 |
| Footer Rule | `#39393b` | `--color-footer-rule` | 푸터 상단 테두리, 페이지 영역 사이의 구조적 구분선 |
| Steel Border | `#707072` | `--color-steel-border` | 카드 윤곽 테두리, 이미지 프레임 가장자리 — 눈에 띄되 조용한 구분을 위한 중간 대비의 중성색 |
| Fog Border | `#e5e5e5` | `--color-fog-border` | 라이트 모드 헤어라인 테두리, 텍스트/제목 밑줄, 아이콘 스트로크 — 반전된 맥락(흰 카드, 밝은 표면)에서 등장 |
| Pure White | `#ffffff` | `--color-pure-white` | 어두운 표면 위의 밝은 텍스트, 반전 라벨, 고대비 캡션. 기본 CTA 컬러로 승격하지 말 것 |
| Carbon Black | `#000000` | `--color-carbon-black` | 밝은 표면 위의 주요 제목, 본문 텍스트, 아이콘 채움. 기본 CTA 컬러로 승격하지 말 것 |

## 테마 (라이트 / 다크)

위 색상 표는 원색 팔레트입니다. 화면에서는 모드에 따라 값이 바뀌는 **시맨틱 토큰**을 쓰고, 컴포넌트는 팔레트 이름(`bg-card-charcoal` 등) 대신 시맨틱 클래스(`bg-card`, `text-muted-foreground`, `border-border`)를 사용합니다. 다크 값은 `.dark`, 라이트 값은 `:root`에 두며, `<html>`의 `dark` 클래스로 전환합니다.

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--background` | `#111111` Midnight Canvas | `#ffffff` | 페이지 배경 |
| `--foreground` | `#ffffff` Pure White | `#111111` | 기본 텍스트 |
| `--card` | `#1f1f21` Card Charcoal | `#ffffff` | 카드·패널 표면 (라이트는 배경과 같은 흰색, `--border` 테두리로 구분) |
| `--muted`, `--secondary` | `#1f1f21` | `#f4f4f5` | 보조 버튼·호버 표면 |
| `--popover` | `#1f1f21` | `#ffffff` | 모달·팝오버 표면 |
| `--muted-foreground` | `#707072` Steel Border | `#66666a` | 보조 텍스트 |
| `--accent` | `#28282a` Card Border Ink | `#ececee` | 호버·눌림 표면 |
| `--border` | `#28282a` Card Border Ink | `#e5e5e5` Fog Border | 카드 테두리, 구분선 |
| `--input` | `#707072` Steel Border | `#8e8e91` | 입력·칩·라디오의 윤곽선 |
| `--primary` | `#b7ff2c` Lime Pulse | `#b7ff2c` | 채워진 CTA 배경 (양쪽 동일) |
| `--primary-foreground` | `#000000` | `#000000` | 라임 위 글자 (양쪽 동일) |
| `--highlight` | `#b7ff2c` | `#111111` | 활성 상태의 글자·아이콘·테두리 |
| `--selected` | `#b7ff2c1a` (라임 10%) | `#b7ff2c` (라임 채움) | 선택된 민감도 원의 면 |
| `--chip-selected` | `#b7ff2c1a` (라임 10%) | `#b7ff2c2e` (라임 18%) | 선택된 칩의 배경 |
| `--chip-border` | `#707072` Steel Border | `#e5e5e5` Fog Border | 선택 전 칩의 외곽선 |
| `--switch-off` | `#707072` Steel Border | `#d4d4d6` | 꺼진 스위치의 트랙 |
| `--outline-border` | `#b7ff2c` | `#dfdfdf` | outline 버튼 외곽선 (글자는 `--highlight`) |
| `--outline-border-disabled` | `#b7ff2c` | `#a1a1a3` | 비활성 outline 버튼 외곽선 (투명도 40%가 겹쳐도 윤곽이 남도록 기본보다 진함) |
| `--chip-border-selected` | `#b7ff2c` | `#b7ff2c` | 선택된 칩의 외곽선 (양쪽 모드 같은 라임) |
| `--toast` | `#ffffff` | `#111111` | 토스트 면 (배경과 반대 톤) |
| `--toast-foreground` | `#000000` | `#ffffff` | 토스트 글자 |
| `--toast-border` | `#e5e5e5` | `#28282a` | 토스트 외곽선 |
| `--toast-shadow` | `0 8px 24px -4px rgb(0 0 0 / 0.6)` | `0 8px 24px -4px rgb(0 0 0 / 0.12)` | 토스트 그림자 (내비게이션 바 외 유일한 그림자) |
| `--ring` | `#b7ff2c` | `#111111` | 포커스 링 |
| `--destructive` | `#ff7a6b` | `#c4301f` | 파괴적 액션. 붉은 글자 + 10% 붉은 면 (라임 외 유일한 예외 색, 점수 '경고'와 같은 값) |
| `--score-caution` | `#ffc24b` | `#9a5b00` | 점수 '주의' 등급 글자·막대 |
| `--score-warn` | `#ff7a6b` | `#c4301f` | 점수 '경고' 등급 글자·막대 |
| `--chart-1` ~ `--chart-4` | `#b7ff2c`, `#ffffff`, `#707072`, `#39393b` | `#111111`, `#66666a`, `#a1a1a3`, `#d4d4d6` | 차트 계열 (3개 이하 권장) |

### 라이트 모드 규칙

- **라임은 면에만 씁니다.** `#b7ff2c`는 흰 배경에서 글자·아이콘·선으로 쓰면 대비가 1.1:1 수준이라 보이지 않습니다. 채워진 CTA(라임 배경 + 검정 글자 `17.35:1`)는 양쪽 모드가 같고, 활성 탭 글자나 선택된 칩의 글자·테두리처럼 라임을 글자·선으로 쓰던 곳은 `--highlight`(다크는 라임, 라이트는 `#111111`)를 씁니다.
- **선택된 칩은 옅은 라임 면 + 라임 외곽선입니다(체크 아이콘 없음).** 라이트·다크 같은 규칙이고, 면은 다크 라임 10%·라이트 라임 18%(흰 카드 위에서도 보이도록 조금 더 진하게), 글자는 `--highlight`(다크 라임, 라이트 `#111111`)입니다. 패딩은 좌우 20, 높이 35로 선택 전 칩과 같아 선택해도 크기가 변하지 않습니다. 라임 외곽선은 흰 배경에서 대비가 낮으므로 선택은 면 색과 외곽선이 함께 알립니다. 이 모양은 **여러 개를 고르는 토글 전용**입니다. 하나만 고르고 바로 제출하는 선택지(예: FeedbackCard의 추웠어요/적당했어요/더웠어요)는 칩이 아니라 outline 버튼을 씁니다.
- **민감도 원은 선택되면 면만 바뀝니다.** 라이트는 라임으로 채우고(`--selected`) 다크는 라임 10% 면입니다. 외곽선은 선택 전과 같은 `--input` 색·1.5px 굵기를 유지합니다. 체크박스는 라임 면 + `--highlight` 테두리·체크이며, 브라우저 기본 컨트롤 대신 `Checkbox` 컴포넌트를 씁니다(기본 컨트롤의 `accent-color`는 모드별 테두리를 줄 수 없음).
- **outline 버튼은 연한 회색 외곽선 + 진한 글자입니다.** 외곽선은 `--outline-border`(라이트 `#dfdfdf`, 다크 라임), 글자는 `--highlight`입니다. 비활성은 `--outline-border-disabled`(라이트 `#a1a1a3`)에 투명도 40%를 적용합니다. 라이트에서는 outline이 secondary(옅은 회색 면)와 비슷한 무게가 되므로 한 화면에서 둘을 같이 쓰지 않는 것이 좋습니다.
- **destructive는 붉은 글자 + 10% 붉은 면입니다.** `--destructive`를 쓰고, 값은 점수 '경고'와 같습니다(라이트 `#c4301f`, 다크 `#ff7a6b`). 채운 붉은 버튼은 쓰지 않아 화면의 유일한 채운 면은 라임 CTA로 남습니다.
- **토스트는 배경과 반대 톤입니다.** 다크는 흰 면 + 검정 글자, 라이트는 `#111111` 면 + 흰 글자(`--toast*`)로 배경에 묻히지 않게 합니다. 안의 [실행 취소]는 알약 없는 ghost 버튼이고, 그림자는 `--toast-shadow`(토스트만 예외)입니다.
- **'라임 하나' 원칙은 유지합니다.** 라이트에서 라임 대체용으로 진한 초록 등 두 번째 유채색을 만들지 않습니다. 단 destructive의 붉은색은 의미를 전달하는 예외입니다. 활성 구분이 약해지는 곳(하단 탭바)은 라임 막대를 더해 보강합니다.
- **표면 단계는 뒤집힌 순서입니다.** 라이트는 카드(`--card`)를 배경과 같은 흰색으로 두고 `--border`로만 윤곽을 줍니다. 면 밝기 차이 대신 테두리로 단계를 나누므로, 라임 채움이 항상 흰 면 위에 놓여 더 선명합니다.
- **보조 텍스트 대비를 지킵니다.** 라이트의 `--muted-foreground`(`#66666a`)는 흰 배경에서 `5.72:1`, 카드 위에서 `5.20:1`로 본문 기준 4.5:1을 넘깁니다. 이보다 연한 회색은 글자에 쓰지 않습니다.
- **점수 등급 색은 모드별로 따로 둡니다.** 다크용 밝은 노랑·분홍은 흰 배경에서 읽히지 않아, 라이트는 `4.5:1` 이상이 나오는 어두운 값(`#9a5b00`, `#c4301f`)을 씁니다. 라임 '좋음' 막대는 라이트의 카드 위에서 대비가 낮으므로(`1.10:1`), 막대만으로 등급을 전하지 말고 점수 숫자를 함께 보여줍니다.
- **White Floating Card는 양쪽 모드에서 흰 배경 + 검정 글자로 고정합니다.** 어두운 사진 위에 올리는 용도이기 때문에 모드에 따라 뒤집지 않습니다.
- **색을 직접 쓰지 않습니다.** 컴포넌트에 `bg-white`, `text-black`, hex를 쓰지 말고 시맨틱 클래스를 씁니다. 반투명 오버레이는 `bg-foreground/5`처럼 `foreground`에 알파를 줍니다. SVG는 `var(--border)`, `var(--highlight)`처럼 변수를 참조합니다.
- **`dark:` 변형은 쓰지 않습니다.** 값이 토큰에서 이미 모드별로 갈리므로, 컴포넌트에서 `dark:` 분기를 더하면 두 곳에서 색을 관리하게 됩니다. 라이트에서만 필요한 보강(탭 인디케이터 등)은 예외로 둘 수 있습니다.

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
| subheading | — | — | 20px | 1.4 | — | `--text-subheading` |
| heading-sm | — | — | 24px | 1.2 | — | `--text-heading-sm` |
| heading-lg | — | — | 64px | 1 | — | `--text-heading-lg` |
| display | — | — | 110px | 0.85 | — | `--text-display` |

위 표는 영문 기준입니다. **한글**은 display·heading-lg·heading-sm의 줄 간격을 1.4로 적용합니다(`--leading-heading-ko`). 자간은 역할별로 다릅니다.

| 역할 | 한글 자간 | 토큰 |
|------|-----------|-------|
| display | −0.01em | `--tracking-ko-display` |
| heading-lg, heading-sm | +0.02em | `--tracking-ko-heading` |
| subheading | −0.01em | `--tracking-ko-subheading` |
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
| 버튼 | 9999px (pill) |

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

Lime Pulse(#b7ff2c) 배경, Carbon Black(#000000) 텍스트, 9999px border radius(pill), 높이 40px(default) / 가로 20px 패딩, Plus Jakarta Sans / Pretendard 500 16px, 줄 간격 1.20. 채움색과 같은 1px solid #b7ff2c 테두리. 어느 페이지에서든 가장 채도가 높은 단 하나의 요소이며, 전기가 켜진 듯한 느낌이어야 합니다.

### Button 사이즈
텍스트 버튼은 아이콘 버튼과 같은 높이 체계(48/40/32/24px)를 씁니다.

| size | 높이 | 폰트 | 용도 |
|------|------|------|------|
| lg | 48px | 16px | 터치 강조·단독 CTA |
| default | 40px | 16px | 기본 버튼 |
| sm | 32px | 14px | 내비게이션 바 |
| xs | 24px | 12px | 칩·인라인 보조 액션 |

화면 하단의 주요 CTA(온보딩 이전/다음/시작하기, 홈 이대로 출발하기, 설정 저장)는 `size="lg"`를 씁니다. 버튼은 직접 스타일링하지 않고 항상 `Button` 컴포넌트를 사용합니다.

### Secondary Navigation Button
**역할:** 내비게이션의 보조 액션 (예: 기록, 설정)

Card Charcoal(#1f1f21) 배경, Pure White(#ffffff) 텍스트, 테두리 없음, 9999px radius(pill), 높이 32px(sm) / 가로 20px의 컴팩트한 패딩, Plus Jakarta Sans / Pretendard 500 14px. 구현은 `Button`의 `variant="secondary" size="sm"`입니다. 라임을 쓰지 않으므로 같은 내비게이션 안의 채워진 CTA와 경쟁하지 않고 공존할 수 있습니다.

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

Card Charcoal(#1f1f21) 배경, 1px Card Border Ink(#28282a) 테두리, 20px radius, 20px 패딩. Midnight Canvas보다 한 단계 위에 놓이며, 같은 표면처럼 느껴질 만큼 은은하면서도 콘텐츠 블록을 담을 만큼 분명합니다.

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

## Do와 Don't

### Do
- #b7ff2c는 채워진 CTA 버튼, 활성/체크 상태에만 사용할 것 — 본문 텍스트, 장식용 배경, 넓은 면에는 절대 사용 금지
- 카드, 내비게이션, 모달, 이미지 등 모든 컨테이너에 20px border radius를 적용하고, 버튼은 pill(9999px)로 통일해 일관된 형태를 유지할 것
- 디스플레이 헤드라인은 110px Plus Jakarta Sans / Pretendard 700, 줄 간격 0.85로 설정할 것(영문 기준). 1.0 미만의 행간이 시그니처 압축이다. 한글 헤드라인은 글자가 겹치므로 줄 간격 1.4로 설정할 것
- #111111을 기본 페이지 배경으로, #1f1f21을 카드와 모달의 한 단계 높은 표면으로 사용할 것
- 화면을 가득 채우는 어두운 사진을 Pure White(#ffffff) 플로팅 카드와 짝지어 포스터 스타일 레이어링을 만들 것
- #e5e5e5 테두리는 반전된(흰 표면) 맥락에서만 사용하고, 어두운 표면에서는 #28282a 또는 #707072를 사용할 것
- 어두운 표면의 본문 텍스트는 16px Plus Jakarta Sans / Pretendard 400, 줄 간격 1.50, Pure White로 설정할 것
- 라이트 모드에서 라임을 글자·아이콘·선으로 쓰던 자리는 `--highlight`(`#111111`)로 바꿀 것 — 라임은 채워진 면에만 남긴다
- 색은 시맨틱 클래스(`bg-card`, `text-foreground`, `border-border`)로 쓰고, 모드별 값은 토큰에서만 바꿀 것

### Don't
- 두 번째 유채색을 도입하지 말 것 — 이 시스템은 모노크롬에 라임 하나다. 파랑 등 어떤 색을 더해도 신호가 깨진다. 예외는 의미를 전달하는 `--destructive`(점수 '경고'와 같은 붉은색) 하나뿐이다
- 컨테이너에 0px 또는 28px 이상의 border radius를 사용하지 말 것(버튼의 pill 제외) — 20px radius가 부드럽지만 느슨하지 않은 이 시스템의 정체성이다
- 영문 디스플레이 헤드라인의 줄 간격을 1.2 이상으로 설정하지 말 것 — 0.85-1.00의 압축이 타입을 간판처럼 느끼게 한다. 한글 헤드라인은 예외로 1.4를 사용한다
- 내비게이션 바의 2px 블러를 넘는 드롭 섀도를 사용하지 말 것 — 평평함은 의도된 것이다
- 라임(#b7ff2c)을 제목, 서브헤딩, 본문 텍스트에 적용하지 말 것 — 액션 전용이다
- 어두운 표면의 테두리에 #e5e5e5를 사용하지 말 것 — 너무 밝다. 흰 카드 맥락에 한정할 것
- 표면 컨테이너 없이 버튼이나 카드를 사진 위에 바로 올리지 말 것 — 플로팅 카드는 흰색 또는 차콜 배경이 있어야 읽힌다
- 라이트 모드의 흰 배경 위에 라임 글자·아이콘·얇은 선을 쓰지 말 것 — 대비가 1.1:1이라 보이지 않는다
- 라이트용으로 진한 초록 같은 두 번째 유채색을 만들지 말 것 — 대체색은 `#111111`이다
- 컴포넌트에서 `dark:` 변형이나 하드코딩 색(`bg-white`, `text-black`, hex)으로 모드를 분기하지 말 것

## 표면

| 레벨 | 이름 | 값 | 용도 |
|-------|------|-------|---------|
| 0 | Midnight Canvas | `#111111` | 페이지 기반, 히어로 배경, 전체 폭 섹션 |
| 1 | Card Charcoal | `#1f1f21` | 캔버스 위에 놓이는 카드, 모달, 콘텐츠 패널 |
| 2 | Inverted White | `#ffffff` | 어두운 사진 위의 흰색 플로팅 카드, 반전 텍스트 패널 |

라이트 모드에서는 레벨 0이 `#ffffff`(`--background`), 레벨 1도 `#ffffff`(`--card`)이며 `--border`(`#e5e5e5`)로 윤곽을 줍니다. 레벨 2(흰색 플로팅 카드)는 모드와 무관하게 `#ffffff`입니다.

## 엘리베이션

- **내비게이션 바:** `0px 2px 6px 0px rgba(17, 17, 17, 0.125)`

## 이미지

사진은 화면을 가득 채우고 대비가 높으며 어두운 분위기입니다. 게임 컨트롤러를 쥔 손, 움직이는 사람들, 아레나 환경, 스니커즈와 게임 장비의 클로즈업 크롭이 대표적입니다. 처리는 어둡고 약간 채도를 낮추며, 깊은 검정이 #111111 캔버스와 이어지도록 합니다. 라이프스타일의 부드러움은 없으며, 피사체는 에디토리얼 의도로 연출되고 사물이나 제스처가 프레임을 채우도록 바짝 크롭됩니다. 흰색 텍스트와 흰색 플로팅 카드는 스크림 없이 사진 위에 바로 올라가 잡지 표지 또는 아레나 포스터 같은 레이어링을 만듭니다. 아이콘은 최소한으로, Pure White의 Swoosh 로고와 작은 UI 아이콘만 사용합니다. 일러스트, 3D 렌더, 장식 그래픽은 없으며, 분위기는 전적으로 사진이 담당합니다.

## 레이아웃

지속적인 최대 너비 컨테이너가 없는 전체 폭 다크 레이아웃으로, 섹션은 1440px 뷰포트 기준으로 좌우 끝까지 펼쳐집니다. 히어로는 화면을 가득 채우는 사진 이미지로 시작하고, 왼쪽 정렬된 디스플레이 헤드라인이 왼쪽 하단에 오버레이되며 그 아래에 라임 CTA가 놓입니다. 내비게이션은 왼쪽 로고, 가운데 텍스트 링크, 오른쪽 보조 버튼로 구성된 고정 상단 바입니다. 페이지 리듬은 전체 폭 다크 이미지 섹션, 가운데 정렬된 마키 텍스트 섹션(순수한 검정 위의 거대한 헤드라인), 어두운 사진 위에 White Floating Card가 놓이는 분할 레이아웃이 번갈아 나타납니다. 디스플레이 타입이 숨 쉴 수 있도록 섹션 간격은 넉넉합니다(48-64px). 콘텐츠는 대체로 가운데 또는 왼쪽 정렬이며, 비대칭이거나 그리드 중심의 구성은 없습니다. 모달(쿠키 설정)은 오른쪽 상단에 고정되며 전체 폭이 아닌 유일한 오버레이입니다.

## 에이전트 프롬프트 가이드

**빠른 색상 참조** (다크 기준. 라이트 값은 '테마' 절의 표를 따릅니다)
- 텍스트: #ffffff
- 배경: #111111
- 테두리(어두운 표면): #28282a / #707072
- 테두리(흰 표면): #e5e5e5
- 포인트: #b7ff2c
- 주요 액션: #b7ff2c (채워진 액션)

**컴포넌트 프롬프트 예시**

1. Primary Action Button 만들기: #b7ff2c 배경, #000000 텍스트, 9999px radius, 컴팩트한 알약형 패딩. 메인 CTA에 이 채워진 처리를 사용합니다.

2. *Primary CTA 버튼*: 9999px border radius(pill), 세로 패딩 16px, 가로 패딩 20px, 배경 #b7ff2c, 1px solid #b7ff2c 테두리, 텍스트 #000000, Plus Jakarta Sans / Pretendard 500 16px, 줄 간격 1.20. 그림자 없음. 페이지에서 유일하게 채도가 높은 요소이며 시각적 초점이 되어야 합니다.

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
  --color-fog-border: #e5e5e5;
  --color-pure-white: #ffffff;
  --color-carbon-black: #000000;

  /* Typography — Font Families */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', 'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-pretendard: 'Pretendard Variable', Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", ui-sans-serif, system-ui, sans-serif;
  --font-ui-sans-serif: 'ui-sans-serif', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
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
  --color-fog-border: #e5e5e5;
  --color-pure-white: #ffffff;
  --color-carbon-black: #000000;

  /* Typography */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', 'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-pretendard: 'Pretendard Variable', Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", ui-sans-serif, system-ui, sans-serif;
  --font-ui-sans-serif: 'ui-sans-serif', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-body-sm: 14px;
  --leading-body-sm: 1.5;
  --text-body: 16px;
  --leading-body: 1.5;
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

  /* Shadows */
  --shadow-sm: rgba(17, 17, 17, 0.125) 0px 2px 6px 0px;
}
```

### 테마 토큰 (라이트 / 다크)

위 블록은 원색 팔레트이고, 화면에 쓰는 시맨틱 토큰은 아래처럼 `:root`(라이트)와 `.dark`(다크)에 둡니다. 유틸리티 클래스는 `@theme inline`으로 이 변수에 연결합니다(`--color-card: var(--card)` 등). 실제 구현은 `src/index.css`입니다.

```css
:root {
  color-scheme: light;
  --background: #ffffff;
  --foreground: #111111;
  --card: #ffffff;
  --card-foreground: #111111;
  --popover: #ffffff;
  --popover-foreground: #111111;
  --primary: #b7ff2c;
  --primary-foreground: #000000;
  --secondary: #f4f4f5;
  --secondary-foreground: #111111;
  --muted: #f4f4f5;
  --muted-foreground: #66666a;
  --accent: #ececee;
  --accent-foreground: #111111;
  --destructive: #c4301f;
  --border: #e5e5e5;
  --input: #8e8e91;
  --ring: #111111;
  --highlight: #111111;
  --selected: #b7ff2c;
  --chip-selected: #b7ff2c2e;
  --chip-border: #e5e5e5;
  --switch-off: #d4d4d6;
  --outline-border: #dfdfdf;
  --outline-border-disabled: #a1a1a3;
  --chip-border-selected: #b7ff2c;
  --toast: #111111;
  --toast-foreground: #ffffff;
  --toast-border: #28282a;
  --toast-shadow: 0 8px 24px -4px rgb(0 0 0 / 0.12);
  --score-caution: #9a5b00;
  --score-warn: #c4301f;
  --chart-1: #111111;
  --chart-2: #66666a;
  --chart-3: #a1a1a3;
  --chart-4: #d4d4d6;
}

.dark {
  color-scheme: dark;
  --background: #111111;
  --foreground: #ffffff;
  --card: #1f1f21;
  --card-foreground: #ffffff;
  --popover: #1f1f21;
  --popover-foreground: #ffffff;
  --primary: #b7ff2c;
  --primary-foreground: #000000;
  --secondary: #1f1f21;
  --secondary-foreground: #ffffff;
  --muted: #1f1f21;
  --muted-foreground: #707072;
  --accent: #28282a;
  --accent-foreground: #ffffff;
  --destructive: #ff7a6b;
  --border: #28282a;
  --input: #707072;
  --ring: #b7ff2c;
  --highlight: #b7ff2c;
  --selected: #b7ff2c1a;
  --chip-selected: #b7ff2c1a;
  --chip-border: #707072;
  --switch-off: #707072;
  --outline-border: #b7ff2c;
  --outline-border-disabled: #b7ff2c;
  --chip-border-selected: #b7ff2c;
  --toast: #ffffff;
  --toast-foreground: #000000;
  --toast-border: #e5e5e5;
  --toast-shadow: 0 8px 24px -4px rgb(0 0 0 / 0.6);
  --score-caution: #ffc24b;
  --score-warn: #ff7a6b;
  --chart-1: #b7ff2c;
  --chart-2: #ffffff;
  --chart-3: #707072;
  --chart-4: #39393b;
}
```

### 테마 전환

- `<html>`의 `dark` 클래스로 전환합니다. 저장값(`run-smart-theme`)이 `system`이면 `prefers-color-scheme`을 따르고, 기기 설정이 바뀌면 즉시 반영합니다.
- 첫 화면이 그려지기 전에 `index.html`의 인라인 스크립트가 저장값을 읽어 클래스를 붙여 깜빡임을 막습니다. 키·색 값은 `src/constants/theme.ts`와 맞춥니다.
- 브라우저 주소창 색(`meta[name=theme-color]`)은 `--background`와 같은 값(`#ffffff` / `#111111`)으로 함께 바꿉니다.
