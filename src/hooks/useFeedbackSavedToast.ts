import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isFeedbackSavedState } from '../lib/navigationState';

/** 체감 저장 토스트의 열림 상태 */
interface FeedbackSavedToast {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * 체감 시트에서 저장하고 넘어온 경우에만 토스트를 연다.
 * 새로고침이나 뒤로 가기로 다시 뜨지 않도록 라우터 state는 곧바로 비운다.
 */
export function useFeedbackSavedToast(): FeedbackSavedToast {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(() => isFeedbackSavedState(location.state));
  const arrivedFromSave = isFeedbackSavedState(location.state);

  useEffect(() => {
    if (arrivedFromSave) navigate(location.pathname, { replace: true, state: null });
  }, [arrivedFromSave, location.pathname, navigate]);

  return { open, setOpen };
}
