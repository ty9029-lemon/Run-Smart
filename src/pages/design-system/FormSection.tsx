import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { INPUT_PLACEHOLDER, TEXTAREA_PLACEHOLDER } from '@/constants/designSystem';
import Section, { Specimen } from './Section';

/** Input 상태: 기본 / 값 입력 / 비활성 / 오류 */
function InputStates() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Specimen label="default (placeholder)">
        <Input placeholder={INPUT_PLACEHOLDER} />
      </Specimen>
      <Specimen label="filled">
        <Input defaultValue="서울시 마포구" />
      </Specimen>
      <Specimen label="disabled">
        <Input disabled defaultValue="수정할 수 없음" />
      </Specimen>
      <Specimen label="invalid">
        <Input aria-invalid defaultValue="잘못된 값" />
      </Specimen>
    </div>
  );
}

/** Label이 붙은 Textarea 상태 */
function TextareaStates() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-textarea">컨디션</Label>
        <Textarea id="ds-textarea" placeholder={TEXTAREA_PLACEHOLDER} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-textarea-disabled">컨디션 (비활성)</Label>
        <Textarea id="ds-textarea-disabled" disabled placeholder={TEXTAREA_PLACEHOLDER} />
      </div>
    </div>
  );
}

/** Input · Textarea · Label */
export default function FormSection() {
  return (
    <Section title="Input · Textarea · Label" description="기본 테두리는 Steel Border, 포커스는 라임 링.">
      <InputStates />
      <TextareaStates />
    </Section>
  );
}
