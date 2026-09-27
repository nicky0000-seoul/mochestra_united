const TABS = [
  { id: 'search', label: '검색' },
  { id: 'favorites', label: '즐겨찾기' },
  { id: 'recommended', label: '추천 리스트' },
];

export default function Tabs({ active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn${active === tab.id ? ' active' : ''}`}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
