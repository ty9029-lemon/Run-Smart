/** 화면 아래에서 올라오는 시트 모양 (드래그 없이 오른쪽 위 닫기 버튼·바깥 탭·ESC로 닫는다) */
export const BOTTOM_SHEET_CLASS = [
  'top-auto bottom-0 translate-y-0 max-w-full sm:max-w-md rounded-t-[32px] rounded-b-none',
  'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
  'data-open:zoom-in-100 data-open:slide-in-from-bottom',
  'data-closed:zoom-out-100 data-closed:slide-out-to-bottom',
].join(' ');

/** 오른쪽 위 닫기 버튼과 제목이 겹치지 않게 시트 머리글에 주는 오른쪽 여백 */
export const SHEET_HEADER_CLASS = 'pr-10';
