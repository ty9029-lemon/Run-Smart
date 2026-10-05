import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Section from './Section';

interface SampleCardProps {
  variant?: 'default' | 'inverted';
  size?: 'default' | 'sm';
  withFooter?: boolean;
}

/** 카드 샘플 하나 */
function SampleCard({ variant, size, withFooter }: SampleCardProps) {
  return (
    <Card variant={variant} size={size}>
      <CardHeader>
        <CardTitle>러닝 지수 72점</CardTitle>
        <CardDescription>지금 달리시는 것을 추천합니다.</CardDescription>
      </CardHeader>
      <CardContent>체감 기온 9°C, 바람막이를 챙기세요.</CardContent>
      {withFooter && (
        <CardFooter>
          <Button size="sm">자세히</Button>
        </CardFooter>
      )}
    </Card>
  );
}

/** Card: 기본 / 작은 크기 / 푸터 / 흰색 플로팅 */
export default function CardSection() {
  return (
    <Section title="Card" description="반경 20px, 1px Card Border Ink. inverted는 어두운 사진 위에 놓는 흰색 플로팅 카드.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SampleCard />
        <SampleCard size="sm" />
        <SampleCard withFooter />
        <SampleCard variant="inverted" />
      </div>
    </Section>
  );
}
