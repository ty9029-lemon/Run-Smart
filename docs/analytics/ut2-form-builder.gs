/**
 * 2차 UT 설문 구글폼 자동 생성 스크립트
 * 문항 출처: docs/analytics/ut2-survey-draft.md
 *
 * 사용법: script.google.com에서 새 프로젝트 → 이 코드를 붙여넣기 → createUt2Form 실행.
 * 실행 후 로그에 폼 편집 주소가 출력된다.
 */

const FORM_TITLE = 'Run-Smart 2차 사용성 테스트 설문';
const APP_LINK = 'https://runners-fit.vercel.app/?utm_source=pickply&utm_campaign=ut2';
const REWARD_NAME = '커피 쿠폰';
const REWARD_WINNER_COUNT = 5;
const PHONE_RETENTION_DAYS = 30;
const RECORDING_NOTICE = '서비스 개선 분석을 위해 앱을 사용하는 동안의 화면이 녹화됩니다. '
  + '입력창에 적은 글자는 가려져 기록되며, 녹화 내용은 분석 목적으로만 사용합니다. '
  + '녹화를 원하지 않으시면 앱을 열지 말고 참여를 중단해 주세요.';
const FORM_DESCRIPTION = '앱을 직접 써 보신 뒤 느낀 점을 알려 주세요. 응답은 서비스 개선에만 사용됩니다.\n\n'
  + '[참여 방법]\n'
  + '1. 아래 주소로 앱을 열어 점수, 복장 추천, 시간대별 날씨, 기록 화면을 둘러봐 주세요.\n'
  + APP_LINK + '\n'
  + '2. 둘러본 뒤 이 설문에 답해 주세요.\n\n'
  + '[화면 녹화 안내]\n'
  + RECORDING_NOTICE + '\n\n'
  + '[참여 혜택]\n'
  + '동의하고 성실히 응답해 주신 분 중 추첨으로 ' + REWARD_WINNER_COUNT + '분께 ' + REWARD_NAME + '을 드립니다. '
  + '받으시려면 마지막에 휴대폰 번호를 남겨 주세요.';
const CONSENT_NOTICE = '[수집 항목] 연령대, 러닝 습관, 설문 응답, 앱 이용 기록(익명), 휴대폰 번호(선택), 앱 사용 화면 녹화(입력창 글자는 가려짐)\n'
  + '[수집 목적] 서비스 개선을 위한 분석(앱 사용 화면 녹화 포함), 경품 추첨 및 발송 안내\n'
  + '[보유 기간] 휴대폰 번호는 경품 발송 후 즉시, 늦어도 설문 종료 후 ' + PHONE_RETENTION_DAYS + '일 이내에 파기합니다. '
  + '나머지 응답과 화면 녹화는 서비스 개선 분석이 끝날 때까지 보관합니다.\n'
  + '동의를 거부할 수 있으며, 거부하시면 설문에 참여하실 수 없습니다.';
const SCALE_MIN = 1;
const SCALE_MAX = 5;
const NPS_MIN = 0;
const NPS_MAX = 10;
const SCALE_LOW_LABEL = '전혀 아니다';
const SCALE_HIGH_LABEL = '매우 그렇다';
const NPS_LOW_LABEL = '전혀 추천하지 않음';
const NPS_HIGH_LABEL = '적극 추천';
const OPTIONAL_PREFIX = '(해당하는 경우만) ';
const PHONE_PATTERN = '^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$';
const PHONE_ERROR_TEXT = '휴대폰 번호 형식으로 입력해 주세요. (예: 010-1234-5678)';
const PHONE_HELP_TEXT = '경품 추첨 및 발송 안내에만 사용하며, 경품 발송 후 즉시 파기합니다. 원하지 않으시면 비워 두셔도 됩니다.';

const METRICS = [
  '날씨 점수', '기온', '체감 온도', '습도', '강수', '풍속',
  '미세먼지', '자외선', '복장 추천', 'AI 가이드 문장', '시간대별 날씨',
];
const RECORD_FIELDS = ['날짜', '활동 종류', '갔음·안 갔음', '날씨 요약', '점수', '복장'];

/**
 * 폼 전체를 만들고 편집 주소를 로그로 남긴다.
 */
function createUt2Form() {
  const form = FormApp.create(FORM_TITLE).setDescription(FORM_DESCRIPTION);
  form.setCollectEmail(false).setProgressBar(true);
  addConsentSection(form);
  addProfileSection(form);
  addFirstRunSection(form);
  addHomeSection(form);
  addRecordSection(form);
  addTrustSection(form);
  addImprovementSection(form);
  addSummarySection(form);
  addRunnerSection(form);
  addContactSection(form);
  Logger.log('편집 주소: ' + form.getEditUrl());
  Logger.log('응답 주소: ' + form.getPublishedUrl());
}

/** 문항 유형별 추가 헬퍼 */
function addChoice(form, title, choices, required) {
  return form.addMultipleChoiceItem().setTitle(title).setChoiceValues(choices).setRequired(required);
}

function addCheckbox(form, title, choices, required) {
  return form.addCheckboxItem().setTitle(title).setChoiceValues(choices).setRequired(required);
}

function addScale(form, title, required) {
  return form.addScaleItem().setTitle(title).setBounds(SCALE_MIN, SCALE_MAX)
    .setLabels(SCALE_LOW_LABEL, SCALE_HIGH_LABEL).setRequired(required);
}

function addShort(form, title, required) {
  return form.addTextItem().setTitle(title).setRequired(required);
}

function addLong(form, title, required) {
  return form.addParagraphTextItem().setTitle(title).setRequired(required);
}

/** 동의 문항: 동의하지 않으면 폼을 바로 제출 처리한다. */
function addConsentSection(form) {
  const consent = form.addMultipleChoiceItem().setTitle('개인정보 수집·이용에 동의하시나요?')
    .setHelpText(CONSENT_NOTICE).setRequired(true);
  const nextPage = form.addPageBreakItem().setTitle('기본 정보');
  consent.setChoices([
    consent.createChoice('동의', nextPage),
    consent.createChoice('동의하지 않음', FormApp.PageNavigationType.SUBMIT),
  ]);
}

/** A2~A5: 스크리닝 */
function addProfileSection(form) {
  addChoice(form, '연령대를 선택해 주세요.', ['10대', '20대', '30대', '40대', '50대 이상'], true);
  addCheckbox(form, '평소 주로 하는 야외 활동은 무엇인가요?', ['산책', '러닝', '자전거', '등산'], true)
    .showOtherOption(true);
  addChoice(form, '위에서 선택한 야외 활동을 얼마나 자주 하시나요?',
    ['주 5회 이상', '주 3회 이상', '주 1~2회', '월 1~2회', '거의 안함'], true);
  addChoice(form, '외출 전 날씨를 주로 어떻게 확인하시나요?',
    ['네이버 날씨', '기본 날씨 앱', '기상청', '확인 안 함'], true).showOtherOption(true);
}

/** B1~B5: 첫 실행 */
function addFirstRunSection(form) {
  form.addPageBreakItem().setTitle('첫 실행');
  addScale(form, '앱 처음 실행 시 홈 화면으로 진입하는 과정 전체가 이해하기 쉬웠나요?', true);
  // TODO: 1차 폼의 선택지를 그대로 복사해 교체한다 (확인된 값만 넣어 둠)
  addChoice(form, '가장 헷갈렸던 단계는 어디인가요?',
    ['헷갈린 곳 없음', '홈 상단 숫자', '신경 쓰이는 점', '추위·더위 민감도'], true).showOtherOption(true);
  addLong(form, '헷갈렸던 이유를 자세히 적어 주세요.', false);
  addChoice(form, '"이대로 출발하기" 버튼을 누르셨나요?',
    ['네', '아니오', '누르고 취소하기 버튼을 눌렀어요'], true);
  addLong(form, '그렇게 선택한 이유를 적어주세요.', true);
}

/** C1~C8: 홈 화면 */
function addHomeSection(form) {
  form.addPageBreakItem().setTitle('홈 화면');
  addChoice(form, '점수가 무엇을 뜻하는지 이해하셨나요?', ['이해했다', '대략 이해했다', '이해하지 못했다'], true);
  addScale(form, '점수는 외출 결정에 얼마나 도움이 되었나요?', true);
  addScale(form, '오늘의 복장 추천은 판단에 도움이 되었나요?', true);
  addChoice(form, '가이드 문장과 팁의 길이는 어땠나요?', ['너무 짧았다', '적당했다', '너무 길었다'], true);
  addChoice(form, '시간대별 날씨 영역을 직접 넘겨 보셨나요?', ['네', '아니오', '보지 못함'], true);
  addChoice(form, '"추천 시간대는 00시(00점)"라는 안내는 도움이 되었나요?',
    ['도움이 됨', '보통', '도움이 되지 않음', '못 봄'], true);
  addCheckbox(form, '판단에 가장 중요했던 정보를 모두 골라 주세요.', METRICS, true);
  addCheckbox(form, '필요 없다고 느낀 정보가 있다면 골라 주세요. ("없음"은 단독으로 선택해 주세요)',
    METRICS.concat(['없음']), true);
}

/** D1~D3: 기록과 설정 */
function addRecordSection(form) {
  form.addPageBreakItem().setTitle('기록과 설정');
  addCheckbox(form, '최근 7일 기록 화면을 보신다면 어떤 정보가 가장 쓸모 있을 것 같나요?', RECORD_FIELDS, true);
  addLong(form, '기록을 누르면 무엇이 나오기를 기대하셨나요?', true);
  addLong(form, '설정에서 제약사항(무릎 문제, 자외선 민감 등)에 없는 항목이 있었다면 무엇이었나요?', false);
}

/** E1~E5: 추천 신뢰와 피드백 */
function addTrustSection(form) {
  form.addPageBreakItem().setTitle('추천에 대한 생각');
  addScale(form, '이 앱의 추천이 내 상황을 잘 반영한다고 느끼셨나요?', true);
  addLong(form, '그렇게 느낀 이유 또는 느끼지 않은 이유는 무엇인가요?', true);
  addChoice(form, '외출 후 나오는 "오늘 러닝 어땠나요?" 피드백을 남겨 보셨나요?',
    ['남겼다', '봤지만 남기지 않았다', '못 봤다'], true);
  addChoice(form, OPTIONAL_PREFIX + '피드백을 남기는 과정은 어땠나요?', ['쉬웠다', '보통', '번거로웠다'], false);
  addChoice(form, '외출한 뒤 복장이 맞았는지 기록하는 기능을 사용하실 것 같나요?',
    ['자주 쓸 것 같다', '가끔 쓸 것 같다', '안 쓸 것 같다'], true);
}

/** F1~F7: 1차 피드백 반영 항목 확인 */
function addImprovementSection(form) {
  form.addPageBreakItem().setTitle('개선된 부분 확인');
  addScale(form, '오늘 점수가 왜 그렇게 나왔는지 화면에서 알 수 있었나요?', true);
  addScale(form, '복장 추천(이미지와 문장)이 오늘 날씨에 맞다고 느끼셨나요?', true);
  addShort(form, '위 답변의 이유를 한 줄로 적어 주세요.', false);
  addChoice(form, '추천 복장 이미지와 AI 가이드 문장이 서로 일치했나요?',
    ['일치했다', '일부 달랐다', '많이 달랐다'], true);
  addScale(form, '추천 시간대가 실제로 내가 움직일 수 있는 시간(예: 퇴근 후)과 맞았나요?', true);
  addScale(form, '기록 화면은 기대한 모습이었나요?', true);
  addLong(form, '기록 화면에서 아쉬운 점이 있다면 적어 주세요.', false);
  addScale(form, '화면 색상과 글자는 읽기 편했나요?', true);
  addChoice(form, '라이트/다크 중 어느 쪽을 쓰셨나요?', ['라이트', '다크', '시스템 설정'], true);
  addChoice(form, '원하는 시간대에 날씨가 좋아지면 알림을 받아보고 싶으신가요?',
    ['꼭 받고 싶다', '있으면 쓸 것 같다', '필요 없다'], true);
}

/** G1~G7: 종합 평가 */
function addSummarySection(form) {
  form.addPageBreakItem().setTitle('종합 평가');
  addChoice(form, '만약 이 서비스를 더 이상 사용할 수 없게 된다면 어떻게 느낄 것 같나요?',
    ['매우 실망할 것 같다', '다소 실망할 것 같다', '실망하지 않을 것 같다'], true);
  addLong(form, '그렇게 느끼신 이유를 적어 주세요.', true);
  form.addScaleItem().setTitle('이 앱을 주변 러너에게 추천하시겠어요?')
    .setBounds(NPS_MIN, NPS_MAX).setLabels(NPS_LOW_LABEL, NPS_HIGH_LABEL).setRequired(true);
  addLong(form, '추천 점수의 이유를 적어 주세요.', true);
  addLong(form, '가장 편했던 점은 무엇인가요?', true);
  addLong(form, '가장 불편했던 점은 무엇인가요?', true);
  addLong(form, '추가로 있었으면 하는 기능이나 정보가 있다면 알려주세요.', false);
}

/** H1~H2: 러닝을 선택한 사람만 (선택 응답) */
function addRunnerSection(form) {
  form.addPageBreakItem().setTitle('러닝하시는 분께');
  addChoice(form, OPTIONAL_PREFIX + '주로 러닝하러 가는 시간대가 비슷하거나 정해져 있나요?', ['네', '아니오'], false);
  addChoice(form, OPTIONAL_PREFIX + '주로 언제 러닝하시나요?',
    ['평일 출근 전', '평일 퇴근 후', '주말 아침', '주말 저녁~밤'], false).showOtherOption(true);
}

/** I1: 경품 안내용 휴대폰 번호 (선택 응답, 형식 검증) */
function addContactSection(form) {
  form.addPageBreakItem().setTitle('경품 안내');
  const phone = addShort(form, '휴대폰 번호를 입력해 주세요.', false).setHelpText(PHONE_HELP_TEXT);
  phone.setValidation(FormApp.createTextValidation()
    .setHelpText(PHONE_ERROR_TEXT).requireTextMatchesPattern(PHONE_PATTERN).build());
}
