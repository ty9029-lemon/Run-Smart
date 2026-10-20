/** 이번 페이지 로드에서 등장 모션을 이미 보여준 화면의 키 */
const playedIntros = new Set<string>();

/** 이 화면의 등장 모션을 이미 보여줬는지 */
export function hasIntroPlayed(key: string): boolean {
  return playedIntros.has(key);
}

/** 이 화면의 등장 모션을 보여줬다고 기록한다. 탭을 오가며 다시 열어도 반복하지 않기 위해서다. */
export function markIntroPlayed(key: string): void {
  playedIntros.add(key);
}
