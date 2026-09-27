import { useEffect, useState } from 'react';
import TabHeader from '../../shell/TabHeader';
import { DEFAULT_POS, getPosition, loadKakaoSdk } from './lib/kakao';
import NearbyView from './components/NearbyView';
import MapView from './components/MapView';
import './LunchTab.css';

const VIEWS = [
  { key: 'nearby', label: '내 주변 식당' },
  { key: 'map', label: '지도 검색' },
];

const toLoc = (result) =>
  result.pos ? { status: 'ready', error: null, pos: result.pos } : { status: 'denied', error: result.error, pos: null };

// 런치박스 (원본: D:\lunchbox 의 HTML/JS 앱을 React 로 다시 작성)
export default function LunchTab() {
  const [view, setView] = useState('nearby');
  const [sdk, setSdk] = useState({ status: 'loading', error: null });
  // status: locating | ready | denied | default(위치 없이 둘러보기)
  const [loc, setLoc] = useState({ status: 'locating', error: null, pos: null });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    loadKakaoSdk().then(
      () => alive && setSdk({ status: 'ready', error: null }),
      (error) => alive && setSdk({ status: 'error', error }),
    );
    getPosition().then((result) => alive && setLoc(toLoc(result)));
    return () => {
      alive = false;
    };
  }, []);

  async function retryLocation() {
    setLoc({ status: 'locating', error: null, pos: null });
    setLoc(toLoc(await getPosition()));
  }

  return (
    <div className="lunch-tab">
      <TabHeader title="런치박스" subtitle="lunch box">
        <nav className="view-tabs" role="tablist" aria-label="런치박스 화면">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              className={`view-tab${view === v.key ? ' active' : ''}`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </TabHeader>

      <div className="lunch-body">
        <div hidden={view !== 'nearby'}>
          <NearbyView
            sdk={sdk}
            loc={loc}
            selected={selected}
            onSelect={setSelected}
            onRetryLocation={retryLocation}
            onBrowse={() => setLoc({ status: 'default', error: null, pos: DEFAULT_POS })}
          />
        </div>
        <div hidden={view !== 'map'}>
          <MapView active={view === 'map'} sdk={sdk} pos={loc.pos} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}
