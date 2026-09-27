import { useCallback, useRef, useState } from 'react';
import TabHeader from '../../shell/TabHeader';
import Tabs from './components/Tabs';
import SearchPanel from './components/SearchPanel';
import FavoritesPanel from './components/FavoritesPanel';
import RecommendedPanel from './components/RecommendedPanel';
import Player from './components/Player';
import KeyDialog from './components/KeyDialog';
import { useFavorites } from './hooks/useFavorites';
import { getItem, setItem } from './lib/storage';
import { YOUTUBE_API_KEY } from './lib/youtube';
import './VideoTab.css';

// 유튜브 (원본: D:\mochestra_youtube 의 App.jsx)
export default function VideoTab() {
  const [activeTab, setActiveTab] = useState('search');
  const [items, setItems] = useState([]);
  const [recommended] = useState([]); // 추천 리스트 데이터 소스는 준비 중
  const [selectedId, setSelectedId] = useState(null);
  const [apiKey, setApiKey] = useState(() => getItem('yt_api_key', '') || YOUTUBE_API_KEY);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { favorites, isFav, toggleFavorite } = useFavorites();
  const searchPanelRef = useRef(null);

  const play = useCallback((id) => setSelectedId(id), []);

  function handleDialogClose(savedValue) {
    setDialogOpen(false);
    if (savedValue !== null) {
      setApiKey(savedValue);
      setItem('yt_api_key', savedValue);
    }
  }

  function handlePlayButtonClick() {
    if (items.length) play(items[0].id);
    else searchPanelRef.current?.focusInput();
  }

  return (
    <div className="video-tab">
      <TabHeader title="유튜브" subtitle="video" />
      <div className="video-card">
        <Tabs active={activeTab} onChange={setActiveTab} />

        <SearchPanel
          ref={searchPanelRef}
          active={activeTab === 'search'}
          apiKey={apiKey}
          onNeedApiKey={() => setDialogOpen(true)}
          items={items}
          setItems={setItems}
          selectedId={selectedId}
          onPlay={play}
          isFav={isFav}
          onToggleFavorite={toggleFavorite}
        />
        <FavoritesPanel
          active={activeTab === 'favorites'}
          favorites={favorites}
          selectedId={selectedId}
          onPlay={play}
        />
        <RecommendedPanel
          active={activeTab === 'recommended'}
          recommended={recommended}
          selectedId={selectedId}
          onPlay={play}
        />

        <Player videoId={selectedId} onPlayClick={handlePlayButtonClick} />

        <p className="hint">
          검색어 또는 YouTube 링크를 입력하세요 ·{' '}
          <a onClick={() => setDialogOpen(true)}>API 키 설정</a>
        </p>

        <KeyDialog open={dialogOpen} initialValue={apiKey} onClose={handleDialogClose} />
      </div>
    </div>
  );
}
