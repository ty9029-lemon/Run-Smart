import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_DISTANCE_KM,
  DISTANCE_INPUT_MAX_LENGTH,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
} from '../constants/feedback';
import { parseDistanceKm, stepDistanceKm } from '../lib/distance';

interface DistanceStepperProps {
  /** 입력창에 적힌 글자. 아직 입력하지 않았으면 빈 문자열 (기본값을 회색 placeholder로 보여준다) */
  value: string;
  /** 글자가 올바른 거리가 아닐 때 true */
  invalid: boolean;
  onChange: (text: string) => void;
}

/** 거리를 직접 입력하거나 -/+ 버튼으로 조절하는 입력. 오른쪽 안쪽에 km 단위를 보여준다. 입력 전 기본값은 회색 placeholder로만 보여 주고 값으로 저장하지 않는다. */
export default function DistanceStepper({ value, invalid, onChange }: DistanceStepperProps) {
  const km = parseDistanceKm(value);
  /** 현재 값에서 한 단계 늘리거나 줄인다. */
  const step = (direction: 1 | -1) => onChange(String(stepDistanceKm(km, direction)));
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="icon"
        aria-label="거리 줄이기"
        disabled={km !== null && km <= MIN_DISTANCE_KM}
        onClick={() => step(-1)}
      >
        <Minus />
      </Button>
      <div className="relative flex-1">
        <Input
          inputMode="decimal"
          aria-label="거리(km)"
          aria-invalid={invalid}
          maxLength={DISTANCE_INPUT_MAX_LENGTH}
          placeholder={String(DEFAULT_DISTANCE_KM)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-center"
        />
        {/* 입력 전에는 기본값(placeholder)과 같은 회색, 입력하면 값과 같은 흰색 */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-4 flex items-center text-base ${
            value === '' ? 'text-placeholder' : 'text-foreground'
          }`}
        >
          km
        </span>
      </div>
      <Button
        type="button"
        size="icon"
        aria-label="거리 늘리기"
        disabled={km !== null && km >= MAX_DISTANCE_KM}
        onClick={() => step(1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
