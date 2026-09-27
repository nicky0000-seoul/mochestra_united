import StarIcon from './StarIcon';

export default function ResultList({
  items,
  emptyText,
  selectedId,
  onPlay,
  showStar = false,
  isFav,
  onToggleFavorite,
}) {
  if (!items.length) {
    return (
      <div className="list">
        <div className="empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className="list" aria-live="polite">
      {items.map((it) => (
        <div
          key={it.id}
          className={`list-item${it.id === selectedId ? ' active-item' : ''}`}
          onClick={() => onPlay(it.id)}
        >
          <div className="title">{it.title}</div>
          {showStar && (
            <button
              type="button"
              className={`star-btn${isFav(it.id) ? ' is-fav' : ''}`}
              aria-label="즐겨찾기"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(it);
              }}
            >
              <StarIcon />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
