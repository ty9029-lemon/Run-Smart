import { useEffect, useState } from 'react';
import { SPLASH_FADE_MS, SPLASH_HOLD_MS, SPLASH_LOGO_URL } from '../constants/splash';

interface SplashScreenProps {
  /** 페이드아웃까지 끝났을 때 호출한다 */
  onFinish: () => void;
}

/**
 * 앱을 처음 열 때 보여주는 전체 화면 스플래시.
 * 다크는 검정 바탕에 라임 로고, 라이트는 라임 바탕에 검정 로고를 쓴다.
 */
export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), SPLASH_HOLD_MS);
    const finishTimer = setTimeout(onFinish, SPLASH_HOLD_MS + SPLASH_FADE_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="bg-primary text-primary-foreground dark:bg-background dark:text-primary fixed inset-0 z-[100] flex flex-col items-center justify-center gap-2 transition-opacity ease-out"
      style={{ opacity: isExiting ? 0 : 1, transitionDuration: `${SPLASH_FADE_MS}ms` }}
    >
      <div
        className="animate-splash-logo size-20 bg-current"
        style={{
          maskImage: `url(${SPLASH_LOGO_URL})`,
          WebkitMaskImage: `url(${SPLASH_LOGO_URL})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
      <p className="animate-splash-text text-2xl leading-[1.2] font-bold italic">Run Smart</p>
    </div>
  );
}
