import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const UI_DIR = 'src/components/ui';
const uiFiles = readdirSync(UI_DIR).filter((name) => name.endsWith('.tsx'));
const read = (name: string) => readFileSync(`${UI_DIR}/${name}`, 'utf8');

describe('기본 컴포넌트 전환', () => {
  it.each(uiFiles)('%s는 transition-all을 쓰지 않는다 (속성을 좁혀 레이아웃이 전환되지 않게 한다)', (name) => {
    expect(read(name)).not.toContain('transition-all');
  });

  it.each(uiFiles)('%s의 전환은 모션 토큰의 duration을 가진다', (name) => {
    const source = read(name);
    const transitions = source.match(/(?<![-\w])transition-(?!none)[\w[\],-]+/g) ?? [];
    if (transitions.length === 0) return;
    expect(source).toMatch(/duration-\(--motion-duration-(fast|normal|slow)\)/);
    expect(source).toContain('ease-(--motion-ease-');
  });

  it('버튼은 눌림(translate) 전환을 포함한다', () => {
    expect(read('button.tsx')).toContain('transition-[color,background-color,border-color,box-shadow,opacity,translate]');
  });

  it('스위치 루트와 썸은 같은 duration을 쓴다', () => {
    const matches = read('switch.tsx').match(/duration-\(--motion-duration-fast\)/g) ?? [];
    expect(matches).toHaveLength(2);
  });
});
