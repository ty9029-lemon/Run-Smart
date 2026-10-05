import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** 디자인시스템 페이지의 섹션 래퍼 (제목 + 설명 + 본문) */
export default function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold leading-[1.2]">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface SpecimenProps {
  label: string;
  children: ReactNode;
}

/** 샘플 하나와 그 아래 상태 라벨 */
export function Specimen({ label, children }: SpecimenProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
