import React from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { AppRoute, UserProfile } from '../types/study';
import { AvatarMonogram } from './AvatarMonogram';

interface MainNavbarProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  profile: UserProfile | null;
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

const NAV_ITEMS: { id: Exclude<AppRoute, 'profile'>; label: string; hash: string }[] = [
  { id: 'home', label: 'Home', hash: '#home' },
  { id: 'study-space', label: 'Study Space', hash: '#study-space' },
  { id: 'find-buddies', label: 'Find Buddies', hash: '#find-buddies' },
  { id: 'study-room', label: 'Study Room', hash: '#study-room' },
];

export const MainNavbar: React.FC<MainNavbarProps> = ({
  activeRoute,
  onNavigate,
  profile,
  mobileNavOpen,
  onToggleMobileNav,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/88 backdrop-blur-xl border-b border-[#E6E3F2]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B66EE] to-[#5643C4] flex items-center justify-center text-white shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="font-display font-extrabold text-lg tracking-tight text-[#201D32]">
            Study<span className="text-[#6A55DC]">Buddy</span>
          </span>
        </a>

        {/* Zone 2: 4 Single-line Nav Links (underline cleared immediately when activeRoute === 'profile') */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute !== 'profile' && activeRoute === item.id;
            return (
              <a
                key={item.id}
                href={item.hash}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`relative py-5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#6A55DC]'
                    : 'text-[#5E5A75] hover:text-[#201D32]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-0.5 rounded-full bg-[#6A55DC] transition-all duration-200 origin-center ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#profile"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('profile');
            }}
            className={`inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
              activeRoute === 'profile'
                ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#43388C] shadow-xs'
                : 'border-[#E6E3F2] bg-white text-[#201D32] hover:border-[#6A55DC]/50 hover:bg-[#FAF9FD]'
            }`}
          >
            <AvatarMonogram
              name={profile?.name || 'Student'}
              color={profile?.avatarColor || '#6A55DC'}
              size="sm"
            />
            <span className="max-w-[120px] truncate">
              {profile?.name ? profile.name : 'Set Up Profile'}
            </span>
          </a>

          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 rounded-lg border border-[#E6E3F2] text-[#3D3956]"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-[#E6E3F2] bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute !== 'profile' && activeRoute === item.id;
            return (
              <a
                key={item.id}
                href={item.hash}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-[#F4F1FF] text-[#6A55DC]'
                    : 'text-[#3D3956] hover:bg-[#FAF9FD]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
};
