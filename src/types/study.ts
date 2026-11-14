export type AppRoute =
  | 'home'
  | 'study-space'
  | 'find-buddies'
  | 'study-room'
  | 'profile';

export type StudySpaceTab =
  | 'overview'
  | 'library'
  | 'flashcards'
  | 'quiz'
  | 'notes'
  | 'focus'
  | 'tasks'
  | 'resources';

export type DocType = 'pdf' | 'docx' | 'md' | 'markdown' | 'txt' | 'note';
export type DocKind = 'file' | 'note' | 'sample';

export interface StudyDocument {
  id: string;
  name: string;
  type: DocType;
  kind: DocKind;
  size: number;
  addedAt: string;
  text: string;
  signature: string;
}

export type CardMasteryStatus = 'got-it' | 'review-again';

export interface Flashcard {
  id: string;
  docId: string;
  question: string;
  answer: string;
  rating?: CardMasteryStatus | 'hard' | 'ok' | 'easy';
}

export interface FlashcardDeck {
  id: string;
  name: string;
  category: string;
  cards: {
    id: string;
    q: string;
    a: string;
    rating?: CardMasteryStatus | 'hard' | 'ok' | 'easy';
  }[];
}

export interface MaterialQuizQuestion {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
}

export interface SubjectQuizQuestion {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface MissedQuizQuestion {
  id: string;
  docId?: string;
  sourceName: string;
  prompt: string;
  chosenAnswer: string;
  correctAnswer: string;
  explanation?: string;
  createdAt: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TodoTask {
  id: string;
  text: string;
  priority: TaskPriority;
  due: string;
  done: boolean;
  createdAt: string;
}

export interface SubjectProgress {
  id: string;
  name: string;
  topics: string[];
  done: string[];
}

export interface StudyGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface StudyStats {
  days: Record<string, number>;
  activeDates?: string[];
  sessions: number;
  cardsReviewed: number;
  quizTotalPct: number;
  quizCount: number;
}

export type StudyStyle = 'deep-focus' | 'collaborative' | 'mixed';
export type StudyTimePref = 'morning' | 'afternoon' | 'evening' | 'night';

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
  bio: string;
  subjects: string[];
  examTarget: string;
  studyStyle: StudyStyle;
  timezone: string;
  studyTime: StudyTimePref;
  weeklyHours: number;
  shortGoal: string;
  createdAt: string;
}

export interface StudyBuddyProfile {
  id: string;
  name: string;
  avatarColor: string;
  subjects: string[];
  examTarget: string;
  studyStyle: StudyStyle;
  timezone: string;
  studyTime: StudyTimePref;
  weeklyHours: number;
  online: boolean;
  bio: string;
  shortGoal: string;
}

export interface RoomTask {
  id: string;
  text: string;
  done: boolean;
}

export interface RoomMessage {
  id: string;
  sender: 'me' | 'buddy';
  author: string;
  text: string;
  time: string;
}

export interface ResourceItem {
  id: string;
  category: 'Math' | 'Science' | 'Languages' | 'CS & Tech' | 'Exam Prep' | 'Productivity';
  title: string;
  source: string;
  desc: string;
  tags: string[];
  url: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'warn' | 'error';
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

export interface TutorLaunchContext {
  documentTitle: string;
  documentText: string;
  missedQuestion?: {
    prompt: string;
    chosenAnswer: string;
    correctAnswer: string;
    explanation?: string;
  };
  autoPrompt?: string;
}

export interface SessionRecapData {
  durationMinutes: number;
  completedTasks: string[];
  sourceLabel: string;
}
