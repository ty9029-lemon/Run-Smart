import { Toast, ToastDescription, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { MESSAGES } from '../constants/messages';

interface SettingsSavedToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 설정을 저장하고 홈으로 넘어왔을 때 보여주는 토스트.
 * 출발 토스트와 같은 자리(가장 가까운 relative 조상인 출발 버튼 영역 바로 위, 8px 간격)에 뜬다.
 */
export default function SettingsSavedToast({ open, onOpenChange }: SettingsSavedToastProps) {
  return (
    <ToastProvider>
      <Toast open={open} onOpenChange={onOpenChange}>
        <ToastDescription>{MESSAGES.settingsSaved}</ToastDescription>
      </Toast>
      <ToastViewport className="absolute bottom-full mb-2 max-w-none px-0" />
    </ToastProvider>
  );
}
