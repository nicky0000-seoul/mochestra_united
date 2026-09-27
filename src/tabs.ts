import { MessageCircle, PlayCircle, Sun, UtensilsCrossed, type LucideIcon } from 'lucide-react';

// MOCHESTRA 의 네 탭. className 이 tokens.css 의 탭 컨텍스트(색)를 고름
export interface TabDef {
  path: string;
  label: string;
  className: string;
  icon: LucideIcon;
}

export const TABS: TabDef[] = [
  { path: '/morning', label: '모닝팩', className: 'tab-morning', icon: Sun },
  { path: '/lunch', label: '런치박스', className: 'tab-lunch', icon: UtensilsCrossed },
  { path: '/freesia', label: '프리지아', className: 'tab-emotion', icon: MessageCircle },
  { path: '/video', label: '유튜브', className: 'tab-video', icon: PlayCircle },
];
