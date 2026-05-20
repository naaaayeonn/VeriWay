// VeriWay 타입 정의

export interface ParsedInput {
  start: string;
  destination: string;
  mobility_condition: string;
  avoid: string[];
  needs: string[];
  user_type: string;
  missing_info: string[];
  confidence: string;
}

export interface RouteInfo {
  start: string;
  destination: string;
  route_name: string;
  route_description: string;
  has_stairs: boolean;
  has_elevator: boolean;
  has_ramp: boolean;
  slope_level: "low" | "medium" | "high";
  obstacles: string[];
  facilities: string[];
  wheelchair_ok: boolean;
  crutch_ok: boolean;
  carrier_ok: boolean;
  stroller_ok: boolean;
  indoor_tip: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  routeData?: RouteInfo;
  timestamp: Date;
}
