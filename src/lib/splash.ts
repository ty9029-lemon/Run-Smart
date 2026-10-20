import { SPLASH_SESSION_KEY } from '../constants/splash';

/** sessionStorage를 돌려준다. 사용할 수 없으면(비공개 모드 등) null */
function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** 스플래시가 완전히 사라져 아래 화면이 드러났는지 */
let isAppRevealed = false;
const appRevealListeners = new Set<() => void>();

/** 스플래시가 완전히 사라졌음을 알린다. 아래 화면의 등장 모션이 이때 시작된다. */
export function revealApp(): void {
  if (isAppRevealed) return;
  isAppRevealed = true;
  appRevealListeners.forEach((listener) => listener());
}

/** 화면이 드러났는지 구독한다. useSyncExternalStore용 */
export function subscribeAppReveal(listener: () => void): () => void {
  appRevealListeners.add(listener);
  return () => appRevealListeners.delete(listener);
}

/**
 * 지금 화면이 드러난 상태인지 돌려준다.
 * 이번 세션에 스플래시가 없거나 이미 끝났다면 처음부터 드러난 상태다.
 */
export function getAppRevealed(): boolean {
  return isAppRevealed || !shouldShowSplash();
}

/** 이번 세션에 스플래시를 아직 보여주지 않았으면 true */
export function shouldShowSplash(storage: Storage | null = getSessionStorage()): boolean {
  try {
    return storage?.getItem(SPLASH_SESSION_KEY) == null;
  } catch {
    return true;
  }
}

/** index.html이 미리 칠해 둔 <html> 바탕색을 지워, 이후에는 테마 배경이 그대로 보이게 한다. */
export function clearBootBackground(root: HTMLElement = document.documentElement): void {
  root.style.removeProperty('background-color');
}

/** 스플래시를 보여줬다고 기록한다. 저장할 수 없어도 앱 동작에는 영향이 없다. */
export function markSplashShown(storage: Storage | null = getSessionStorage()): void {
  try {
    storage?.setItem(SPLASH_SESSION_KEY, '1');
  } catch {
    /* 저장 실패는 무시한다: 다음 진입 때 스플래시가 한 번 더 보일 뿐이다 */
  }
}
