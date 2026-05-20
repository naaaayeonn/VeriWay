import type { ParsedInput, RouteInfo } from "../types";
import { routeData } from "../data/routes";

const BUILDINGS = ["학생회관", "중앙도서관", "순헌관", "명신관"];

const MOBILITY_KEYWORDS: Record<string, string> = {
  휠체어: "휠체어",
  목발: "목발",
  유모차: "유모차",
  캐리어: "캐리어",
  부상: "부상",
  노약자: "노약자",
  임산부: "임산부",
};

const AVOID_STAIRS_CONDITIONS = ["휠체어", "목발", "유모차", "캐리어", "부상"];

/**
 * 사용자 자연어 입력을 파싱하여 이동 조건을 추출합니다.
 */
export function parseUserInput(text: string): ParsedInput {
  const result: ParsedInput = {
    start: "",
    destination: "",
    mobility_condition: "",
    avoid: [],
    needs: [],
    user_type: "",
    missing_info: [],
    confidence: "medium",
  };

  // 출발지 찾기
  const startPatterns = [/(.+?)에서/, /(.+?)부터/];
  for (const pattern of startPatterns) {
    const match = text.match(pattern);
    if (match) {
      const found = BUILDINGS.find((b) => match[1].includes(b));
      if (found) {
        result.start = found;
        break;
      }
    }
  }

  // 목적지 찾기
  for (const building of BUILDINGS) {
    if (text.includes(building) && building !== result.start) {
      const destPatterns = [
        new RegExp(`에서\\s*.*${building}.*까지`),
        new RegExp(`${building}.*까지`),
        new RegExp(`${building}`),
      ];
      for (const pattern of destPatterns) {
        if (pattern.test(text)) {
          result.destination = building;
          break;
        }
      }
      if (result.destination) break;
    }
  }

  // 이동 상태 파싱
  for (const [keyword, condition] of Object.entries(MOBILITY_KEYWORDS)) {
    if (text.includes(keyword)) {
      result.mobility_condition = condition;
      result.user_type = condition;
      break;
    }
  }

  // 계단 회피
  if (AVOID_STAIRS_CONDITIONS.includes(result.mobility_condition)) {
    result.avoid.push("계단");
  }

  // 필요 시설 추론
  if (result.mobility_condition) {
    result.needs.push("엘리베이터");
    if (["휠체어", "유모차", "캐리어"].includes(result.mobility_condition)) {
      result.needs.push("경사로");
      result.needs.push("평탄한 보도");
    }
  }

  // 누락 정보 확인
  if (!result.start) result.missing_info.push("출발지");
  if (!result.destination) result.missing_info.push("목적지");

  return result;
}

/**
 * 파싱된 조건에 맞는 경로를 필터링합니다.
 */
export function filterRoutes(parsed: ParsedInput): RouteInfo[] {
  return routeData.filter((route) => {
    const sameStart = route.start === parsed.start;
    const sameDestination = route.destination === parsed.destination;

    let mobilityOk = true;
    const mobility = parsed.mobility_condition;

    if (mobility.includes("휠체어")) mobilityOk = route.wheelchair_ok;
    if (mobility.includes("목발") || mobility.includes("부상"))
      mobilityOk = route.crutch_ok;
    if (mobility.includes("캐리어")) mobilityOk = route.carrier_ok;
    if (mobility.includes("유모차")) mobilityOk = route.stroller_ok;

    const avoidStairs = parsed.avoid.includes("계단");
    const stairOk = avoidStairs ? route.has_stairs === false : true;

    return sameStart && sameDestination && mobilityOk && stairOk;
  });
}
