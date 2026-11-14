import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Flame,
  Layers,
  RotateCw,
  Timer,
  Users,
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types/study';
import { AvatarMonogram } from './AvatarMonogram';

interface HomeViewProps {
  profile: UserProfile | null;
  onNavigate: (route: AppRoute) => void;
}

type PreviewTab = 'match' | 'flashcard' | 'sprint';

export const HomeView: React.FC<HomeViewProps> = ({ profile, onNavigate }) => {
  const [previewTab, setPreviewTab] = useState<PreviewTab>('match');
  const [demoFlipped, setDemoFlipped] = useState(false);

  return (
    <div className="bg-study-canvas text-[#201D32]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-subtle-grid border-b border-[#E6E3F2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wide text-[#6A55DC]">
                StudyBuddy · Personal Study Space &amp; Peer Accountability
              </p>

              <h1
                className="font-extrabold text-[#1E1A33] leading-[1.08] max-w-xl text-balance"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.6rem)' }}
              >
                Turn your notes into{' '}
                <span className="bg-gradient-to-r from-[#5B47C7] via-[#6A55DC] to-[#8B79FA] bg-clip-text text-transparent">
                  steady mastery
                </span>
                .
              </h1>

              <p className="text-base text-[#55516B] leading-relaxed max-w-lg">
                Upload PDFs, Word docs, or Markdown notes to build spaced-repetition flashcards and quizzes, ask an AI Tutor grounded in your own files, and study alongside matched peers in a live Focus Room.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#study-space"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('study-space');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5F4DCC] to-[#7461EC] text-white text-sm font-bold shadow-md shadow-[#6A55DC]/25 hover:shadow-lg hover:shadow-[#6A55DC]/30 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" />
                  Open Study Space
                </a>
                <a
                  href="#find-buddies"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('find-buddies');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#DDD8F0] bg-white text-[#201D32] text-sm font-semibold hover:border-[#6A55DC]/60 hover:bg-[#FAF9FD] transition-colors whitespace-nowrap"
                >
                  <Users className="w-4 h-4 text-[#6A55DC]" />
                  Find Buddies
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-5 max-w-md border-t border-[#E4E0F2]">
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[#201D32]">
                    5+
                  </p>
                  <p className="text-xs text-[#6E6B80] mt-0.5">Active recall tools</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[#201D32]">
                    25m
                  </p>
                  <p className="text-xs text-[#6E6B80] mt-0.5">Pomodoro sprints</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-[#201D32]">
                    Local
                  </p>
                  <p className="text-xs text-[#6E6B80] mt-0.5">Saved on reload</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Product Showcase */}
            <div className="lg:col-span-6 flex">
              <div className="w-full surface-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 relative overflow-hidden">
                {/* Interactive Segmented Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F0EEF6]">
                  <div>
                    <p className="text-xs font-semibold text-[#6A55DC]">
                      Interactive Preview
                    </p>
                    <h2 className="text-base font-bold text-[#201D32]">
                      {profile
                        ? `Welcome back, ${profile.name.split(' ')[0]}`
                        : 'Inside Your StudyBuddy Workspace'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-[#F4F3F8] rounded-xl">
                    {[
                      { id: 'match' as PreviewTab, label: 'Matches' },
                      { id: 'flashcard' as PreviewTab, label: 'Cards' },
                      { id: 'sprint' as PreviewTab, label: 'Sprint' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPreviewTab(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          previewTab === t.id
                            ? 'bg-white text-[#201D32] shadow-xs'
                            : 'text-[#6E6B80] hover:text-[#201D32]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab 1: Buddy Matching Preview */}
                {previewTab === 'match' && (
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {[
                      {
                        name: 'Aisha Sharma',
                        color: '#6A55DC',
                        meta: 'JEE · IST · Mathematics, Physics',
                        match: '94% Match',
                      },
                      {
                        name: 'Rahul Verma',
                        color: '#3B5BDB',
                        meta: 'JEE · IST · Computer Science, Math',
                        match: '88% Match',
                      },
                      {
                        name: 'Zara Williams',
                        color: '#D6336C',
                        meta: 'SAT · EST · Literature, Economics',
                        match: '82% Match',
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] hover:border-[#CFC8F2] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <AvatarMonogram name={item.name} color={item.color} size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#201D32] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#6E6B80] truncate">{item.meta}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-[#F4F1FF] border border-[#DFD8FA] text-xs font-mono font-bold tabular-nums text-[#6A55DC] shrink-0">
                          {item.match}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Interactive 3D Flashcard Flip */}
                {previewTab === 'flashcard' && (
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setDemoFlipped((f) => !f)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setDemoFlipped((f) => !f);
                        }
                      }}
                      className="perspective-1200 h-48 cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`relative w-full h-full preserve-3d transition-transform duration-500 ${
                          demoFlipped ? 'rotate-y-180' : ''
                        }`}
                      >
                        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-[#FAF9FF] to-[#F3F0FF] border border-[#DFD8FA] p-6 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-mono font-semibold text-[#6A55DC] mb-2">
                            ACTIVE RECALL · CLICK TO FLIP
                          </span>
                          <p className="text-base font-display font-bold text-[#201D32] max-w-sm">
                            Why does spaced repetition outperform single-night cramming?
                          </p>
                          <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#77758A]">
                            <RotateCw className="w-3.5 h-3.5" />
                            Reveal answer
                          </span>
                        </div>

                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-[#201C39] border border-[#3B3466] p-6 flex flex-col items-center justify-center text-center text-white">
                          <span className="text-[11px] font-mono font-semibold text-[#A99EFF] mb-2">
                            ANSWER
                          </span>
                          <p className="text-sm text-[#EDE9FF] leading-relaxed max-w-sm">
                            Reviewing across increasing intervals forces retrieval effort, strengthening long-term memory pathways.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6E6B80]">
                        Mark mastery to prioritize weak topics
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] font-semibold">
                          Review Again
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-semibold">
                          Got It
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Live Focus Sprint Preview */}
                {previewTab === 'sprint' && (
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-[#201C39] to-[#322B5C] text-white flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[#B9B0FA]">
                          Shared Pomodoro Sprint
                        </p>
                        <p className="text-4xl font-extrabold font-mono tabular-nums mt-1">
                          25:00
                        </p>
                        <p className="text-xs text-[#D5CEFF] mt-1">
                          Focus sprint · Export recap as .md
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-[#FDBA74]" />
                        <span className="text-xs font-mono font-bold mt-1">Streak</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        <span className="font-medium text-[#201D32] truncate">
                          Finish Electrochemistry set
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] flex items-center gap-2.5">
                        <Bot className="w-4 h-4 text-[#6A55DC] shrink-0" />
                        <span className="font-medium text-[#201D32] truncate">
                          Ask AI Tutor on doc
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Action */}
                <div className="pt-3 border-t border-[#F0EEF6] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#6E6B80]">
                    {profile
                      ? `${profile.examTarget} · ${profile.timezone}`
                      : 'No account lock-in · Stored in browser'}
                  </span>
                  <a
                    href="#profile"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('profile');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F1FF] text-[#43388C] text-xs font-bold hover:bg-[#EAE4FF] transition-colors whitespace-nowrap"
                  >
                    {profile ? 'Edit Profile' : 'Set Up Profile'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Workflow Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#6A55DC] mb-1.5">
              How StudyBuddy Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201D32] text-balance">
              One focused loop from raw notes to exam readiness
            </h2>
          </div>
          <a
            href="#study-space"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('study-space');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6A55DC] hover:underline whitespace-nowrap"
          >
            Explore Study Space
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card surface-card-interactive rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#6A55DC]">01.</span>
                <Layers className="w-4 h-4 text-[#6A55DC]" />
              </div>
              <h3 className="text-lg font-bold text-[#201D32]">
                Library, Cards &amp; AI Tutor
              </h3>
              <p className="text-sm text-[#55516B] leading-relaxed">
                Drop in PDFs, Word files, or Markdown notes. Generate spaced-repetition decks, mark cards Got It or Review Again, and ask the AI Tutor to explain missed quiz questions using your exact notes.
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0EEF6] text-xs text-[#6E6B80]">
              PDF · DOCX · Markdown · Context-Aware Tutor
            </div>
          </div>

          <div className="surface-card surface-card-interactive rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#6A55DC]">02.</span>
                <Users className="w-4 h-4 text-[#6A55DC]" />
              </div>
              <h3 className="text-lg font-bold text-[#201D32]">
                Smart Buddy Matching
              </h3>
              <p className="text-sm text-[#55516B] leading-relaxed">
                Your profile computes dynamic Match % scores across exam target, subjects, study style, and timezone—ranking your most compatible partners first and handing off directly into Study Room.
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0EEF6] text-xs text-[#6E6B80]">
              Exam Target · Subjects · Study Style · Timezone
            </div>
          </div>

          <div className="surface-card surface-card-interactive rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#6A55DC]">03.</span>
                <Timer className="w-4 h-4 text-[#6A55DC]" />
              </div>
              <h3 className="text-lg font-bold text-[#201D32]">
                Focus Sprints &amp; Recaps
              </h3>
              <p className="text-sm text-[#55516B] leading-relaxed">
                Run 25-minute Pomodoro sprints with a live task checklist and buddy chat. Every completed sprint updates your daily study streak and generates a downloadable Markdown recap.
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0EEF6] text-xs text-[#6E6B80]">
              Daily Streak · Session Recap · .md Export
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 border-t border-[#E6E3F2]">
        <div className="max-w-xl mb-8">
          <p className="text-xs font-semibold text-[#6A55DC] mb-1.5">Student Outcomes</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201D32]">
            Consistent routines, measurable focus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'StudyBuddy matched me with Priya for UPSC prep in the same timezone. Daily 25-minute Study Room blocks kept me consistent across three straight months.',
              name: 'Arjun Kumar',
              meta: 'UPSC Aspirant · Delhi, IST',
              color: '#3B5BDB',
            },
            {
              quote:
                'Asking the AI Tutor to explain why I missed a practice question—directly grounded in my uploaded biology PDF—saved hours of flipping back through slides.',
              name: 'Zara Williams',
              meta: 'SAT Prep · New York, EST',
              color: '#D6336C',
            },
            {
              quote:
                'The Needs Review panel on Overview shows every card I marked Review Again alongside my missed quiz items before mock exam day.',
              name: 'Chen Lei',
              meta: 'GRE Aspirant · Singapore, GMT+8',
              color: '#0B7285',
            },
          ].map((story) => (
            <div
              key={story.name}
              className="surface-card rounded-2xl p-6 flex flex-col justify-between gap-5"
            >
              <p className="text-sm text-[#3D3956] leading-relaxed">“{story.quote}”</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#F0EEF6]">
                <AvatarMonogram name={story.name} color={story.color} size="sm" />
                <div>
                  <p className="text-sm font-bold text-[#201D32]">{story.name}</p>
                  <p className="text-xs text-[#77758A]">{story.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Home CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-14">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-xl shadow-[#43388C]/15"
          style={{
            background:
              'radial-gradient(600px 260px at 50% 0%, rgba(169, 158, 255, 0.25), transparent 70%), linear-gradient(125deg, #221D42 0%, #4839A8 52%, #6A55DC 100%)',
          }}
        >
          <p className="text-xs font-semibold tracking-wider text-[#D2CBFF] mb-2">
            Your next study session starts here
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-xl mx-auto text-balance">
            Bring your materials. Leave with a clear plan.
          </h2>
          <p className="text-sm text-[#E4E0FF] mt-3 max-w-lg mx-auto leading-relaxed">
            Upload a document, build flashcards, track your daily streak, or pair with a study buddy right now.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#study-space"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('study-space');
              }}
              className="px-6 py-3 rounded-xl bg-white text-[#3F3388] text-sm font-bold hover:bg-[#F5F3FF] transition-colors shadow-sm whitespace-nowrap"
            >
              Open Study Space
            </a>
            <a
              href="#find-buddies"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('find-buddies');
              }}
              className="px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Find Study Buddies
            </a>
          </div>
        </div>
      </section>

      {/* Clean Footer Directly Below Home CTA Banner */}
      <footer className="border-t border-[#E6E3F2] bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-8 border-b border-[#F0EEF6]">
            <div className="col-span-2 sm:col-span-1">
              <p className="font-display font-extrabold text-lg text-[#201D32]">
                Study<span className="text-[#6A55DC]">Buddy</span>
              </p>
              <p className="text-xs text-[#6E6B80] mt-2 leading-relaxed max-w-xs">
                A calm workspace for studying your materials, tracking progress, and learning alongside matched peers.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#201D32] mb-3">Workspace</h3>
              <ul className="space-y-2 text-xs text-[#5E5A75]">
                <li>
                  <a
                    href="#study-space"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('study-space');
                    }}
                    className="hover:text-[#6A55DC]"
                  >
                    Study Space
                  </a>
                </li>
                <li>
                  <a
                    href="#find-buddies"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('find-buddies');
                    }}
                    className="hover:text-[#6A55DC]"
                  >
                    Find Buddies
                  </a>
                </li>
                <li>
                  <a
                    href="#study-room"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('study-room');
                    }}
                    className="hover:text-[#6A55DC]"
                  >
                    Study Room
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#201D32] mb-3">Study Tools</h3>
              <ul className="space-y-2 text-xs text-[#5E5A75]">
                <li>Spaced Repetition Cards</li>
                <li>Practice Quizzes</li>
                <li>Context-Aware AI Tutor</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#201D32] mb-3">Account</h3>
              <ul className="space-y-2 text-xs text-[#5E5A75]">
                <li>
                  <a
                    href="#profile"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('profile');
                    }}
                    className="hover:text-[#6A55DC]"
                  >
                    Set Up Profile
                  </a>
                </li>
                <li>Local Browser Storage</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#77758A]">
            <p>© 2026 StudyBuddy. Built for focused students.</p>
            <p>All notes, cards, and progress are stored locally on your device.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
