import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  ICON_BUTTON_SIZES,
  ICON_BUTTON_VARIANTS,
} from '@/constants/designSystem';
import Section, { Specimen } from './Section';

/** variant 한 줄: 기본 / 비활성 상태 */
function VariantRow({ variant }: { variant: (typeof BUTTON_VARIANTS)[number] }) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {BUTTON_SIZES.map((size) => (
        <Specimen key={size} label={`${variant} · ${size}`}>
          <Button variant={variant} size={size}>
            버튼
          </Button>
        </Specimen>
      ))}
      <Specimen label={`${variant} · disabled`}>
        <Button variant={variant} disabled>
          버튼
        </Button>
      </Specimen>
    </div>
  );
}

/** 아이콘 버튼 한 줄: size별 + 비활성 상태 */
function IconVariantRow({ variant }: { variant: (typeof ICON_BUTTON_VARIANTS)[number] }) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {ICON_BUTTON_SIZES.map((size) => (
        <Specimen key={size} label={`${variant} · ${size}`}>
          <Button variant={variant} size={size} aria-label="설정">
            <Settings />
          </Button>
        </Specimen>
      ))}
      <Specimen label={`${variant} · disabled`}>
        <Button variant={variant} size="icon" aria-label="설정" disabled>
          <Settings />
        </Button>
      </Specimen>
    </div>
  );
}

/** Button: variant × size × disabled */
export default function ButtonSection() {
  return (
    <Section
      title="Button"
      description="pill 형태. default는 라임 채움 CTA, secondary는 차콜 채움(내비게이션용), outline은 라임 외곽선. hover·focus는 직접 눌러서 확인하세요."
    >
      <div className="flex flex-col gap-6">
        {BUTTON_VARIANTS.map((variant) => (
          <VariantRow key={variant} variant={variant} />
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-6">
        <p className="text-sm text-steel-border">
          Icon Button: 정사각형 pill, Lucide 아이콘만 사용하고 aria-label 필수.
        </p>
        {ICON_BUTTON_VARIANTS.map((variant) => (
          <IconVariantRow key={variant} variant={variant} />
        ))}
      </div>
    </Section>
  );
}
