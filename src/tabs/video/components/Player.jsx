export default function Player({ videoId, onPlayClick }) {
  return (
    <section className="player">
      {videoId ? (
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title="YouTube player"
        />
      ) : (
        <button className="play" aria-label="재생" onClick={onPlayClick}>
          <svg viewBox="0 0 100 100">
            <polygon points="20,8 92,50 20,92" fill="currentColor" />
          </svg>
        </button>
      )}
    </section>
  );
}
