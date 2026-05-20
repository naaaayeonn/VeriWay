import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon" aria-hidden="true">♿</span>
          <h1>VeriWay</h1>
        </div>
        <p className="tagline">배리어프리 이동경로 추천 서비스</p>
      </div>
    </header>
  );
}
