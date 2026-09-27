import TabHeader from './TabHeader';
import './TabPlaceholder.css';

// 아직 옮기지 않은 탭 자리
const TabPlaceholder = ({ label }: { label: string }) => (
  <div className="placeholder">
    <TabHeader title={label} />
    <div className="placeholder-card">
      <p className="placeholder-title">{label} 옮기는 중</p>
      <p className="placeholder-text">기존 앱을 이 탭으로 옮기면 여기에 나타나요.</p>
      <button type="button" className="placeholder-button">탭 색 버튼 예시</button>
    </div>
  </div>
);

export default TabPlaceholder;
