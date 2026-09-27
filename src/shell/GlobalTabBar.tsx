import { NavLink } from 'react-router-dom';
import { TABS } from '../tabs';
import './GlobalTabBar.css';

// 하단 전체 탭바. 선택된 탭은 baton 이 아니라 그 탭의 색 + 굵은 글자 + 밑줄
const GlobalTabBar = () => (
  <nav className="global-tabbar" aria-label="MOCHESTRA 탭">
    {TABS.map(({ path, label, className, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) => `global-tab ${className}${isActive ? ' active' : ''}`}
      >
        <Icon size={24} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default GlobalTabBar;
