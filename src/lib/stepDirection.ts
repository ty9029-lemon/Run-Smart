/** 단계가 이동하는 방향: 다음으로 가면 forward, 이전으로 돌아가면 back */
export type StepDirection = 'forward' | 'back';

/**
 * 이전 단계와 다음 단계의 번호로 이동 방향을 정한다.
 * 같은 단계로 다시 옮겨도 앞으로 가는 것으로 본다.
 */
export function getStepDirection(prev: number, next: number): StepDirection {
  return next >= prev ? 'forward' : 'back';
}
