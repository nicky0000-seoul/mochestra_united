import ResultList from './ResultList';

export default function FavoritesPanel({ active, favorites, selectedId, onPlay }) {
  return (
    <section className={`panel${active ? ' active' : ''}`} role="tabpanel">
      <ResultList
        items={favorites}
        emptyText="즐겨찾기한 영상이 없어요"
        selectedId={selectedId}
        onPlay={onPlay}
      />
    </section>
  );
}
