import { formatDistance } from '../lib/kakao';

// 식당 카드·지도 시트에 공통으로 쓰는 정보 영역
export default function PlaceInfo({ place }) {
  return (
    <div className="info">
      <h3>{place.name}</h3>
      <p className="meta">
        {place.category}
        {place.distance != null && ` · ${formatDistance(place.distance)}`}
      </p>
      <p className="sub">
        <span>{place.address}</span>
        {place.phone && <span>{place.phone}</span>}
        {place.url && (
          <a className="link" href={place.url} target="_blank" rel="noopener noreferrer">
            카카오맵에서 보기 ↗
          </a>
        )}
      </p>
    </div>
  );
}
