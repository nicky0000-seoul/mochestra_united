import { useEffect, useRef, useState } from 'react';
import { DEFAULT_POS, FOOD, SDK_ERRORS, normalize, toLatLng } from '../lib/kakao';
import PlaceInfo from './PlaceInfo';

// 화면 2: 지도 검색. 지도는 처음 열 때 한 번만 만들고, 목록 화면에 갔다 와도 유지
export default function MapView({ active, sdk, pos, selected, onSelect }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const meRef = useRef(null);
  const pinsRef = useRef({ overlays: [], els: new Map() });
  const reqRef = useRef(0);
  const suppressRef = useRef(false); // 코드로 지도를 움직일 때는 "이 지역에서 다시 검색"을 띄우지 않음
  const queryRef = useRef('');
  const posRef = useRef(pos);
  const onSelectRef = useRef(onSelect);
  const toastTimer = useRef(null);

  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [moved, setMoved] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    queryRef.current = query;
    posRef.current = pos;
    onSelectRef.current = onSelect;
  });

  const center = () => posRef.current || DEFAULT_POS;

  function suppressMove(fn) {
    suppressRef.current = true;
    fn();
    setTimeout(() => (suppressRef.current = false), 400);
  }

  function drawPins(list) {
    const map = mapRef.current;
    pinsRef.current.overlays.forEach((o) => o.setMap(null));
    const overlays = [];
    const els = new Map();
    list.forEach((r) => {
      const el = document.createElement('button');
      el.className = 'kpin';
      el.setAttribute('aria-label', r.name);
      el.addEventListener('click', () => onSelectRef.current(r));
      const overlay = new window.kakao.maps.CustomOverlay({
        position: toLatLng(r),
        content: el,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 2,
        clickable: true,
      });
      overlay.setMap(map);
      overlays.push(overlay);
      els.set(r.id, el);
    });
    pinsRef.current = { overlays, els };
  }

  // fromInput: 검색창에서 Enter → 주변 5km(없으면 전국)에서 찾고 결과에 맞춰 지도 이동
  //            그 외 → 지금 보이는 지도 범위 안에서 찾기
  function searchMap(fromInput = false) {
    const map = mapRef.current;
    if (!map) return;
    const req = ++reqRef.current;
    setLoading(true);
    setError(false);
    setMoved(false);

    const { Places, Status } = window.kakao.maps.services;
    const places = new Places();
    const q = queryRef.current.trim();
    let nationwide = false;

    const done = (data, status) => {
      if (req !== reqRef.current) return;
      if (fromInput && status === Status.ZERO_RESULT && !nationwide) {
        nationwide = true;
        places.keywordSearch(q, done, { category_group_code: FOOD });
        return;
      }
      const list = status === Status.OK ? data.map((p) => normalize(p, posRef.current)) : [];
      setLoading(false);
      setError(status !== Status.OK && status !== Status.ZERO_RESULT);
      setItems(list);
      drawPins(list);
      if (fromInput && list.length) {
        const bounds = new window.kakao.maps.LatLngBounds();
        list.forEach((r) => bounds.extend(toLatLng(r)));
        suppressMove(() => map.setBounds(bounds));
      }
    };

    if (fromInput && q) {
      places.keywordSearch(q, done, { location: map.getCenter(), radius: 5000, category_group_code: FOOD });
    } else if (q) {
      places.keywordSearch(q, done, { bounds: map.getBounds(), category_group_code: FOOD });
    } else {
      places.categorySearch(FOOD, done, { bounds: map.getBounds() });
    }
  }

  function updateMe() {
    const map = mapRef.current;
    if (meRef.current) meRef.current.setMap(null);
    meRef.current = null;
    if (!map || !posRef.current) return;
    const el = document.createElement('div');
    el.className = 'kme';
    meRef.current = new window.kakao.maps.CustomOverlay({ position: toLatLng(posRef.current), content: el, zIndex: 1 });
    meRef.current.setMap(map);
  }

  // 처음 지도 탭을 열 때 지도 만들기. 첫 검색은 렌더가 끝난 뒤(다음 틱)에
  useEffect(() => {
    if (!active || sdk.status !== 'ready' || mapRef.current) return;
    const { maps } = window.kakao;
    const map = new maps.Map(mapEl.current, { center: toLatLng(center()), level: 4 });
    mapRef.current = map;
    const onMoved = () => {
      if (!suppressRef.current) setMoved(true);
    };
    maps.event.addListener(map, 'dragend', onMoved);
    maps.event.addListener(map, 'zoom_changed', onMoved);
    updateMe();
    const t = setTimeout(() => searchMap(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sdk.status]);

  // 숨겨져 있던 지도를 다시 보일 때 크기 재계산
  useEffect(() => {
    if (active) mapRef.current?.relayout();
  }, [active]);

  // 위치가 바뀌면 내 위치 점을 옮기고, 지도를 이동한 뒤 다시 검색
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    updateMe();
    suppressMove(() => map.setCenter(toLatLng(center())));
    const t = setTimeout(() => searchMap(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  // 선택된 식당의 핀 강조
  useEffect(() => {
    pinsRef.current.els.forEach((el, id) => el.classList.toggle('selected', id === selected?.id));
  }, [selected, items]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  }

  function goToMyLocation() {
    const map = mapRef.current;
    if (!map) return;
    suppressMove(() => {
      map.setLevel(4);
      map.setCenter(toLatLng(center()));
    });
    searchMap();
    showToast(pos ? '내 위치로 이동했어요' : '위치 권한이 없어 기본 위치로 이동했어요');
  }

  const selectedHere = items.find((r) => r.id === selected?.id);
  let hint = null;
  if (sdk.status === 'error') hint = SDK_ERRORS[sdk.error][0];
  else if (sdk.status === 'loading') hint = '지도를 불러오고 있어요…';
  else if (loading) hint = '식당을 찾고 있어요…';
  else if (error) hint = '식당 정보를 불러오지 못했어요';
  else if (!selectedHere && !items.length) hint = '이 지역에 맞는 식당이 없어요';
  else if (!selectedHere) hint = `핀을 눌러 식당 정보를 확인하세요 · 식당 ${items.length}곳${pos ? '' : ' (기본 위치 기준)'}`;

  return (
    <section className="view">
      <label className="search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <input
          type="search"
          placeholder="지역, 식당, 메뉴 검색 후 Enter"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            queryRef.current = e.target.value;
            if (!e.target.value) searchMap(); // 검색창의 ✕ 로 지웠을 때
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) searchMap(true);
          }}
        />
      </label>

      <div className="map-wrap">
        <div ref={mapEl} className="map" aria-label="지도" />
        {(loading || sdk.status === 'loading') && sdk.status !== 'error' && (
          <div className="map-loading"><span className="spinner" />불러오는 중…</div>
        )}
        {moved && !loading && (
          <button type="button" className="map-btn research" onClick={() => searchMap()}>↻ 이 지역에서 다시 검색</button>
        )}
        {sdk.status === 'ready' && (
          <button type="button" className="map-btn locate" aria-label="내 위치로" onClick={goToMyLocation}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="8.5" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3" /></svg>
          </button>
        )}
        <div className="map-sheet">
          {hint ? (
            <span className="hint">{hint}</span>
          ) : (
            <>
              <div className="thumb" aria-hidden="true">{selectedHere.emoji}</div>
              <PlaceInfo place={selectedHere} />
            </>
          )}
        </div>
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </section>
  );
}
