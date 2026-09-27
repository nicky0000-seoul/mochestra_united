import { lazy, Suspense, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import GlobalTabBar from './shell/GlobalTabBar';
import TabPlaceholder from './shell/TabPlaceholder';
import MorningTab from './tabs/morning/MorningTab';
import VideoTab from './tabs/video/VideoTab';
import LunchTab from './tabs/lunch/LunchTab';
import { TABS } from './tabs';

// 프리지아는 firebase(익명 로그인)와 차트 라이브러리를 쓰므로 탭을 열 때만 불러옴
const FreesiaTab = lazy(() => import('./tabs/freesia/FreesiaTab'));

// 옮겨 온 탭의 화면. 없으면 자리 표시 화면
const TAB_SCREENS: Record<string, ReactElement> = {
  '/morning': <MorningTab />,
  '/lunch': <LunchTab />,
  '/video': <VideoTab />,
  '/freesia': (
    <Suspense fallback={<p className="tab-loading">불러오는 중…</p>}>
      <FreesiaTab />
    </Suspense>
  ),
};

// 탭마다 화면을 탭 클래스로 감싸서 그 안의 --accent 가 탭 색이 되게 함.
// 각 탭은 path/* 아래에서 자기 화면을 가질 수 있음 (예: /freesia/history)
function App() {
  return (
    <div className="app">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={TABS[0].path} replace />} />
          {TABS.map(({ path, label, className }) => (
            <Route
              key={path}
              path={`${path}/*`}
              element={
                <section className={`tab-screen ${className}`}>
                  {TAB_SCREENS[path] ?? <TabPlaceholder label={label} />}
                </section>
              }
            />
          ))}
          <Route path="*" element={<Navigate to={TABS[0].path} replace />} />
        </Routes>
      </main>
      <GlobalTabBar />
    </div>
  );
}

export default App;
