import type { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import './TabHeader.css';

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode; // 헤더 아래에 붙는 탭 안 메뉴 등
}

// 탭 공통 헤더: 브랜드 마크(baton) + 탭 이름(탭 색) + 테마 전환. 스크롤해도 위에 고정
const TabHeader = ({ title, subtitle, children }: TabHeaderProps) => (
  <header className="tab-header">
    <div className="tab-header-top">
      <div className="tab-header-brand">
        <span className="brand-mark" aria-label="MOCHESTRA">M</span>
        <div>
          {subtitle && <p className="tab-header-subtitle">{subtitle}</p>}
          <h1 className="tab-header-title">{title}</h1>
        </div>
      </div>
      <ThemeToggle />
    </div>
    {children}
  </header>
);

export default TabHeader;
