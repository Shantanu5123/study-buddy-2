import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  HelpCircle,
  StickyNote,
  Timer,
  CheckSquare,
  Compass,
  ShieldCheck,
  X,
} from 'lucide-react';
import { StudySpaceTab } from '../types/study';

interface SidebarProps {
  activeTab: StudySpaceTab;
  onSelectTab: (tab: StudySpaceTab) => void;
  libraryCount: number;
  activeTodoCount: number;
  needsReviewCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: StudySpaceTab;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  libraryCount,
  activeTodoCount,
  needsReviewCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const studyItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'library', label: 'My Library', icon: <FolderOpen className="w-4 h-4" />, count: libraryCount },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <Layers className="w-4 h-4" />,
      count: needsReviewCount > 0 ? needsReviewCount : undefined,
    },
    { id: 'quiz', label: 'Practice Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'notes', label: 'My Notes', icon: <StickyNote className="w-4 h-4" /> },
  ];

  const habitItems: NavItem[] = [
    { id: 'focus', label: 'Focus Timer', icon: <Timer className="w-4 h-4" /> },
    {
      id: 'tasks',
      label: 'Tasks & Progress',
      icon: <CheckSquare className="w-4 h-4" />,
      count: activeTodoCount > 0 ? activeTodoCount : undefined,
    },
    { id: 'resources', label: 'Resources', icon: <Compass className="w-4 h-4" /> },
  ];

  const renderGroup = (heading: string, items: NavItem[]) => (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#9A95B8]">
        {heading}
      </div>
      <nav className="space-y-1" aria-label={heading}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#6A55DC] text-white shadow-sm'
                  : 'text-[#C8C3D9] hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[#C8C3D9]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const sidebarContent = (
    <div
      className="flex flex-col h-full w-64 px-4 py-5 text-[#F5F2FF] select-none"
      style={{
        background: 'linear-gradient(180deg, #201C39 0%, #211E3B 55%, #19172D 100%)',
      }}
    >
      <div className="flex items-center justify-between px-2 mb-5 lg:hidden">
        <span className="font-display font-bold text-sm text-[#C8C3D9]">
          Study Space Menu
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-[#C8C3D9] hover:bg-white/10"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5">
        {renderGroup('Study Materials', studyItems)}
        {renderGroup('Habits & Tools', habitItems)}
      </div>

      <div className="mt-4 p-3 rounded-xl border border-white/10 bg-white/[0.06] text-xs leading-relaxed text-[#C8C3D9]">
        <div className="flex items-center gap-2 font-semibold text-white mb-1">
          <ShieldCheck className="w-4 h-4 text-[#A99EFF] shrink-0" />
          <span>Saved automatically</span>
        </div>
        <p className="text-[11px] text-[#B8B3C9]">
          Documents, cards, tasks, and scores persist locally across reloads.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 self-start h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
};
