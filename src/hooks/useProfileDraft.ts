import { useState } from 'react';
import { MESSAGES } from '../constants/messages';
import { normalizeLastActivity } from '../lib/profileDraft';
import { useProfileStore } from '../store/profileStore';
import type { Profile } from '../types';

/** 프로필 초안 훅이 돌려주는 값 */
interface ProfileDraft {
  draft: Profile;
  error: string;
  onChange: (next: Profile) => void;
  /** 활동이 1개 이상인지 확인하고, 아니면 안내 문구를 띄운다 */
  validate: () => boolean;
  submit: () => void;
}

/**
 * 설정/온보딩 공용 프로필 초안 상태.
 * 활동이 하나도 없으면 저장하지 않고 안내 문구를 보여준다.
 * @param initial 초안의 시작값
 * @param onSaved 저장 성공 후 실행할 동작 (저장된 프로필을 받는다)
 */
export function useProfileDraft(
  initial: Profile,
  onSaved: (saved: Profile) => void,
): ProfileDraft {
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');

  const onChange = (next: Profile) => {
    setError('');
    setDraft(next);
  };

  const validate = () => {
    if (draft.selectedActivities.length > 0) return true;
    setError(MESSAGES.noActivity);
    return false;
  };

  const submit = () => {
    if (!validate()) return;
    const saved = normalizeLastActivity(draft);
    saveProfile(saved);
    onSaved(saved);
  };

  return { draft, error, onChange, validate, submit };
}
