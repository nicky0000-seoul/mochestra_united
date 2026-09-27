import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, FOOD, NEARBY_RADIUS, SDK_ERRORS, SORTS, normalize, toLatLng } from '../lib/kakao';
import PlaceInfo from './PlaceInfo';
import Notice from './Notice';

const LOC_ERRORS = {
  denied: ['위치 권한이 필요해요', '브라우저 설정에서 위치 접근을 허용하면 내 주변 식당을 거리순으로 보여드려요.'],
  unavailable: ['현재 위치를 찾지 못했어요', 'GPS 신호가 약하거나 네트워크가 불안정할 수 있어요. 잠시 후 다시 시도해 주세요.'],
  unsupported: ['위치 기능을 쓸 수 없어요', '이 브라우저는 위치 기능을 지원하지 않아요.'],
};

// 화면 1: 내 주변 식당
export default function NearbyView({ sdk, loc, selected, onSelect, onRetryLocation, onBrowse }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState('distance');
  const [category, setCategory] = useState('전체');
  const [retry, setRetry] = useState(0);
  // key: 이 결과가 어떤 검색 조건에 대한 것인지. 지금 조건과 다르면 "불러오는 중"
  const [result, setResult] = useState({ key: null, status: 'ok', items: [], page: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const reqRef = useRef(0);

  // 입력이 멈추고 0.4초 뒤에 검색
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const pos = loc.pos;
  const ready = sdk.status === 'ready' && pos;
  const searchKey = ready ? JSON.stringify([pos, sort, category, debouncedQuery, retry]) : null;

  useEffect(() => {
    if (!searchKey) return;
    const req = ++reqRef.current;
    const { Places, SortBy, Status } = window.kakao.maps.services;
    const keyword = [debouncedQuery, category === '전체' ? '' : category].filter(Boolean).join(' ');
    const options = {
      location: toLatLng(pos),
      radius: NEARBY_RADIUS,
      sort: sort === 'distance' ? SortBy.DISTANCE : SortBy.ACCURACY,
    };

    // "더 보기"(pagination.nextPage)도 같은 콜백으로 결과가 들어옴
    const done = (data, status, pagination) => {
      if (req !== reqRef.current) return; // 더 새로운 검색이 시작됐으면 무시
      setLoadingMore(false);
      if (status === Status.OK) {
        const items = data.map((p) => normalize(p, pos));
        setResult((prev) => ({
          key: searchKey,
          status: 'ok',
          items: pagination.current > 1 ? prev.items.concat(items) : items,
          page: pagination,
        }));
      } else {
        setResult({ key: searchKey, status: status === Status.ZERO_RESULT ? 'ok' : 'error', items: [], page: null });
      }
    };

    const places = new Places();
    if (keyword) places.keywordSearch(keyword, done, { ...options, category_group_code: FOOD });
    else places.categorySearch(FOOD, done, options);
    // pos·sort 등은 searchKey 에 모두 들어 있음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  function loadMore() {
    if (!result.page?.hasNextPage || loadingMore) return;
    setLoadingMore(true);
    result.page.nextPage();
  }

  function resetFilters() {
    setQuery('');
    setDebouncedQuery('');
    setCategory('전체');
  }

  function renderBody() {
    if (sdk.status === 'error') {
      const [title, desc] = SDK_ERRORS[sdk.error];
      return <Notice icon="🗺️" title={title}>{desc}</Notice>;
    }

    if (loc.status === 'denied') {
      const [title, desc] = LOC_ERRORS[loc.error] ?? LOC_ERRORS.unavailable;
      return (
        <Notice
          icon="📍"
          title={title}
          actions={
            <>
              <button type="button" className="btn primary" onClick={onRetryLocation}>다시 시도</button>
              <button type="button" className="btn" onClick={onBrowse}>위치 없이 둘러보기</button>
            </>
          }
        >
          {desc}
        </Notice>
      );
    }

    if (!ready || result.key !== searchKey) {
      const caption = loc.status === 'locating' ? '현재 위치를 확인하고 있어요…' : '주변 식당을 불러오고 있어요…';
      return (
        <>
          <p className="loading-caption">{caption}</p>
          <ul className="result-list" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="result skeleton">
                <div className="thumb" />
                <div className="info">
                  <div className="line mid" />
                  <div className="line short" />
                  <div className="line" />
                </div>
              </li>
            ))}
          </ul>
        </>
      );
    }

    if (result.status === 'error') {
      return (
        <Notice
          icon="⚠️"
          title="식당 정보를 불러오지 못했어요"
          actions={<button type="button" className="btn primary" onClick={() => setRetry((n) => n + 1)}>다시 시도</button>}
        >
          카카오 개발자 콘솔에서 카카오맵 사용 설정이 켜져 있는지, 사이트 도메인이 등록돼 있는지 확인해 주세요.
        </Notice>
      );
    }

    const banner = loc.status === 'default' && (
      <div className="banner">
        기본 위치(서울시청) 기준으로 보여드리고 있어요
        <button type="button" onClick={onRetryLocation}>내 위치 사용</button>
      </div>
    );

    if (!result.items.length) {
      const what = debouncedQuery ? `‘${debouncedQuery}’에 맞는` : category === '전체' ? '주변에' : `주변에 ${category}`;
      return (
        <>
          {banner}
          <Notice
            icon="🍽️"
            title={`${what} 식당이 없어요`}
            actions={<button type="button" className="btn primary" onClick={resetFilters}>필터 초기화</button>}
          >
            반경 {NEARBY_RADIUS / 1000}km 안에서 찾지 못했어요. 다른 검색어를 입력하거나 필터를 바꿔 보세요.
          </Notice>
        </>
      );
    }

    return (
      <>
        {banner}
        <ul className="result-list">
          {result.items.map((r) => (
            <li
              key={r.id}
              className={`result${r.id === selected?.id ? ' selected' : ''}`}
              onClick={(e) => {
                if (!e.target.closest('a')) onSelect(r); // "카카오맵에서 보기" 링크는 그대로 열기
              }}
            >
              <div className="thumb" aria-hidden="true">{r.emoji}</div>
              <PlaceInfo place={r} />
            </li>
          ))}
        </ul>
        {result.page?.hasNextPage && (
          <button type="button" className="btn more" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </button>
        )}
      </>
    );
  }

  return (
    <section className="view">
      <label className="search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <input
          type="search"
          placeholder="식당 이름, 메뉴로 검색"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {/* 정렬 / 음식 종류 필터 */}
      <div className="chips">
        <div className="chip-group" role="radiogroup" aria-label="정렬">
          {SORTS.map((s) => (
            <button key={s.key} type="button" className="chip" role="radio" aria-checked={sort === s.key} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <span className="chip-divider" aria-hidden="true" />
        <div className="chip-group" role="radiogroup" aria-label="음식 종류">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="chip" role="radio" aria-checked={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="nearby-body">{renderBody()}</div>
    </section>
  );
}
