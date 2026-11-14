import React, { useEffect, useRef } from 'react';
import { Bot, ChevronRight, Menu, Search } from 'lucide-react';
import { StudySpaceTab } from '../types/study';

interface TopbarProps {
  activeTab: StudySpaceTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenMobileMenu: () => void;
  onOpenTutor: () => void;
}

const TAB_LABELS: Record<StudySpaceTab, string> = {
  overview: 'Overview',
  library: 'My Library',
  flashcards: 'Flashcards',
  quiz: 'Practice Quiz',
  notes: 'My Notes',
  focus: 'Focus Timer',
  tasks: 'Tasks & Progress',
  resources: 'Resources',
};

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenMobileMenu,
  onOpenTutor,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-[#F4F3F8]/95 backdrop-blur-md border-b border-[#E6E4F0] px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-[#3D3956] hover:bg-white border border-transparent hover:border-[#E6E4F0]"
          aria-label="Open Study Space menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-sm whitespace-nowrap shrink-0">
          <span className="text-[#77758A] hidden sm:inline">Study Space</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9B98AD] hidden sm:inline" />
          <span className="font-display font-bold text-[#211E36]">
            {TAB_LABELS[activeTab]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative hidden sm:flex items-center"
        >
          <Search className="w-4 h-4 text-[#8B889E] absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search library & notes..."
            aria-label="Search library and notes"
            className="w-52 md:w-64 pl-9 pr-14 py-1.5 text-sm bg-white border border-[#E6E4F0] rounded-xl text-[#211E36] placeholder:text-[#9895AA] focus:outline-none focus:border-[#6A55DC] focus:ring-2 focus:ring-[#6A55DC]/15"
          />
          <kbd className="absolute right-2.5 text-[11px] font-mono text-[#9895AA] pointer-events-none">
            Ctrl K
          </kbd>
        </form>

        <button
          type="button"
          onClick={onOpenTutor}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFD8FA] bg-[#F4F1FF] text-xs font-semibold text-[#4E4396] hover:bg-[#EAE4FF] whitespace-nowrap shrink-0"
        >
          <Bot className="w-3.5 h-3.5 text-[#6A55DC]" />
          Ask AI Tutor
        </button>
      </div>
    </div>
  );
};
