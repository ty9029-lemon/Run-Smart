import { describe, expect, it } from 'vitest';
import { FEEDBACK_SAVED_STATE, SETTINGS_SAVED_STATE } from '../constants/navigation';
import { isFeedbackSavedState, isSettingsSavedState } from './navigationState';

describe('isSettingsSavedState', () => {
  it('설정 저장 state면 true', () => {
    expect(isSettingsSavedState(SETTINGS_SAVED_STATE)).toBe(true);
  });

  it('null·문자열·다른 객체면 false', () => {
    expect(isSettingsSavedState(null)).toBe(false);
    expect(isSettingsSavedState(undefined)).toBe(false);
    expect(isSettingsSavedState('settingsSaved')).toBe(false);
    expect(isSettingsSavedState({ settingsSaved: false })).toBe(false);
    expect(isSettingsSavedState({})).toBe(false);
  });
});

describe('isFeedbackSavedState', () => {
  it('체감 저장 state만 true', () => {
    expect(isFeedbackSavedState(FEEDBACK_SAVED_STATE)).toBe(true);
    expect(isFeedbackSavedState(SETTINGS_SAVED_STATE)).toBe(false);
    expect(isFeedbackSavedState(null)).toBe(false);
    expect(isFeedbackSavedState({ feedbackSaved: false })).toBe(false);
  });
});
