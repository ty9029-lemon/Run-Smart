import { FEEDBACK_SAVED_STATE, SETTINGS_SAVED_STATE } from '../constants/navigation';

/**
 * 라우터 state가 "설정 저장 후 이동"을 알리는 값인지 확인한다.
 * @param state useLocation().state (어떤 값이든 올 수 있다)
 */
export function isSettingsSavedState(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as Record<string, unknown>).settingsSaved === SETTINGS_SAVED_STATE.settingsSaved
  );
}

/**
 * 라우터 state가 "체감 시트 저장 후 이동"을 알리는 값인지 확인한다.
 * @param state useLocation().state (어떤 값이든 올 수 있다)
 */
export function isFeedbackSavedState(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as Record<string, unknown>).feedbackSaved === FEEDBACK_SAVED_STATE.feedbackSaved
  );
}
