import { SPLASH_SESSION_KEY } from '../constants/splash';

/** sessionStorage를 돌려준다. 사용할 수 없으면(비공개 모드 등) null */
function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
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
