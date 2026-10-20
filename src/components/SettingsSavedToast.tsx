import { Toast, ToastDescription, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { MESSAGES } from '../constants/messages';

interface SettingsSavedToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 설정을 저장하고 홈으로 넘어왔을 때 보여주는 토스트.
 * 홈 하단의 고정 출발 버튼과 겹치지 않도록 화면 위쪽에 띄운다.
 */
export default function SettingsSavedToast({ open, onOpenChange }: SettingsSavedToastProps) {
  return (
    <ToastProvider>
      <Toast open={open} onOpenChange={onOpenChange}>
        <ToastDescription>{MESSAGES.settingsSaved}</ToastDescription>
      </Toast>
      <ToastViewport className="bottom-auto top-6" />
    </ToastProvider>
  );
}
