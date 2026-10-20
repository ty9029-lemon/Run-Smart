import { MOTION_DURATION_MS } from './motion';

/** 스플래시를 완전히 보여주는 시간(ms): 로고 등장 애니메이션이 끝나고 잠시 머무는 길이 */
export const SPLASH_HOLD_MS = 1600;

/** 스플래시가 사라지는 페이드아웃 시간(ms): 모션 토큰 normal과 같다 */
export const SPLASH_FADE_MS = MOTION_DURATION_MS.normal;

/** 이번 세션에 스플래시를 이미 보여줬는지 기록하는 sessionStorage 키 */
export const SPLASH_SESSION_KEY = 'run-smart-splash-shown';

/** 로고 심볼 이미지 경로 (public/logo-mark.svg) */
export const SPLASH_LOGO_URL = '/logo-mark.svg';
