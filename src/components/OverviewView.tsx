import React, { useRef } from 'react';
import {
  Upload,
  Sparkles,
  Layers,
  Timer,
  FileText,
  Trash2,
  Eye,
  Users,
  Flame,
  AlertCircle,
  Bot,
  X,
} from 'lucide-react';
import {
  AppRoute,
  Flashcard,
  FlashcardDeck,
  MissedQuizQuestion,
  StudyDocument,
  StudySpaceTab,
  StudyStats,
  TutorLaunchContext,
  UserProfile,
} from '../types/study';
import { STUDY_TIPS, computeStudyStreak } from '../data/seedData';
import { formatFileSize, wordCount } from '../utils/textAnalysis';

interface OverviewViewProps {
  documents: StudyDocument[];
  cardsByDoc: Record<string, Flashcard[]>;
  decks: FlashcardDeck[];
  missedQuestions: MissedQuizQuestion[];
  stats: StudyStats;
  profile: UserProfile | null;
  isUploading: boolean;
  onUploadFiles: (files: FileList | null) => void;
  onAddSample: () => void;
  onReviewDoc: (doc: StudyDocument) => void;
  onOpenFlashcards: (docId: string) => void;
  onDeleteDoc: (docId: string) => void;
  onSelectTab: (tab: StudySpaceTab) => void;
  onNavigateRoute: (route: AppRoute) => void;
  onOpenTutor: (ctx: TutorLaunchContext) => void;
  onDismissMissedQuestion: (id: string) => void;
}

function isNeedsReviewRating(rating?: string) {
  return rating === 'review-again' || rating === 'hard';
}

function isGotItRating(rating?: string) {
  return rating === 'got-it' || rating === 'ok' || rating === 'easy';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  documents,
  cardsByDoc,
  decks,
  missedQuestions,
  stats,
  profile,
  isUploading,
  onUploadFiles,
  onAddSample,
  onReviewDoc,
  onOpenFlashcards,
  onDeleteDoc,
  onSelectTab,
  onNavigateRoute,
  onOpenTutor,
  onDismissMissedQuestion,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0];

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMinutes = stats.days[todayKey] || 0;
  const totalMinutes = Object.values(stats.days).reduce((acc, v) => acc + v, 0);
  const studyStreak = computeStudyStreak(stats.days, stats.activeDates);

  // Compute flashcard mastery & review-again items
  const allDocCards = Object.values(cardsByDoc).flat();
  const allDeckCards = decks.flatMap((d) =>
    d.cards.map((c) => ({ ...c, deckName: d.name }))
  );
  const totalFlashcards = allDocCards.length + allDeckCards.length;

  const gotItCount =
    allDocCards.filter((c) => isGotItRating(c.rating)).length +
    allDeckCards.filter((c) => isGotItRating(c.rating)).length;

  const reviewAgainDocCards = allDocCards.filter((c) => isNeedsReviewRating(c.rating));
  const reviewAgainDeckCards = allDeckCards.filter((c) => isNeedsReviewRating(c.rating));
  const reviewAgainCount = reviewAgainDocCards.length + reviewAgainDeckCards.length;

  // Build Monday-Sunday week bars
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      label,
      minutes: stats.days[key] || 0,
      isToday: key === todayKey,
    };
  });
  const maxWeekMinutes = Math.max(60, ...weekDays.map((w) => w.minutes));

  const tip = STUDY_TIPS[today.getDate() % STUDY_TIPS.length];

  const handleExplainMissed = (item: MissedQuizQuestion) => {
    const matchedDoc = item.docId
      ? documents.find((d) => d.id === item.docId)
      : documents[0];
    onOpenTutor({
      documentTitle: matchedDoc?.name || item.sourceName,
      documentText: matchedDoc?.text || '',
      missedQuestion: {
        prompt: item.prompt,
        chosenAnswer: item.chosenAnswer,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Daily Study Streak Badge */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <p className="text-xs font-semibold text-[#6A55DC]">Your Study Space</p>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-xs font-mono font-bold text-[#C2410C] tabular-nums"
              title="Consecutive days with a completed Pomodoro sprint or task"
            >
              <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
              {studyStreak} day {studyStreak === 1 ? 'streak' : 'streak'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#211E36]">
            {greeting}
            {firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-[#6E6B80] mt-1">
            A calm place to turn class material into steady progress.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateRoute('find-buddies')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2DEF2] bg-white text-sm font-semibold text-[#4E4396] hover:bg-[#F8F6FF] whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            Find Study Buddies
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('focus')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-sm font-semibold text-white hover:bg-[#5B47C7] whitespace-nowrap"
          >
            <Timer className="w-4 h-4" />
            Start Focus
          </button>
        </div>
      </div>

      {/* 4-column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#77758A]">Study Materials</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#211E36] mt-1.5">
            {documents.length}
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#77758A]">Flashcard Mastery</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#211E36] mt-1.5">
            {gotItCount}{' '}
            <span className="text-xs font-normal text-[#77758A]">
              / {totalFlashcards} got it
            </span>
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#77758A]">Minutes Focused</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#211E36] mt-1.5">
            {totalMinutes}
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#77758A]">Pomodoro Sprints</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#211E36] mt-1.5">
            {stats.sessions}
          </p>
        </div>
      </div>

      {/* Hero Upload + Needs Review + Weekly Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div
            className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-[#43388C]/15"
            style={{
              background:
                'radial-gradient(480px 240px at 95% 0%, rgba(188, 176, 251, 0.25), transparent 65%), linear-gradient(125deg, #27214D 0%, #4D3DB3 52%, #6F5EE6 100%)',
            }}
          >
            <p className="text-[11px] font-semibold tracking-wider text-[#D2CBFF]">
              Your Material, Your Momentum
            </p>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-white mt-2 max-w-xl leading-snug text-balance">
              Make more of what you’re already studying.
            </h2>
            <p className="text-sm text-[#E4E0FF] mt-2 max-w-xl leading-relaxed">
              Add class notes, PDFs, or Word documents. Create quick reviews, spaced-repetition flashcards, and practice quizzes with AI Tutor support.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#3F3388] text-sm font-bold hover:bg-[#F5F3FF] transition-colors shadow-xs whitespace-nowrap disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Reading files...' : 'Upload Study Files'}
              </button>
              <button
                type="button"
                onClick={onAddSample}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                Try Sample Notes
              </button>
              <span className="text-xs text-[#D9D4FF]">
                PDF · DOCX · Markdown · TXT (up to 20 MB)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.markdown"
              multiple
              className="hidden"
              onChange={(e) => {
                onUploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {/* Needs Review Card (Spaced Repetition + Weak-Topic Overview) */}
          <div className="surface-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-[#211E36]">Needs Review</h3>
                  <p className="text-xs text-[#77758A]">
                    Weak topics from flashcards marked Review Again and missed quiz questions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                <span className="px-2.5 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-semibold">
                  {reviewAgainCount} cards
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-semibold">
                  {missedQuestions.length} quiz gaps
                </span>
              </div>
            </div>

            {reviewAgainCount === 0 && missedQuestions.length === 0 ? (
              <div className="py-5 px-4 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5] text-center">
                <p className="text-sm font-semibold text-[#211E36]">
                  All clear right now.
                </p>
                <p className="text-xs text-[#77758A] mt-0.5">
                  Any flashcard you mark “Review Again” or quiz question you miss will appear here for quick follow-up.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewAgainCount > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#FFFBEB]/70 border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#92400E]">
                        {reviewAgainCount}{' '}
                        {reviewAgainCount === 1 ? 'flashcard' : 'flashcards'} marked Review Again
                      </p>
                      <p className="text-xs text-[#78350F] truncate mt-0.5">
                        Next up:{' '}
                        {reviewAgainDocCards[0]?.question ||
                          reviewAgainDeckCards[0]?.q}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectTab('flashcards')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#F59E0B]/40 text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7] whitespace-nowrap shrink-0"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Review Cards
                    </button>
                  </div>
                )}

                {missedQuestions.slice(0, 4).map((mq) => (
                  <div
                    key={mq.id}
                    className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EAE8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-[#6A55DC]">
                        {mq.sourceName}
                      </p>
                      <p className="text-sm font-semibold text-[#211E36] mt-0.5 line-clamp-2">
                        {mq.prompt}
                      </p>
                      <p className="text-xs text-[#6E6B80] mt-1">
                        Your pick: <span className="text-[#B91C1C]">{mq.chosenAnswer}</span> ·
                        Correct: <span className="font-semibold text-[#047857]">{mq.correctAnswer}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleExplainMissed(mq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F1FF] border border-[#DFD8FA] text-xs font-semibold text-[#4E4396] hover:bg-[#EAE4FF] whitespace-nowrap"
                      >
                        <Bot className="w-3.5 h-3.5 text-[#6A55DC]" />
                        Explain why I missed this
                      </button>
                      <button
                        type="button"
                        onClick={() => onDismissMissedQuestion(mq.id)}
                        className="p-1.5 rounded-lg text-[#8D899F] hover:text-[#211E36] hover:bg-white"
                        aria-label="Mark as reviewed"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Added Materials */}
          <div className="surface-card rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#211E36]">Recently Added</h3>
                <p className="text-xs text-[#77758A]">Pick up where you left off</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('library')}
                className="text-xs font-semibold text-[#6A55DC] hover:underline whitespace-nowrap"
              >
                View all materials
              </button>
            </div>

            {documents.length > 0 ? (
              <div className="divide-y divide-[#F0EEF5]">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F4F1FF] text-[#6A55DC] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#211E36] truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-[#77758A] font-mono tabular-nums mt-0.5">
                          {doc.kind === 'note' ? 'Note' : doc.type.toUpperCase()} ·{' '}
                          {doc.kind !== 'note' && `${formatFileSize(doc.size)} · `}
                          {wordCount(doc.text).toLocaleString()} words
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onReviewDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-xs font-semibold text-[#3E395C] hover:bg-[#F8F6FF] whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenFlashcards(doc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-xs font-semibold text-[#51469B] hover:bg-[#F8F6FF] whitespace-nowrap"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1.5 rounded-lg text-[#8D899F] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        aria-label={`Remove ${doc.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-[#DFDCEB] rounded-xl bg-[#FAF9FD]">
                <p className="text-sm font-medium text-[#3D3956]">
                  Your library is ready for its first document.
                </p>
                <p className="text-xs text-[#77758A] mt-1">
                  Upload a PDF, Word file, or load the sample notes above.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Goal, Weekly Chart, Toolkit, Tip */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#211E36]">Today’s Focus</h3>
              <span className="text-xs font-mono tabular-nums font-semibold text-[#6A55DC]">
                {todayMinutes} / 60 min
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#EEEBF7] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5F4DCC] to-[#8B79FA] transition-all duration-300"
                style={{ width: `${Math.min(100, (todayMinutes / 60) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#77758A] mt-2">
              Small 25-minute blocks add up consistently over the week.
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#211E36]">This Week</h3>
              <span className="text-xs text-[#77758A]">Focus minutes</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-24 pt-2">
              {weekDays.map((day) => {
                const pct = Math.max(8, Math.round((day.minutes / maxWeekMinutes) * 100));
                return (
                  <div key={day.label} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex items-end justify-center flex-1">
                      <div
                        title={`${day.label}: ${day.minutes} min`}
                        className={`w-4 rounded-t-md transition-all ${
                          day.isToday
                            ? 'bg-gradient-to-t from-[#5F4DCC] to-[#8B79FA]'
                            : day.minutes > 0
                              ? 'bg-[#BCB0FB]'
                              : 'bg-[#ECEAF4]'
                        }`}
                        style={{ height: `${day.minutes > 0 ? pct : 10}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        day.isToday ? 'text-[#6A55DC] font-bold' : 'text-[#8B889E]'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-[#211E36] mb-1">Study Toolkit</h3>
            <button
              type="button"
              onClick={() => {
                if (documents.length > 0) onReviewDoc(documents[0]);
                else onSelectTab('library');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF] whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6A55DC]" />
                Quick Review
              </span>
              <span className="text-xs text-[#77758A]">Latest</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (documents.length > 0) onOpenFlashcards(documents[0].id);
                else onSelectTab('flashcards');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF] whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6A55DC]" />
                Create Flashcards
              </span>
              <span className="text-xs text-[#77758A]">Deck</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('focus')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF] whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#6A55DC]" />
                Focus Timer
              </span>
              <span className="text-xs font-mono text-[#77758A]">25:00</span>
            </button>
          </div>

          <div className="rounded-2xl p-4 bg-[#F3F0FF] border border-[#E4DEFF]">
            <p className="text-xs font-bold text-[#5344B5]">{tip.title}</p>
            <p className="text-xs text-[#59537E] mt-1 leading-relaxed">{tip.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
