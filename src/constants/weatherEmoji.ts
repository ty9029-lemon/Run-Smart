/** 날씨 문구별 이모지 (낮, 밤). 문구는 weatherCodeToCondition이 만드는 한글 라벨과 같다. */
const WEATHER_EMOJI: Record<string, { day: string; night: string }> = {
  맑음: { day: '☀️', night: '🌙' },
  '구름 조금': { day: '🌤️', night: '☁️' },
  흐림: { day: '☁️', night: '☁️' },
  안개: { day: '🌫️', night: '🌫️' },
  이슬비: { day: '🌦️', night: '🌧️' },
  비: { day: '🌧️', night: '🌧️' },
  눈: { day: '❄️', night: '❄️' },
  소나기: { day: '🌦️', night: '🌧️' },
  '눈 소나기': { day: '🌨️', night: '🌨️' },
  뇌우: { day: '⛈️', night: '⛈️' },
};

/**
 * 날씨 문구에 맞는 이모지를 돌려준다.
 * @param condition 날씨 문구 (예: 구름 조금)
 * @param isDay 낮이면 true
 * @returns 이모지 (알 수 없는 날씨면 undefined)
 */
export function getWeatherEmoji(condition: string, isDay: boolean): string | undefined {
  const emoji = WEATHER_EMOJI[condition];
  if (!emoji) return undefined;
  return isDay ? emoji.day : emoji.night;
}
