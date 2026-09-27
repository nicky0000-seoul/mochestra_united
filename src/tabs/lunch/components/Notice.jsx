// 안내 화면 (위치 권한 / 결과 없음 / 오류)
export default function Notice({ icon, title, children, actions }) {
  return (
    <div className="notice">
      <div className="icon" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{children}</p>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
