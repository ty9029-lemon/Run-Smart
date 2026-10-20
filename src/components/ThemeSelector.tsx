import { Button } from '@/components/ui/button';
import { THEME_OPTIONS } from '../constants/theme';
import { useThemeStore } from '../store/themeStore';

/** 화면 테마(시스템/라이트/다크) 선택. 고르는 즉시 적용되고 저장 버튼과 무관하다. */
export default function ThemeSelector() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <section className="rounded-panel bg-card p-6">
      <h2 id="theme-label" className="mb-3 text-base font-medium">
        화면 테마
      </h2>
      <div role="radiogroup" aria-labelledby="theme-label" className="flex gap-2">
        {THEME_OPTIONS.map((option) => {
          const checked = option.mode === mode;
          return (
            <Button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={checked}
              size="sm"
              variant={checked ? 'default' : 'secondary'}
              // 선택 전 버튼은 카드와 배경색이 같아, 테두리로 버튼임을 드러낸다
              className={checked ? undefined : 'border-input'}
              onClick={() => setMode(option.mode)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
