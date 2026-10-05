import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Section, { Specimen } from './Section';

/** 트리거 버튼으로 여는 Dialog */
function DialogSample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Dialog 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>쿠키 설정</DialogTitle>
          <DialogDescription>경험 개선을 위해 사용할 쿠키를 고르세요.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 마우스를 올리면 보이는 Tooltip */
function TooltipSample() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Tooltip
        </Button>
      </TooltipTrigger>
      <TooltipContent>체감 온도 보정값</TooltipContent>
    </Tooltip>
  );
}

/** 탭 (활성 탭은 pill 하이라이트) */
function TabsSample() {
  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTrigger value="today">오늘</TabsTrigger>
        <TabsTrigger value="week">이번 주</TabsTrigger>
        <TabsTrigger value="off" disabled>
          비활성
        </TabsTrigger>
      </TabsList>
      <TabsContent value="today">오늘의 러닝 지수</TabsContent>
      <TabsContent value="week">주간 요약</TabsContent>
    </Tabs>
  );
}

/** Dialog · Tooltip · Tabs */
export default function OverlaySection() {
  return (
    <Section title="Dialog · Tooltip · Tabs" description="Dialog와 Tooltip은 직접 열어서 확인하세요.">
      <div className="flex flex-wrap items-start gap-8">
        <Specimen label="dialog"><DialogSample /></Specimen>
        <Specimen label="tooltip"><TooltipSample /></Specimen>
        <Specimen label="tabs"><TabsSample /></Specimen>
      </div>
    </Section>
  );
}
