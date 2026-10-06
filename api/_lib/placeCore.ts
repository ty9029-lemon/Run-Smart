/** 카카오 로컬 API: 좌표 → 행정구역 */
export const KAKAO_REGION_URL = 'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json';
/** 카카오 요청 제한 시간(ms) */
export const KAKAO_TIMEOUT_MS = 4000;

/** 위도·경도 허용 범위 */
const LAT_LIMIT = 90;
const LON_LIMIT = 180;

/** 행정동 구분 코드 (법정동은 B) */
const REGION_TYPE_ADMIN = 'H';

/** 카카오가 "이 좌표의 행정구역이 없다"는 뜻으로 돌려주는 상태 코드 (예: 한국 밖 좌표) */
const STATUS_NO_REGION = 400;

/**
 * 카카오의 비정상 응답이 "주소 없음"인지 판단한다.
 * 키 오류(401/403), 한도 초과(429), 서버 오류(5xx)는 장애를 놓치지 않도록 false로 둔다.
 * @param status 카카오 응답의 HTTP 상태 코드
 */
export function isNoRegionStatus(status: number): boolean {
  return status === STATUS_NO_REGION;
}

/** 카카오 응답 문서 중 사용하는 필드 */
export interface KakaoRegionDoc {
  region_type?: string;
  region_1depth_name?: string;
  region_2depth_name?: string;
  region_3depth_name?: string;
}

/** 시·도 표기를 화면용으로 줄인 값. 키는 카카오가 돌려줄 수 있는 전체·약식 이름이다. */
const PROVINCE_LABELS: Record<string, string> = {
  서울특별시: '서울시',
  서울: '서울시',
  부산광역시: '부산시',
  부산: '부산시',
  대구광역시: '대구시',
  대구: '대구시',
  인천광역시: '인천시',
  인천: '인천시',
  광주광역시: '광주시',
  광주: '광주시',
  대전광역시: '대전시',
  대전: '대전시',
  울산광역시: '울산시',
  울산: '울산시',
  세종특별자치시: '세종시',
  세종: '세종시',
  경기도: '경기도',
  경기: '경기도',
  강원특별자치도: '강원도',
  강원도: '강원도',
  강원: '강원도',
  충청북도: '충청북도',
  충북: '충청북도',
  충청남도: '충청남도',
  충남: '충청남도',
  전북특별자치도: '전라북도',
  전라북도: '전라북도',
  전북: '전라북도',
  전라남도: '전라남도',
  전남: '전라남도',
  경상북도: '경상북도',
  경북: '경상북도',
  경상남도: '경상남도',
  경남: '경상남도',
  제주특별자치도: '제주도',
  제주: '제주도',
};

/** 좌표 검증 결과 */
export interface PlaceCoords {
  lat: number;
  lon: number;
}

/**
 * 쿼리 문자열의 lat, lon을 검증한다.
 * @param params URL 쿼리
 * @returns 올바르면 좌표, 아니면 null
 */
export function parsePlaceCoords(params: URLSearchParams): PlaceCoords | null {
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));
  if (params.get('lat') === null || params.get('lon') === null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > LAT_LIMIT || Math.abs(lon) > LON_LIMIT) return null;
  return { lat, lon };
}

/** 시·도를 줄이고, 도(道)면 시·군까지 붙이기 위한 첫 시·군 이름 */
function firstWord(text: string | undefined): string | null {
  return text?.split(' ')[0] || null;
}

/**
 * 카카오 행정구역 응답을 "서울시 역삼1동" 형태의 한 줄로 바꾼다.
 * 행정동(H)을 우선하고 없으면 동 이름이 있는 첫 문서를 쓴다.
 * 광역시는 "서울시 역삼1동", 도는 "경기도 성남시 정자동"처럼 시·군까지 붙인다.
 * @param documents 카카오 응답의 documents
 * @returns 동 이름을 알 수 없으면 null
 */
export function formatRegionLabel(documents: KakaoRegionDoc[]): string | null {
  const doc =
    documents.find((d) => d.region_type === REGION_TYPE_ADMIN && d.region_3depth_name) ??
    documents.find((d) => d.region_3depth_name);
  if (!doc?.region_3depth_name) return null;
  const province = PROVINCE_LABELS[doc.region_1depth_name ?? ''] ?? doc.region_1depth_name;
  const isDo = province?.endsWith('도') ?? false;
  const city = isDo ? firstWord(doc.region_2depth_name) : null;
  return [province, city, doc.region_3depth_name].filter(Boolean).join(' ');
}
