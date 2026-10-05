import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BAR_RADIUS,
  CHART_DATA,
  CHART_HEIGHT_CLASS,
  DONUT_DATA,
  DONUT_INNER_RADIUS,
  RADIAL_INNER_RADIUS,
  RADIAL_MAX_ANGLE,
  RADIAL_OUTER_RADIUS,
  RADIAL_SCORE,
} from '@/constants/designSystem';
import Section, { Specimen } from './Section';

/** 시리즈 색: 주 계열만 라임, 비교 계열은 흰색 */
const SERIES_CONFIG = {
  score: { label: '러닝 지수', color: 'var(--chart-1)' },
  prev: { label: '어제', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const DONUT_CONFIG = {
  running: { label: '러닝', color: 'var(--chart-1)' },
  cycling: { label: '자전거', color: 'var(--chart-2)' },
  hiking: { label: '등산', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const RADIAL_CONFIG = {
  score: { label: '러닝 지수', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** 공통 격자와 X축 */
function Axes() {
  return (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </>
  );
}

/** 막대 차트: 두 계열 비교 */
function BarSample() {
  return (
    <ChartContainer config={SERIES_CONFIG} className={CHART_HEIGHT_CLASS}>
      <BarChart data={[...CHART_DATA]}>
        <Axes />
        <Bar dataKey="score" fill="var(--color-score)" radius={BAR_RADIUS} />
        <Bar dataKey="prev" fill="var(--color-prev)" radius={BAR_RADIUS} />
      </BarChart>
    </ChartContainer>
  );
}

/** 선 차트: 주 계열 라임, 비교 계열은 점선 흰색 */
function LineSample() {
  return (
    <ChartContainer config={SERIES_CONFIG} className={CHART_HEIGHT_CLASS}>
      <LineChart data={[...CHART_DATA]}>
        <Axes />
        <Line dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
        <Line dataKey="prev" stroke="var(--color-prev)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ChartContainer>
  );
}

/** 영역 차트: 단색 채움 (그라디언트 금지) */
function AreaSample() {
  return (
    <ChartContainer config={SERIES_CONFIG} className={CHART_HEIGHT_CLASS}>
      <AreaChart data={[...CHART_DATA]}>
        <Axes />
        <Area dataKey="score" type="monotone" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  );
}

/** 방사형: 러닝 지수 링 */
function RadialSample() {
  return (
    <ChartContainer config={RADIAL_CONFIG} className="mx-auto aspect-square h-56">
      <RadialBarChart
        data={[{ name: 'score', score: RADIAL_SCORE, fill: 'var(--color-score)' }]}
        innerRadius={RADIAL_INNER_RADIUS}
        outerRadius={RADIAL_OUTER_RADIUS}
        startAngle={RADIAL_MAX_ANGLE / 4}
        endAngle={-RADIAL_MAX_ANGLE * 0.75}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="score" background cornerRadius={BAR_RADIUS} />
      </RadialBarChart>
    </ChartContainer>
  );
}

/** 도넛: 활동 비율 */
function DonutSample() {
  return (
    <ChartContainer config={DONUT_CONFIG} className="mx-auto aspect-square h-56">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={[...DONUT_DATA]} dataKey="value" nameKey="name" innerRadius={DONUT_INNER_RADIUS} />
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}

/** Chart: Bar · Line · Area · Radial · Donut */
export default function ChartSection() {
  return (
    <Section
      title="Chart"
      description="라임은 주 계열에만, 비교 계열은 흰색→스틸 단계로 구분합니다. 계열은 3개 이하, 그라디언트·그림자 없음. 툴팁은 마우스를 올려 확인하세요."
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <Specimen label="bar"><BarSample /></Specimen>
        <Specimen label="line"><LineSample /></Specimen>
        <Specimen label="area"><AreaSample /></Specimen>
        <Specimen label="radial"><RadialSample /></Specimen>
        <Specimen label="donut"><DonutSample /></Specimen>
      </div>
    </Section>
  );
}
