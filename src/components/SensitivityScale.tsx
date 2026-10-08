import { SENSITIVITY_MAX, SENSITIVITY_MIN } from '../constants/thresholds';

interface SensitivityScaleProps {
  question: string;
  value: number;
  onChange: (level: number) => void;
}

/** 단계(1~5)별 원 크기. 양 끝이 크고 가운데가 작다. */
const CIRCLE_SIZE_CLASS: Record<number, string> = {
  1: 'size-12',
  2: 'size-10',
  3: 'size-7',
  4: 'size-10',
  5: 'size-12',
};

/** 원을 감싸는 박스 높이. 가장 큰 원(size-12)과 같아 모든 원의 중심선이 일치한다. */
const CIRCLE_BOX_CLASS = 'h-12';

/** 단계별 아래 라벨. 없는 단계는 비워 둔다. */
const LEVEL_LABEL: Record<number, string> = { 1: '아니오', 3: '보통', 5: '네' };

const LEVELS = Array.from(
  { length: SENSITIVITY_MAX - SENSITIVITY_MIN + 1 },
  (_, i) => SENSITIVITY_MIN + i,
);

/** 질문 하나에 5단계 원으로 답하는 선택 UI */
export default function SensitivityScale({ question, value, onChange }: SensitivityScaleProps) {
  return (
    <div role="radiogroup" aria-label={question}>
      <h3 className="mb-4 text-base font-bold">{question}</h3>
      <div className="flex items-start justify-between">
        {LEVELS.map((level) => {
          const on = value === level;
          return (
            <div key={level} className="flex w-12 flex-col items-center gap-2">
              <div className={`flex items-center justify-center ${CIRCLE_BOX_CLASS}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={LEVEL_LABEL[level] ?? `${level}단계`}
                  onClick={() => onChange(level)}
                  className={`shrink-0 rounded-full border-2 ${CIRCLE_SIZE_CLASS[level]} ${
                    on ? 'border-lime-pulse bg-lime-pulse' : 'border-steel-border'
                  }`}
                />
              </div>
              <span className="h-4 whitespace-nowrap text-xs text-steel-border">
                {LEVEL_LABEL[level] ?? ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
