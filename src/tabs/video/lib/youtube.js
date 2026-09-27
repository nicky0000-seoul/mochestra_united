// 링크나 11자리 영상 ID면 바로 재생
export const YOUTUBE_API_KEY = 'AIzaSyBBKXifYvOXHmaMAC2ka_2cszHay99PfMw';

const searchCache = new Map();
const pendingSearches = new Map();

export function parseVideoId(text) {
  const s = text.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function decode(s) {
  const t = document.createElement('textarea');
  t.innerHTML = s;
  return t.value;
}

export async function searchYouTube(query, apiKey = YOUTUBE_API_KEY) {
  const cacheKey = query.trim().toLocaleLowerCase();
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);
  if (pendingSearches.has(cacheKey)) return pendingSearches.get(cacheKey);

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '10',
    q: query,
    key: apiKey,
    regionCode: 'KR',
  });
  const request = fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error.message);
      const results = data.items.map((v) => ({
        id: v.id.videoId,
        title: decode(v.snippet.title),
        channel: decode(v.snippet.channelTitle),
        thumb: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default.url,
      }));
      searchCache.set(cacheKey, results);
      return results;
    })
    .finally(() => pendingSearches.delete(cacheKey));

  pendingSearches.set(cacheKey, request);
  return request;
}
