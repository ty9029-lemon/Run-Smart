import type { AiGuide } from '../types';

interface GuideBoxProps {
  guide: AiGuide;
}

/** AI 가이드 메시지 박스 (요약 + 팁 불릿 + 상세 이유) */
export default function GuideBox({ guide }: GuideBoxProps) {
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <p className="mb-3 text-base">
        <span className="mr-2 text-xl">{guide.goOrNotEmoji}</span>
        {guide.guideMessage}
      </p>
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
        {guide.activityTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="text-sm text-steel-border">{guide.detailedReason}</p>
    </section>
  );
}
