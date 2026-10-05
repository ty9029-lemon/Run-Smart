import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  PROGRESS_VALUES,
  SLIDER_DISABLED_VALUE,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_RANGE,
  SLIDER_VALUE,
  TOGGLE_OPTIONS,
} from '@/constants/designSystem';
import Section, { Specimen } from './Section';

/** 체크박스·스위치: 해제 / 선택 / 비활성 */
function CheckSwitchRow() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Label><Checkbox /> 해제</Label>
      <Label><Checkbox defaultChecked /> 선택</Label>
      <Label><Checkbox disabled /> 비활성</Label>
      <Label><Switch /> 꺼짐</Label>
      <Label><Switch defaultChecked /> 켜짐</Label>
      <Label><Switch disabled /> 비활성</Label>
    </div>
  );
}

/** 슬라이더: 단일 / 범위 / 비활성 */
function SliderRow() {
  const props = { min: SLIDER_MIN, max: SLIDER_MAX };
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Specimen label="single">
        <Slider {...props} defaultValue={SLIDER_VALUE} className="w-full" />
      </Specimen>
      <Specimen label="range">
        <Slider {...props} defaultValue={SLIDER_RANGE} className="w-full" />
      </Specimen>
      <Specimen label="disabled">
        <Slider {...props} defaultValue={SLIDER_DISABLED_VALUE} disabled className="w-full" />
      </Specimen>
    </div>
  );
}

/** 진행률 막대 */
function ProgressRow() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {PROGRESS_VALUES.map((value) => (
        <Specimen key={value} label={`${value}%`}>
          <Progress value={value} className="w-full" />
        </Specimen>
      ))}
    </div>
  );
}

/** 토글 그룹 (단일 선택) */
function ToggleRow() {
  return (
    <ToggleGroup type="single" variant="outline" defaultValue={TOGGLE_OPTIONS[0]}>
      {TOGGLE_OPTIONS.map((option) => (
        <ToggleGroupItem key={option} value={option}>
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** Checkbox · Switch · Slider · Progress · ToggleGroup */
export default function ControlSection() {
  return (
    <Section title="Checkbox · Switch · Slider · Progress · Toggle Group" description="체크·켜짐·채워진 구간만 라임.">
      <CheckSwitchRow />
      <SliderRow />
      <ProgressRow />
      <ToggleRow />
    </Section>
  );
}
