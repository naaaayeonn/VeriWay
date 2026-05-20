import type { RouteInfo } from "../types";
import "./RouteCard.css";

interface Props {
  route: RouteInfo;
}

export default function RouteCard({ route }: Props) {
  return (
    <div className="route-card">
      <h4>📍 {route.route_name}</h4>

      <div className="route-desc">
        <strong>경로:</strong> {route.route_description}
      </div>

      <div className="route-info-grid">
        {route.has_elevator && (
          <span className="route-tag good">✅ 엘리베이터 있음</span>
        )}
        {route.has_ramp && (
          <span className="route-tag good">✅ 경사로 있음</span>
        )}
        {!route.has_stairs && (
          <span className="route-tag good">✅ 계단 없음</span>
        )}
        {route.has_stairs && (
          <span className="route-tag danger">❌ 계단 있음</span>
        )}
        <span
          className={`route-tag ${route.slope_level === "low" ? "good" : "warning"}`}
        >
          ⛰️ 경사도: {route.slope_level === "low" ? "낮음" : "보통"}
        </span>
      </div>

      {route.obstacles.length > 0 && (
        <div className="route-obstacles">
          <strong>⚠️ 주의사항:</strong>
          <div className="route-info-grid">
            {route.obstacles.map((o, i) => (
              <span key={i} className="route-tag warning">
                ⚠️ {o}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="route-tip">
        <span>💡</span>
        <span>
          <strong>팁:</strong> {route.indoor_tip}
        </span>
      </div>
    </div>
  );
}
