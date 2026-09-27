import ResultList from './ResultList';

// 추천 리스트는 아직 데이터 소스가 없어 빈 목록으로 시작합니다.
export default function RecommendedPanel({ active, recommended, selectedId, onPlay }) {
  return (
    <section className={`panel${active ? ' active' : ''}`} role="tabpanel">
      <ResultList
        items={recommended}
        emptyText="추천 영상이 없어요"
        selectedId={selectedId}
        onPlay={onPlay}
      />
    </section>
  );
}
