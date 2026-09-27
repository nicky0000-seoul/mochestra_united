import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, History, BarChart3 } from 'lucide-react';
import './SectionTabs.css';

// 프리지아 안의 화면 전환 탭 (헤더 아래). 하단은 MOCHESTRA 전체 탭 자리
const TABS = [
  { path: '/freesia/chat', icon: MessageCircle, label: '채팅' },
  { path: '/freesia/history', icon: History, label: '히스토리' },
  { path: '/freesia/stats', icon: BarChart3, label: '통계' },
];

const SectionTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="section-tabs" role="tablist" aria-label="프리지아 화면">
      {TABS.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => navigate(path)}
            className={`section-tab${isActive ? ' active' : ''}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SectionTabs;
