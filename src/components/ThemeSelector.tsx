import { useEffect } from 'react';
import { Chip } from '@/components/ui/chip';
import { THEME_OPTIONS } from '../constants/theme';
import { selectAppliedMode, useThemeStore } from '../store/themeStore';

/** 화면 테마(시스템/라이트/다크) 선택. 칩 하나를 고르는 라디오 그룹이며, 고르면 바로 미리 보이지만 저장 버튼을 눌러야 확정되고, 저장 없이 나가면 원래 테마로 돌아간다. */
export default function ThemeSelector() {
  const mode = useThemeStore(selectAppliedMode);
  const setPreviewMode = useThemeStore((s) => s.setPreviewMode);
  const clearPreview = useThemeStore((s) => s.clearPreview);

  // 저장하지 않고 화면을 나가면 미리보기를 버린다
  useEffect(() => clearPreview, [clearPreview]);

  return (
    <section className="rounded-panel bg-card p-6">
      <h2 id="theme-label" className="mb-3 text-base font-bold">
        화면 테마
      </h2>
      <div role="radiogroup" aria-labelledby="theme-label" className="flex gap-2">
        {THEME_OPTIONS.map((option) => {
          const checked = option.mode === mode;
          return (
            <Chip
              key={option.mode}
              role="radio"
              aria-checked={checked}
              // 칩의 기본 aria-pressed(토글)는 라디오와 맞지 않아 끈다
              aria-pressed={undefined}
              selected={checked}
              onClick={() => setPreviewMode(option.mode)}
            >
              {option.label}
            </Chip>
          );
        })}
      </div>
    </section>
  );
}
