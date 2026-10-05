import { TooltipProvider } from '@/components/ui/tooltip';
import BadgeChipSection from './design-system/BadgeChipSection';
import ButtonSection from './design-system/ButtonSection';
import CardSection from './design-system/CardSection';
import ControlSection from './design-system/ControlSection';
import FormSection from './design-system/FormSection';
import OverlaySection from './design-system/OverlaySection';

/** 디자인시스템 쇼케이스: shadcn 기반 UI 컴포넌트를 variant·상태별로 한 화면에 모아 보여준다. */
export default function DesignSystem() {
  return (
    <TooltipProvider>
      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-12">
        <header>
          <h1 className="text-5xl font-bold leading-none">Design System</h1>
          <p className="mt-4 text-muted-foreground">
            검정 캔버스 + 라임 1색. 컨테이너 20px, 버튼은 pill.
          </p>
        </header>
        <ButtonSection />
        <BadgeChipSection />
        <FormSection />
        <ControlSection />
        <CardSection />
        <OverlaySection />
      </main>
    </TooltipProvider>
  );
}
