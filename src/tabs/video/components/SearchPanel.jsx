import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ResultList from './ResultList';
import { parseVideoId, searchYouTube } from '../lib/youtube';

const SearchPanel = forwardRef(function SearchPanel(
  { active, apiKey, onNeedApiKey, items, setItems, selectedId, onPlay, isFav, onToggleFavorite },
  ref,
) {
  const [query, setQuery] = useState('');
  const [emptyMessage, setEmptyMessage] = useState('검색결과');
  const [pendingQuery, setPendingQuery] = useState(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => inputRef.current?.focus(),
  }));

  async function runSearch(q) {
    if (!apiKey) {
      setPendingQuery(q);
      onNeedApiKey();
      return;
    }
    setEmptyMessage('검색 중…');
    setItems([]);
    try {
      const results = await searchYouTube(q, apiKey);
      if (!results.length) setEmptyMessage('결과가 없어요');
      setItems(results);
    } catch (e) {
      setEmptyMessage('검색 실패: ' + e.message);
    }
  }

  // API 키를 새로 저장하면, 키가 없어서 미뤄뒀던 검색을 이어서 실행
  useEffect(() => {
    if (apiKey && pendingQuery) {
      const q = pendingQuery;
      setPendingQuery(null);
      runSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const id = parseVideoId(q);
    if (id) {
      setItems([]);
      setEmptyMessage('링크에서 바로 재생 중');
      onPlay(id);
    } else {
      runSearch(q);
    }
  }

  // 한글 조합 중 Enter는 무시하고, 조합이 끝난 Enter만 제출
  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) {
      e.preventDefault();
    }
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} role="tabpanel">
      <form className="search" onSubmit={handleSubmit} autoComplete="off">
        <input
          ref={inputRef}
          type="search"
          placeholder="YouTube"
          aria-label="YouTube 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" aria-label="검색">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <circle cx="10" cy="10" r="6.5" />
            <line x1="15" y1="15" x2="21" y2="21" />
          </svg>
        </button>
      </form>

      <ResultList
        items={items}
        emptyText={emptyMessage}
        selectedId={selectedId}
        onPlay={onPlay}
        showStar
        isFav={isFav}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
});

export default SearchPanel;
