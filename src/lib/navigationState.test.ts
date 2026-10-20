import { describe, expect, it } from 'vitest';
import { SETTINGS_SAVED_STATE } from '../constants/navigation';
import { isSettingsSavedState } from './navigationState';

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
