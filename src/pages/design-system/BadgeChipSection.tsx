import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { BADGE_VARIANTS, CHIP_SAMPLES } from '@/constants/designSystem';
import Section, { Specimen } from './Section';

/** Badge: variant별 */
function BadgeRow() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {BADGE_VARIANTS.map((variant) => (
        <Specimen key={variant} label={variant}>
          <Badge variant={variant}>배지</Badge>
        </Specimen>
      ))}
    </div>
  );
}

/** Chip: 선택 / 미선택 / 비활성 */
function ChipRow() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {CHIP_SAMPLES.map(({ label, selected, disabled }) => (
        <Specimen
          key={label}
          label={disabled ? 'disabled' : selected ? 'selected' : 'default'}
        >
          <Chip selected={selected} disabled={disabled}>
            {label}
          </Chip>
        </Specimen>
      ))}
    </div>
  );
}

/** Badge와 Chip */
export default function BadgeChipSection() {
  return (
    <Section
      title="Badge · Chip"
      description="라임은 active 배지와 선택된 칩 같은 활성 상태에만 씁니다."
    >
      <BadgeRow />
      <ChipRow />
    </Section>
  );
}
