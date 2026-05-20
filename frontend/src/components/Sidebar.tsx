import type { ParsedInput } from "../types";
import "./Sidebar.css";

interface Props {
  parsedInput: ParsedInput | null;
}

export default function Sidebar({ parsedInput }: Props) {
  return (
    <aside className="sidebar">
      {/* 이동 조건 분석 카드 */}
      {parsedInput && (
        <div className="sidebar-card condition-card">
          <h3>📋 이동 조건 분석</h3>
          <div className="condition-items">
            <div className="condition-item">
              <span className="label">출발지</span>
              <span className="value">{parsedInput.start || "-"}</span>
            </div>
            <div className="condition-item">
              <span className="label">목적지</span>
              <span className="value">{parsedInput.destination || "-"}</span>
            </div>
            <div className="condition-item">
              <span className="label">이동 상태</span>
              <span className="value">
                {parsedInput.mobility_condition || "-"}
              </span>
            </div>
            <div className="condition-item">
              <span className="label">피해야 할 요소</span>
              <span className="value">
                {parsedInput.avoid.length > 0
                  ? parsedInput.avoid.join(", ")
                  : "-"}
              </span>
            </div>
            <div className="condition-item">
              <span className="label">필요 시설</span>
              <span className="value">
                {parsedInput.needs.length > 0
                  ? parsedInput.needs.join(", ")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 지원 건물 */}
      <div className="sidebar-card">
        <h3>🏢 지원 건물</h3>
        <ul className="info-list">
          <li>학생회관</li>
          <li>중앙도서관</li>
          <li>순헌관</li>
          <li>명신관</li>
        </ul>
      </div>

      {/* 지원 이동 수단 */}
      <div className="sidebar-card">
        <h3>♿ 지원 이동 수단</h3>
        <ul className="info-list">
          <li>🦽 휠체어</li>
          <li>🩼 목발 / 부상</li>
          <li>👶 유모차</li>
          <li>🧳 캐리어</li>
        </ul>
      </div>
    </aside>
  );
}
