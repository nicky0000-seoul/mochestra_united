// 카카오 지도 + 장소 검색 API (원본: D:\lunchbox\app.js)
// 키는 .env 의 VITE_KAKAO_APP_KEY, 도메인은 카카오 개발자 콘솔 › 플랫폼 › Web 에 등록

export const DEFAULT_POS = { lat: 37.566826, lng: 126.9786567 }; // 서울시청
export const NEARBY_RADIUS = 2000; // 내 주변 식당 검색 반경(m)
export const FOOD = 'FD6'; // 카카오 카테고리 코드: 음식점

export const SORTS = [
  { key: 'distance', label: '거리순' },
  { key: 'accuracy', label: '정확도순' },
];
export const CATEGORIES = ['전체', '한식', '분식', '중식', '일식', '양식', '도시락'];

// 카카오 카테고리 이름(예: "음식점 > 한식 > 국수")으로 썸네일 이모지 선택
const EMOJIS = [
  ['도시락', '🍱'], ['분식', '🍙'], ['치킨', '🍗'], ['패스트푸드', '🍔'], ['피자', '🍕'],
  ['일식', '🍣'], ['중식', '🥟'], ['양식', '🍝'], ['아시아', '🍜'], ['술집', '🍺'],
  ['간식', '🍩'], ['국수', '🍜'], ['한식', '🍚'],
];

export function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function distanceBetween(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const toLatLng = (p) => new window.kakao.maps.LatLng(p.lat, p.lng);

// 카카오 응답 → 화면에서 쓰는 모양
export function normalize(p, pos) {
  const parts = p.category_name.split(' > ');
  const place = {
    id: p.id,
    name: p.place_name,
    category: parts.slice(1).join(' › ') || '음식점',
    emoji: EMOJIS.find(([k]) => p.category_name.includes(k))?.[1] ?? '🍽️',
    address: p.road_address_name || p.address_name,
    phone: p.phone,
    url: /^https?:\/\//.test(p.place_url) ? p.place_url : null,
    lat: Number(p.y),
    lng: Number(p.x),
  };
  place.distance = p.distance ? Number(p.distance) : pos ? distanceBetween(pos, place) : null;
  return place;
}

// SDK 는 앱 전체에서 한 번만 불러옴 (실패하면 다음 호출 때 다시 시도)
let sdkPromise = null;

export function loadKakaoSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_APP_KEY;
    if (!key) return reject('nokey');
    if (window.kakao?.maps?.services) return resolve();

    const timer = setTimeout(() => reject('load'), 10000);
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`;
    script.onload = () => {
      if (!window.kakao?.maps) {
        clearTimeout(timer);
        return reject('load');
      }
      window.kakao.maps.load(() => {
        clearTimeout(timer);
        resolve();
      });
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject('load');
    };
    document.head.appendChild(script);
  });
  sdkPromise.catch(() => {
    sdkPromise = null;
  });
  return sdkPromise;
}

export function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ error: 'unsupported' });
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ pos: { lat: p.coords.latitude, lng: p.coords.longitude } }),
      (err) => resolve({ error: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      { timeout: 8000, maximumAge: 60000 },
    );
  });
}

export const SDK_ERRORS = {
  nokey: ['카카오 JavaScript 키가 필요해요', '.env 파일(배포는 Vercel 환경 변수)에 VITE_KAKAO_APP_KEY 를 넣어 주세요.'],
  load: [
    '카카오 지도를 불러오지 못했어요',
    `카카오 개발자 콘솔에서 카카오맵 사용 설정이 켜져 있는지, JavaScript SDK 도메인에 ${location.origin} 이 등록돼 있는지 확인해 주세요.`,
  ],
};
