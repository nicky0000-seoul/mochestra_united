# mochestra_united

MOCHESTRA 통합 앱. 모닝팩 · 런치박스 · 프리지아 · 유튜브 네 앱을 하나의 React 앱의 탭으로 합침 (React 19 + Vite + TypeScript, react-router).

## 실행 / 배포

- 개발 서버: `npm run dev -- --port 5180` → http://localhost:5180 (`.claude/launch.json`의 `united`)
- 빌드: `npm run build` (tsc + vite) / 린트: `npm run lint` (oxlint)
- 이 폴더는 D 드라이브라 git이 "dubious ownership" 오류를 냄. `git -c safe.directory=D:/mochestra_united ...`로 실행하거나 `git config --global --add safe.directory D:/mochestra_united`를 한 번 실행
- 배포: Vercel 예정. `vercel.json`이 모든 경로를 `index.html`로 보냄 (탭 주소 새로고침용)

## 구조

- `src/tabs.ts` — 네 탭의 주소 · 이름 · 탭 클래스 · 아이콘 (탭 추가/순서 변경은 여기만)
- `src/App.tsx` — 탭별 라우트. 각 탭 화면은 `<section className="tab-screen tab-xxx">`로 감쌈 → 그 안의 `--accent`가 탭 색
- `src/shell/` — `GlobalTabBar`(하단 전체 탭바), `ThemeToggle`, `TabPlaceholder`(아직 안 옮긴 탭)
- `src/tabs/{morning,lunch,freesia,video}/` — 옮겨 올 각 앱의 코드 자리
- `src/styles/tokens.css` — **MOCHESTRA 공통 토큰 기준본 (v2)**. 개별 앱 사본보다 이 파일이 우선

## 규칙

- 색은 `tokens.css` 변수만 사용. 컴포넌트는 `--accent`, `--accent-strong`, `--accent-fill`, `--on-accent`, `--accent-edge`, `--accent-soft`만 참조하고 탭 클래스가 실제 색을 고름
- baton(꿀색 #E9CB3C)은 MOCHESTRA 전체용: 브랜드 마크(`.brand-mark`), 공통 화면 버튼. 라이트에서 노랑은 면으로만, 글자·포커스는 ink
- 하단 탭바에서 선택된 탭은 그 탭의 색 + 굵은 글자 + 밑줄
- 테마: `<html data-theme="light|dark">`, 저장 키 `mochestra-theme`
- 카드 간격 36, 카드 모서리 28 / 안쪽 16 / 알약 999 / 탭바 위쪽 24
- 공통 스타일 문서: `D:\MOCHESTRA_공통_스타일.pdf`
- 커밋 메시지는 `feat:`, `fix:`, `style:`, `docs:` 같은 conventional 접두어 + 영어 한 줄

## 원본 앱 (옮겨 올 곳)

| 탭 | 원본 폴더 | 구조 | 옮길 때 주의 |
|---|---|---|---|
| 모닝팩 | `D:\mochestra_mpack` | React (JS) | 기상청·에어코리아·Unsplash API 키 (`.env`) |
| 유튜브 | `D:\mochestra_youtube` | React (JS) | YouTube API 키 웹사이트 제한에 통합 앱 주소 추가 필요 |
| 프리지아 | `D:\freesia_1.0.1` | React (TS) + Firebase | 내부 경로 /home·/history·/stats → /freesia/…, 채팅 서버는 Railway (`freesia-production-5edd.up.railway.app`) CORS에 통합 앱 주소 추가 |
| 런치박스 | `D:\lunchbox` | HTML/JS (빌드 없음) | React로 다시 작성. 카카오 지도 키의 허용 도메인에 통합 앱 주소 추가 |

## 진행 상황

작업을 마칠 때마다 이 섹션을 업데이트할 것.

### 완료
- 2026-09-28 바깥 틀: 공통 토큰 v2, 테마 전환, 하단 전체 탭바, 네 탭 라우트(자리 표시 화면)

### 다음 할 일
- [x] GitHub 저장소 만들고 첫 커밋 푸시 — https://github.com/nicky0000-seoul/mochestra_united
- [ ] Vercel 연결
- [ ] 모닝팩 옮기기
- [ ] 유튜브 옮기기
- [ ] 프리지아 옮기기
- [ ] 런치박스 React로 옮기기
- [ ] 글꼴 통일 (Pretendard / Noto Sans KR / 디자인 시스템 v1 글꼴 중 결정)
