import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isSettingsSavedState } from '../lib/navigationState';

/** 설정 저장 토스트의 열림 상태 */
interface SettingsSavedToast {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * 설정에서 저장하고 넘어온 경우에만 토스트를 연다.
 * 새로고침이나 뒤로 가기로 다시 뜨지 않도록 라우터 state는 곧바로 비운다.
 */
export function useSettingsSavedToast(): SettingsSavedToast {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(() => isSettingsSavedState(location.state));
  const arrivedFromSave = isSettingsSavedState(location.state);

  useEffect(() => {
    if (arrivedFromSave) navigate(location.pathname, { replace: true, state: null });
  }, [arrivedFromSave, location.pathname, navigate]);

  return { open, setOpen };
}
