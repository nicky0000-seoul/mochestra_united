import { Navigate, Route, Routes } from 'react-router-dom';
import TabHeader from '../../shell/TabHeader';
import SectionTabs from './components/SectionTabs';
import HomePage from './components/HomePage';
import HistoryPage from './components/HistoryPage';
import StatsPage from './components/StatsPage';
import './emotions.css';
import './FreesiaTab.css';

// 프리지아 (원본: D:\freesia_1.0.1). 채팅·히스토리·통계를 /freesia/… 아래에 둠.
// firebase 를 불러오면 익명 로그인이 시작되므로 App.tsx 에서 이 탭을 열 때만 불러옴(lazy)
export default function FreesiaTab() {
  return (
    <div className="freesia-tab">
      <TabHeader title="프리지아" subtitle="emotional coaching service">
        <SectionTabs />
      </TabHeader>
      <Routes>
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="chat" replace />} />
      </Routes>
    </div>
  );
}
