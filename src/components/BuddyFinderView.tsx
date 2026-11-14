import React, { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Search } from 'lucide-react';
import { BUDDY_PROFILES, computeMatchScore } from '../data/seedData';
import { StudyBuddyProfile, StudyStyle, UserProfile } from '../types/study';
import { AvatarMonogram } from './AvatarMonogram';

interface BuddyFinderViewProps {
  profile: UserProfile | null;
  onStartStudyRoom: (buddy: StudyBuddyProfile) => void;
  onOpenProfileSetup: () => void;
}

const SUBJECT_FILTERS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Economics',
];

const STYLE_LABELS: Record<StudyStyle, string> = {
  'deep-focus': 'Deep Focus',
  collaborative: 'Collaborative',
  mixed: 'Mixed',
};

export const BuddyFinderView: React.FC<BuddyFinderViewProps> = ({
  profile,
  onStartStudyRoom,
  onOpenProfileSetup,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [exam, setExam] = useState('');
  const [style, setStyle] = useState<'' | StudyStyle>('');
  const [timezone, setTimezone] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedSubjects([]);
    setExam('');
    setStyle('');
    setTimezone('');
    setOnlineOnly(false);
  };

  const buddiesWithScores = useMemo(() => {
    return BUDDY_PROFILES.map((buddy) => ({
      buddy,
      score: computeMatchScore(profile, buddy),
    }))
      .filter(({ buddy }) => {
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (
            !buddy.name.toLowerCase().includes(q) &&
            !buddy.bio.toLowerCase().includes(q) &&
            !buddy.subjects.some((s) => s.toLowerCase().includes(q))
          ) {
            return false;
          }
        }
        if (
          selectedSubjects.length > 0 &&
          !selectedSubjects.some((s) => buddy.subjects.includes(s))
        ) {
          return false;
        }
        if (exam && buddy.examTarget !== exam) return false;
        if (style && buddy.studyStyle !== style) return false;
        if (timezone && buddy.timezone !== timezone) return false;
        if (onlineOnly && !buddy.online) return false;
        return true;
      })
      .sort((a, b) => {
        if (profile && b.score !== a.score) return b.score - a.score;
        return Number(b.buddy.online) - Number(a.buddy.online);
      });
  }, [profile, search, selectedSubjects, exam, style, timezone, onlineOnly]);

  const filteredOnlineCount = buddiesWithScores.filter(
    ({ buddy }) => buddy.online
  ).length;

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6A55DC] mb-1">
            Peer Accountability
          </p>
          <h1 className="text-3xl font-extrabold text-[#211E36]">
            Find Buddies
          </h1>
          <p className="text-sm text-[#6E6B80] mt-1">
            Sorted by compatibility with your saved profile. Filter by subject, exam target, timezone, or study style.
          </p>
        </div>

        <p className="text-xs font-mono tabular-nums text-[#5E5A75]">
          {filteredOnlineCount} online now · {buddiesWithScores.length} shown
        </p>
      </div>

      {!profile && (
        <div className="bg-white border border-[#DED9F4] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#211E36]">
              Set up your study profile to unlock dynamic Match % scores
            </p>
            <p className="text-xs text-[#6E6B80] mt-0.5">
              Choose your exam target, subjects, study style, and timezone so compatible partners sort first.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenProfileSetup}
            className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold hover:bg-[#5B47C7] whitespace-nowrap shrink-0"
          >
            Set Up Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#211E36]">Filters</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6A55DC] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div>
            <label
              htmlFor="buddy-search"
              className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
            >
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8B889E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="buddy-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, subject, or bio..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#5E5A75] mb-2">Subjects</p>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_FILTERS.map((sub) => {
                const active = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#43388C]'
                        : 'border-[#E6E4F0] bg-white text-[#5E5A75] hover:border-[#6A55DC]/40'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="buddy-exam-filter"
              className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
            >
              Exam Target
            </label>
            <select
              id="buddy-exam-filter"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36]"
            >
              <option value="">All Exams</option>
              <option value="SAT">SAT</option>
              <option value="JEE">JEE</option>
              <option value="UPSC">UPSC</option>
              <option value="GMAT">GMAT</option>
              <option value="GRE">GRE</option>
              <option value="Board Exams">Board Exams</option>
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#5E5A75] mb-2">Study Style</p>
            <div className="space-y-1.5">
              {[
                { val: '', label: 'All styles' },
                { val: 'deep-focus', label: 'Deep Focus' },
                { val: 'collaborative', label: 'Collaborative' },
                { val: 'mixed', label: 'Mixed' },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className="flex items-center gap-2 text-sm text-[#3D3956] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="buddy-style"
                    checked={style === opt.val}
                    onChange={() => setStyle(opt.val as '' | StudyStyle)}
                    className="accent-[#6A55DC]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="buddy-tz-filter"
              className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
            >
              Timezone
            </label>
            <select
              id="buddy-tz-filter"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36]"
            >
              <option value="">All Timezones</option>
              <option value="IST">IST</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
              <option value="CET">CET</option>
            </select>
          </div>

          <label className="flex items-center justify-between pt-2 border-t border-[#F0EEF5] cursor-pointer">
            <span className="text-sm font-medium text-[#3D3956]">Online only</span>
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="w-4 h-4 accent-[#6A55DC]"
            />
          </label>
        </aside>

        {/* Buddy Cards Grid */}
        <div className="lg:col-span-8 xl:col-span-9">
          {buddiesWithScores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buddiesWithScores.map(({ buddy, score }) => (
                <div
                  key={buddy.id}
                  className="surface-card surface-card-interactive rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarMonogram
                          name={buddy.name}
                          color={buddy.avatarColor}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-[#211E36] truncate">
                            {buddy.name}
                          </h3>
                          <p className="text-xs text-[#77758A]">
                            {buddy.examTarget} · {buddy.timezone} ·{' '}
                            {STYLE_LABELS[buddy.studyStyle]}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        {profile ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#F4F1FF] border border-[#DFD8FA] text-xs font-mono font-bold tabular-nums text-[#6A55DC]">
                            {score}% Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#FAF9FD] border border-[#E6E4F0] text-[11px] font-mono text-[#77758A]">
                            Set profile for %
                          </span>
                        )}
                        <p
                          className={`text-xs font-semibold ${
                            buddy.online ? 'text-[#059669]' : 'text-[#8B889E]'
                          }`}
                        >
                          {buddy.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    {profile && (
                      <div className="h-1 w-full rounded-full bg-[#EEEBF7] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5F4DCC] to-[#8B79FA]"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    )}

                    <p className="text-xs font-semibold text-[#4E4396]">
                      {buddy.subjects.join(' · ')}
                    </p>

                    <p className="text-sm text-[#5E5A75] leading-relaxed">
                      {buddy.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0EEF5] flex items-center justify-between gap-3">
                    <span className="text-xs text-[#77758A] font-mono tabular-nums">
                      Goal: {buddy.weeklyHours} hrs/wk
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartStudyRoom(buddy)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5F4DCC] to-[#7461EC] text-white text-xs font-semibold hover:shadow-md hover:shadow-[#6A55DC]/20 transition-all whitespace-nowrap"
                    >
                      Study Together
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
              <p className="text-sm font-semibold text-[#211E36]">
                No study buddies match your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-4 py-2 rounded-xl border border-[#E6E4F0] text-xs font-semibold text-[#51469B]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
