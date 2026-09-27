import { Navigate, Route, Routes } from 'react-router-dom';
import GlobalTabBar from './shell/GlobalTabBar';
import TabPlaceholder from './shell/TabPlaceholder';
import { TABS } from './tabs';

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
                  <TabPlaceholder label={label} />
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
