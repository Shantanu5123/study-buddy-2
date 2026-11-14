import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BUDDY_PROFILES,
  DEFAULT_DECKS,
  INITIAL_GOALS,
  INITIAL_SUBJECTS,
  SAMPLE_TEXT,
  computeStudyStreak,
} from './data/seedData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  AppRoute,
  Flashcard,
  FlashcardDeck,
  MissedQuizQuestion,
  RoomTask,
  SessionRecapData,
  StudyBuddyProfile,
  StudyDocument,
  StudyGoal,
  StudySpaceTab,
  StudyStats,
  SubjectProgress,
  ToastMessage,
  TodoTask,
  TutorLaunchContext,
  UserProfile,
} from './types/study';
import {
  createId,
  extractTextFromFile,
  makeFlashcardsFromText,
} from './utils/textAnalysis';
import { MainNavbar } from './components/MainNavbar';
import { HomeView } from './components/HomeView';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewView } from './components/OverviewView';
import { LibraryView } from './components/LibraryView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { NotesView } from './components/NotesView';
import { FocusTimerView } from './components/FocusTimerView';
import { TasksProgressView } from './components/TasksProgressView';
import { BuddyFinderView } from './components/BuddyFinderView';
import { StudyRoomView } from './components/StudyRoomView';
import { ResourcesView } from './components/ResourcesView';
import { ProfileWizardView } from './components/ProfileWizardView';
import { QuickReviewModal } from './components/QuickReviewModal';
import { AiTutorPanel } from './components/AiTutorPanel';
import { SessionRecapModal } from './components/SessionRecapModal';

const VALID_TABS: StudySpaceTab[] = [
  'overview',
  'library',
  'flashcards',
  'quiz',
  'notes',
  'focus',
  'tasks',
  'resources',
];

function parseHashLocation(rawHash: string): {
  route: AppRoute;
  tab?: StudySpaceTab;
  buddyId?: string;
} {
  const cleaned = rawHash.replace(/^#\/?/, '').trim();
  if (!cleaned || cleaned === 'home') return { route: 'home' };

  const [head, sub] = cleaned.split('/');
  if (head === 'study-space') {
    const tab = VALID_TABS.includes(sub as StudySpaceTab)
      ? (sub as StudySpaceTab)
      : undefined;
    return { route: 'study-space', tab };
  }
  if (head === 'find-buddies') return { route: 'find-buddies' };
  if (head === 'study-room') return { route: 'study-room', buddyId: sub || undefined };
  if (head === 'profile') return { route: 'profile' };

  return { route: 'home' };
}

function buildHash(route: AppRoute, tab?: StudySpaceTab, buddyId?: string): string {
  if (route === 'study-space') {
    return tab && tab !== 'overview' ? `#study-space/${tab}` : '#study-space';
  }
  if (route === 'study-room') {
    return buddyId ? `#study-room/${buddyId}` : '#study-room';
  }
  return `#${route}`;
}

export default function App() {
  const initialHash = parseHashLocation(window.location.hash);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(initialHash.route);
  const [studyTab, setStudyTab] = useState<StudySpaceTab>(initialHash.tab || 'overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [documents, setDocuments] = useLocalStorage<StudyDocument[]>('sb_documents', []);
  const [cardsByDoc, setCardsByDoc] = useLocalStorage<Record<string, Flashcard[]>>(
    'sb_cards_by_doc',
    {}
  );
  const [decks, setDecks] = useLocalStorage<FlashcardDeck[]>('sb_decks', DEFAULT_DECKS);
  const [stats, setStats] = useLocalStorage<StudyStats>('sb_stats', {
    days: {},
    activeDates: [],
    sessions: 0,
    cardsReviewed: 0,
    quizTotalPct: 0,
    quizCount: 0,
  });
  const [missedQuestions, setMissedQuestions] = useLocalStorage<MissedQuizQuestion[]>(
    'sb_missed_questions',
    []
  );
  const [todos, setTodos] = useLocalStorage<TodoTask[]>('sb_todos', []);
  const [subjects, setSubjects] = useLocalStorage<SubjectProgress[]>(
    'sb_subjects',
    INITIAL_SUBJECTS
  );
  const [goals, setGoals] = useLocalStorage<StudyGoal[]>('sb_goals', INITIAL_GOALS);
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('sb_profile', null);
  const [roomTasks, setRoomTasks] = useLocalStorage<RoomTask[]>('sb_room_tasks', []);
  const [activeBuddyId, setActiveBuddyId] = useLocalStorage<string>(
    'sb_active_buddy_id',
    BUDDY_PROFILES[0].id
  );

  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [reviewDoc, setReviewDoc] = useState<StudyDocument | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState<TutorLaunchContext | null>(null);
  const [recapData, setRecapData] = useState<SessionRecapData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeBuddy =
    BUDDY_PROFILES.find((b) => b.id === activeBuddyId) || BUDDY_PROFILES[0];

  const navigateTo = useCallback(
    (route: AppRoute, options?: { tab?: StudySpaceTab; buddyId?: string }) => {
      const targetTab = options?.tab || (route === 'study-space' ? studyTab : undefined);
      const targetBuddyId =
        options?.buddyId || (route === 'study-room' ? activeBuddyId : undefined);

      setActiveRoute(route);
      if (options?.tab) setStudyTab(options.tab);
      if (options?.buddyId) setActiveBuddyId(options.buddyId);
      setMobileNavOpen(false);
      setSidebarMobileOpen(false);

      const nextHash = buildHash(route, targetTab, targetBuddyId);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeBuddyId, setActiveBuddyId, studyTab]
  );

  const selectStudyTab = useCallback(
    (tab: StudySpaceTab) => {
      setStudyTab(tab);
      setActiveRoute('study-space');
      const nextHash = buildHash('study-space', tab);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    },
    []
  );

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#home');
    } else if (initialHash.buddyId) {
      const matched = BUDDY_PROFILES.find((b) => b.id === initialHash.buddyId);
      if (matched) setActiveBuddyId(matched.id);
    }

    const onHashChange = () => {
      const parsed = parseHashLocation(window.location.hash);
      setActiveRoute(parsed.route);
      if (parsed.tab) setStudyTab(parsed.tab);
      if (parsed.buddyId) {
        const matched = BUDDY_PROFILES.find((b) => b.id === parsed.buddyId);
        if (matched) setActiveBuddyId(matched.id);
      }
      setMobileNavOpen(false);
      setSidebarMobileOpen(false);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [initialHash.buddyId, setActiveBuddyId]);

  const showToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'info') => {
      const id = createId('toast');
      setToasts((prev) => [...prev, { id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const handleOpenTutor = useCallback(
    (ctx?: TutorLaunchContext) => {
      if (ctx) {
        setTutorContext(ctx);
      } else {
        const fallbackDoc =
          documents.find((d) => d.id === selectedDocId) || documents[0];
        setTutorContext({
          documentTitle: fallbackDoc?.name || 'General Study Notes',
          documentText: fallbackDoc?.text || '',
        });
      }
      setTutorOpen(true);
    },
    [documents, selectedDocId]
  );

  const handleRecordMissedQuestion = useCallback(
    (missed: Omit<MissedQuizQuestion, 'id' | 'createdAt'>) => {
      setMissedQuestions((prev) => {
        const duplicate = prev.some(
          (item) =>
            item.prompt === missed.prompt &&
            item.correctAnswer === missed.correctAnswer
        );
        if (duplicate) return prev;
        return [
          {
            ...missed,
            id: createId('mq'),
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 20);
      });
    },
    [setMissedQuestions]
  );

  const handleDismissMissedQuestion = useCallback(
    (id: string) => {
      setMissedQuestions((prev) => prev.filter((item) => item.id !== id));
    },
    [setMissedQuestions]
  );

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    let added = 0;

    try {
      const incoming = Array.from(fileList);
      const nextDocs: StudyDocument[] = [];

      for (const file of incoming) {
        try {
          const { text, type, signature } = await extractTextFromFile(file);
          const alreadyExists =
            documents.some((d) => d.signature === signature) ||
            nextDocs.some((d) => d.signature === signature);
          if (alreadyExists) {
            showToast(`"${file.name}" is already in your library.`, 'info');
            continue;
          }

          const docId = createId('doc');
          nextDocs.push({
            id: docId,
            name: file.name,
            type,
            kind: 'file',
            size: file.size,
            addedAt: new Date().toISOString(),
            text,
            signature,
          });
          added += 1;

          if (!text.trim()) {
            showToast(
              `${file.name} has no selectable text. Scanned PDFs need OCR.`,
              'warn'
            );
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Unable to read this file.';
          showToast(`${file.name}: ${message}`, 'error');
        }
      }

      if (nextDocs.length > 0) {
        setDocuments((prev) => [...nextDocs, ...prev]);
        setSelectedDocId(nextDocs[0].id);
        showToast(
          `Added ${added} ${added === 1 ? 'material' : 'materials'} to your library.`,
          'success'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSample = () => {
    const existing = documents.find((d) => d.id === 'sample-active-recall');
    if (existing) {
      setSelectedDocId(existing.id);
      showToast('Sample notes are already in your library.', 'info');
      return;
    }
    const sampleDoc: StudyDocument = {
      id: 'sample-active-recall',
      name: 'Sample — learning techniques.txt',
      type: 'txt',
      kind: 'sample',
      size: new TextEncoder().encode(SAMPLE_TEXT).length,
      addedAt: new Date().toISOString(),
      text: SAMPLE_TEXT,
      signature: 'sample-active-recall',
    };
    setDocuments((prev) => [sampleDoc, ...prev]);
    setSelectedDocId(sampleDoc.id);
    showToast('Sample learning notes added.', 'success');
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setCardsByDoc((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    if (selectedDocId === docId) setSelectedDocId('');
    showToast('Material removed.', 'info');
  };

  const handleOpenFlashcardsForDoc = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && (!cardsByDoc[docId] || cardsByDoc[docId].length === 0)) {
      const generated = makeFlashcardsFromText(doc.text, docId);
      if (generated.length > 0) {
        setCardsByDoc((prev) => ({ ...prev, [docId]: generated }));
      }
    }
    setSelectedDocId(docId);
    selectStudyTab('flashcards');
  };

  const handleOpenQuizForDoc = (docId: string) => {
    setSelectedDocId(docId);
    selectStudyTab('quiz');
  };

  const handleSaveNote = (
    title: string,
    text: string,
    existingId?: string
  ): string => {
    if (existingId) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === existingId
            ? { ...d, name: title, text, addedAt: new Date().toISOString() }
            : d
        )
      );
      return existingId;
    }
    const id = createId('note');
    const newNote: StudyDocument = {
      id,
      name: title,
      type: 'note',
      kind: 'note',
      size: 0,
      addedAt: new Date().toISOString(),
      text,
      signature: '',
    };
    setDocuments((prev) => [newNote, ...prev]);
    setSelectedDocId(id);
    return id;
  };

  const handleRecordStudyActivity = useCallback(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    setStats((prev) => {
      const existingDates = prev.activeDates || [];
      const activeDates = existingDates.includes(todayKey)
        ? existingDates
        : [...existingDates, todayKey];
      return {
        ...prev,
        activeDates,
      };
    });
  }, [setStats]);

  const handleCompleteFocusBlock = useCallback(
    (minutes: number, completedTasks: string[], sourceLabel: string) => {
      const todayKey = new Date().toISOString().slice(0, 10);
      setStats((prev) => {
        const existingDates = prev.activeDates || [];
        const activeDates = existingDates.includes(todayKey)
          ? existingDates
          : [...existingDates, todayKey];
        return {
          ...prev,
          days: {
            ...prev.days,
            [todayKey]: (prev.days[todayKey] || 0) + minutes,
          },
          activeDates,
          sessions: prev.sessions + 1,
        };
      });
      setRecapData({
        durationMinutes: minutes,
        completedTasks,
        sourceLabel,
      });
    },
    [setStats]
  );

  const handleCardReviewed = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
    }));
  }, [setStats]);

  const handleQuizCompleted = useCallback(
    (pct: number) => {
      setStats((prev) => ({
        ...prev,
        quizTotalPct: prev.quizTotalPct + pct,
        quizCount: prev.quizCount + 1,
      }));
    },
    [setStats]
  );

  const handleStartStudyRoom = (buddy: StudyBuddyProfile) => {
    setActiveBuddyId(buddy.id);
    navigateTo('study-room', { buddyId: buddy.id });
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMinutes = stats.days[todayKey] || 0;
  const activeTodoCount = todos.filter((t) => !t.done).length;
  const savedNotes = documents.filter((d) => d.kind === 'note');
  const currentStreak = computeStudyStreak(stats.days, stats.activeDates);

  const needsReviewCount =
    Object.values(cardsByDoc)
      .flat()
      .filter((c) => c.rating === 'review-again' || c.rating === 'hard').length +
    decks
      .flatMap((d) => d.cards)
      .filter((c) => c.rating === 'review-again' || c.rating === 'hard').length +
    missedQuestions.length;

  return (
    <div className="min-h-screen flex flex-col bg-study-canvas text-[#201D32]">
      <MainNavbar
        activeRoute={activeRoute}
        onNavigate={(route) => navigateTo(route)}
        profile={profile}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((o) => !o)}
      />

      {activeRoute === 'home' && (
        <motion.main
          key="home"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <HomeView profile={profile} onNavigate={(route) => navigateTo(route)} />
        </motion.main>
      )}

      {activeRoute === 'study-space' && (
        <motion.div
          key="study-space"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="flex-1 flex min-w-0"
        >
          <Sidebar
            activeTab={studyTab}
            onSelectTab={selectStudyTab}
            libraryCount={documents.length}
            activeTodoCount={activeTodoCount}
            needsReviewCount={needsReviewCount}
            mobileOpen={sidebarMobileOpen}
            onCloseMobile={() => setSidebarMobileOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              activeTab={studyTab}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                if (q.trim() && studyTab !== 'library') {
                  selectStudyTab('library');
                }
              }}
              onSearchSubmit={() => selectStudyTab('library')}
              onOpenMobileMenu={() => setSidebarMobileOpen(true)}
              onOpenTutor={() => handleOpenTutor()}
            />

            <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1320px] w-full mx-auto">
              {studyTab === 'overview' && (
                <OverviewView
                  documents={documents}
                  cardsByDoc={cardsByDoc}
                  decks={decks}
                  missedQuestions={missedQuestions}
                  stats={stats}
                  profile={profile}
                  isUploading={isUploading}
                  onUploadFiles={handleUploadFiles}
                  onAddSample={handleAddSample}
                  onReviewDoc={(doc) => setReviewDoc(doc)}
                  onOpenFlashcards={handleOpenFlashcardsForDoc}
                  onDeleteDoc={handleDeleteDoc}
                  onSelectTab={selectStudyTab}
                  onNavigateRoute={(route) => navigateTo(route)}
                  onOpenTutor={handleOpenTutor}
                  onDismissMissedQuestion={handleDismissMissedQuestion}
                />
              )}

              {studyTab === 'library' && (
                <LibraryView
                  documents={documents}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isUploading={isUploading}
                  onUploadFiles={handleUploadFiles}
                  onAddSample={handleAddSample}
                  onReviewDoc={(doc) => setReviewDoc(doc)}
                  onOpenFlashcards={handleOpenFlashcardsForDoc}
                  onOpenQuiz={handleOpenQuizForDoc}
                  onOpenTutor={handleOpenTutor}
                  onDeleteDoc={handleDeleteDoc}
                />
              )}

              {studyTab === 'flashcards' && (
                <FlashcardsView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  onSelectDoc={setSelectedDocId}
                  cardsByDoc={cardsByDoc}
                  onUpdateDocCards={(docId, cards) =>
                    setCardsByDoc((prev) => ({ ...prev, [docId]: cards }))
                  }
                  decks={decks}
                  onUpdateDecks={setDecks}
                  onCardReviewed={handleCardReviewed}
                  onToast={showToast}
                />
              )}

              {studyTab === 'quiz' && (
                <QuizView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  onSelectDoc={setSelectedDocId}
                  onQuizCompleted={handleQuizCompleted}
                  onRecordMissedQuestion={handleRecordMissedQuestion}
                  onOpenTutor={handleOpenTutor}
                  onToast={showToast}
                />
              )}

              {studyTab === 'notes' && (
                <NotesView
                  notes={savedNotes}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteDoc}
                  onReviewNote={(doc) => setReviewDoc(doc)}
                  onOpenFlashcards={handleOpenFlashcardsForDoc}
                  onToast={showToast}
                />
              )}

              {studyTab === 'focus' && (
                <FocusTimerView
                  documents={documents}
                  todayMinutes={todayMinutes}
                  sessionsCount={stats.sessions}
                  onCompleteFocusBlock={handleCompleteFocusBlock}
                  sessionTasks={roomTasks}
                  onUpdateSessionTasks={setRoomTasks}
                  onToast={showToast}
                />
              )}

              {studyTab === 'tasks' && (
                <TasksProgressView
                  todos={todos}
                  onUpdateTodos={setTodos}
                  subjects={subjects}
                  onUpdateSubjects={setSubjects}
                  goals={goals}
                  onUpdateGoals={setGoals}
                  stats={stats}
                  onRecordStudyActivity={handleRecordStudyActivity}
                  onToast={showToast}
                />
              )}

              {studyTab === 'resources' && <ResourcesView />}
            </main>
          </div>
        </motion.div>
      )}

      {activeRoute === 'find-buddies' && (
        <motion.main
          key="find-buddies"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <BuddyFinderView
            profile={profile}
            onStartStudyRoom={handleStartStudyRoom}
            onOpenProfileSetup={() => navigateTo('profile')}
          />
        </motion.main>
      )}

      {activeRoute === 'study-room' && (
        <motion.main
          key="study-room"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <StudyRoomView
            buddy={activeBuddy}
            profile={profile}
            roomTasks={roomTasks}
            onUpdateRoomTasks={setRoomTasks}
            onSelectBuddy={(b) => {
              setActiveBuddyId(b.id);
              navigateTo('study-room', { buddyId: b.id });
            }}
            onCompleteFocusBlock={handleCompleteFocusBlock}
            onLeaveRoom={() => navigateTo('find-buddies')}
            onToast={showToast}
          />
        </motion.main>
      )}

      {activeRoute === 'profile' && (
        <motion.main
          key="profile"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-8"
        >
          <ProfileWizardView
            profile={profile}
            stats={stats}
            onSaveProfile={setProfile}
            onNavigateBuddies={() => navigateTo('find-buddies')}
            onToast={showToast}
          />
        </motion.main>
      )}

      {/* Quick Review Modal */}
      <QuickReviewModal
        doc={reviewDoc}
        onClose={() => setReviewDoc(null)}
        onOpenFlashcards={handleOpenFlashcardsForDoc}
        onOpenQuiz={handleOpenQuizForDoc}
      />

      {/* Context-Aware AI Tutor Panel */}
      <AiTutorPanel
        open={tutorOpen}
        context={tutorContext}
        onClose={() => setTutorOpen(false)}
      />

      {/* Session Recap Modal */}
      <SessionRecapModal
        recap={recapData}
        streak={currentStreak}
        totalSessions={stats.sessions}
        notes={savedNotes}
        onClose={() => setRecapData(null)}
        onSaveReflectionNote={(title, text) => {
          handleSaveNote(title, text);
          showToast('Session takeaway saved to My Notes.', 'success');
        }}
      />

      {/* Toast Stack */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const borderTone =
            t.tone === 'success'
              ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
              : t.tone === 'warn'
                ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                : t.tone === 'error'
                  ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                  : 'border-[#E2DEF2] bg-white text-[#211E36]';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto px-4 py-3 rounded-xl border text-xs font-semibold shadow-md ${borderTone}`}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
