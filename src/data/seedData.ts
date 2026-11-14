import {
  FlashcardDeck,
  ResourceItem,
  StudyBuddyProfile,
  StudyGoal,
  SubjectProgress,
  SubjectQuizQuestion,
  UserProfile,
} from '../types/study';

export const SAMPLE_TEXT =
  'Active recall is a learning technique where you retrieve information from memory instead ' +
  'of simply rereading it. The effort of remembering strengthens the pathways that help you ' +
  'find the idea again later.\n\n' +
  'Spaced practice means reviewing material across several short sessions over time. It helps ' +
  'move ideas into long-term memory more effectively than doing one long study session the ' +
  'night before an exam.\n\n' +
  'Interleaving is the practice of switching between related topics or problem types during a ' +
  'study session. It encourages you to recognize which strategy fits a new problem.\n\n' +
  'A useful study cycle is simple: read a small section, close the notes, write down what you ' +
  'remember, then check the source and correct gaps. Break a large chapter into short sections ' +
  'and return to each one after a delay.';

export const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-chem',
    name: 'Chemistry Basics',
    category: 'Science',
    cards: [
      { id: 'c1', q: 'What is the chemical formula of water?', a: 'H2O — Two hydrogen atoms bonded to one oxygen atom.' },
      { id: 'c2', q: 'What is the atomic number of Carbon?', a: '6 — Carbon has 6 protons, 6 neutrons, and 6 electrons.' },
      { id: 'c3', q: 'What is the speed of light in a vacuum?', a: '3 x 10^8 m/s (approximately 300,000 km/s).' },
      { id: 'c4', q: "What is Avogadro's number?", a: '6.022 x 10^23 mol^-1 — the number of entities in one mole.' },
      { id: 'c5', q: 'Define an isotope.', a: 'Atoms of the same element with the same number of protons but different numbers of neutrons.' },
    ],
  },
  {
    id: 'deck-math',
    name: 'Math Formulas',
    category: 'Mathematics',
    cards: [
      { id: 'm1', q: 'What is the quadratic formula?', a: 'x = (-b +/- sqrt(b^2 - 4ac)) / 2a, used to solve ax^2 + bx + c = 0.' },
      { id: 'm2', q: 'What is the area of a circle?', a: 'A = pi * r^2, where r is the radius of the circle.' },
      { id: 'm3', q: 'State the Pythagorean theorem.', a: 'a^2 + b^2 = c^2, where c is the hypotenuse of a right triangle.' },
      { id: 'm4', q: 'What is the derivative of sin(x)?', a: 'cos(x).' },
      { id: 'm5', q: "What is Euler's identity?", a: 'e^(i*pi) + 1 = 0 — linking five fundamental mathematical constants.' },
    ],
  },
  {
    id: 'deck-hist',
    name: 'Key Historical Dates',
    category: 'History',
    cards: [
      { id: 'h1', q: 'When did World War II end?', a: '1945 — Germany surrendered in May and Japan in September.' },
      { id: 'h2', q: 'When did India gain independence?', a: 'August 15, 1947.' },
      { id: 'h3', q: 'When did the French Revolution begin?', a: '1789 — marked by the storming of the Bastille on July 14.' },
    ],
  },
];

export const SUBJECT_QUIZ_BANKS: Record<string, { label: string; questions: SubjectQuizQuestion[] }> = {
  math: {
    label: 'Mathematics',
    questions: [
      { q: 'What is the derivative of x^2?', opts: ['2x', 'x', 'x^2', '2x^2'], ans: 0, exp: 'Using the power rule: d/dx(x^n) = n*x^(n-1), so d/dx(x^2) = 2x.' },
      { q: 'What is 15% of 200?', opts: ['25', '30', '35', '40'], ans: 1, exp: '15% of 200 = 0.15 * 200 = 30.' },
      { q: 'Solve: 3x + 7 = 22. What is x?', opts: ['5', '4', '6', '3'], ans: 0, exp: '3x = 22 - 7 = 15, so x = 15 / 3 = 5.' },
      { q: 'What is sqrt(144)?', opts: ['11', '12', '13', '14'], ans: 1, exp: '12 * 12 = 144, so sqrt(144) = 12.' },
      { q: 'If sin(theta) = 0.5 for an acute angle, what is theta?', opts: ['30 deg', '45 deg', '60 deg', '90 deg'], ans: 0, exp: 'sin(30 deg) = 0.5.' },
      { q: 'What is 2^8?', opts: ['128', '256', '512', '64'], ans: 1, exp: '2^8 = 256.' },
      { q: 'Area of a triangle with base 8 and height 5?', opts: ['40', '20', '13', '80'], ans: 1, exp: 'Area = 0.5 * base * height = 0.5 * 8 * 5 = 20.' },
      { q: 'What is the LCM of 4 and 6?', opts: ['8', '12', '24', '6'], ans: 1, exp: '4 = 2^2 and 6 = 2 * 3, so LCM = 2^2 * 3 = 12.' },
      { q: 'Simplify: (x^2 * y)(x * y^2)', opts: ['x^3 * y^3', 'x^2 * y^2', 'x^3 * y^2', 'x^2 * y^3'], ans: 0, exp: 'Add exponents of matching bases: x^(2+1) * y^(1+2) = x^3 * y^3.' },
      { q: 'What is the sum of interior angles in a triangle?', opts: ['90 deg', '180 deg', '270 deg', '360 deg'], ans: 1, exp: 'The interior angles of any Euclidean triangle sum to 180 degrees.' },
    ],
  },
  science: {
    label: 'Science',
    questions: [
      { q: 'What is the chemical symbol for gold?', opts: ['Go', 'Gd', 'Au', 'Ag'], ans: 2, exp: 'Au comes from the Latin word "aurum" meaning gold.' },
      { q: "Newton's second law states F =", opts: ['mv', 'ma', 'mv^2', 'ma^2'], ans: 1, exp: 'Force equals mass times acceleration (F = ma).' },
      { q: 'Which organelle produces most cellular ATP?', opts: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], ans: 2, exp: 'Mitochondria generate ATP through cellular respiration.' },
      { q: 'What is the atomic number of Oxygen?', opts: ['6', '7', '8', '9'], ans: 2, exp: 'Oxygen has 8 protons, giving it atomic number 8.' },
      { q: 'What is the speed of light in a vacuum (approx.)?', opts: ['3x10^6 m/s', '3x10^8 m/s', '3x10^10 m/s', '3x10^4 m/s'], ans: 1, exp: 'Light travels at roughly 3 x 10^8 m/s in a vacuum.' },
      { q: 'What does DNA stand for?', opts: ['Deoxyribose Nucleic Acid', 'Deoxyribonucleic Acid', 'Dicarbonucleic Acid', 'Dinucleic Acid'], ans: 1, exp: 'DNA stands for Deoxyribonucleic Acid.' },
      { q: "Which gas makes up ~78% of Earth's atmosphere?", opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], ans: 2, exp: 'Nitrogen (N2) accounts for about 78% of dry air.' },
      { q: "What is Ohm's Law?", opts: ['P = IV', 'V = IR', 'F = ma', 'E = mc^2'], ans: 1, exp: 'V = IR relates voltage, current, and resistance.' },
      { q: 'What is the boiling point of pure water at sea level?', opts: ['90 C', '95 C', '100 C', '105 C'], ans: 2, exp: 'At 1 atm pressure, pure water boils at 100 C.' },
      { q: 'Which planet is closest to the Sun?', opts: ['Venus', 'Earth', 'Mars', 'Mercury'], ans: 3, exp: 'Mercury is the innermost planet in the Solar System.' },
    ],
  },
  english: {
    label: 'English',
    questions: [
      { q: 'Which literary device uses "as brave as a lion"?', opts: ['Metaphor', 'Simile', 'Alliteration', 'Hyperbole'], ans: 1, exp: 'A simile compares two things explicitly using "like" or "as".' },
      { q: 'What does "verbose" mean?', opts: ['Silent', 'Using too many words', 'Truthful', 'Hasty'], ans: 1, exp: '"Verbose" means using more words than necessary.' },
      { q: 'What is the plural of "analysis"?', opts: ['Analysis', 'Analysises', 'Analyses', 'Analyzis'], ans: 2, exp: 'Words ending in -is from Greek often pluralize to -es (analyses).' },
      { q: 'Which tense is: "She will have finished by noon"?', opts: ['Simple Future', 'Future Perfect', 'Present Perfect', 'Past Perfect'], ans: 1, exp: '"Will have + past participle" forms the Future Perfect tense.' },
      { q: 'What is an antonym for "abundant"?', opts: ['Plentiful', 'Scarce', 'Ample', 'Rich'], ans: 1, exp: '"Scarce" means insufficient in quantity — the opposite of abundant.' },
      { q: 'Who wrote "Romeo and Juliet"?', opts: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Mark Twain'], ans: 2, exp: 'William Shakespeare wrote Romeo and Juliet around 1594-1596.' },
    ],
  },
  history: {
    label: 'History',
    questions: [
      { q: 'In which year did World War I begin?', opts: ['1912', '1914', '1916', '1918'], ans: 1, exp: 'WWI began in July 1914.' },
      { q: 'The Indian National Congress was founded in which year?', opts: ['1857', '1885', '1905', '1920'], ans: 1, exp: 'The INC was founded in December 1885.' },
      { q: 'The Berlin Wall fell in which year?', opts: ['1987', '1988', '1989', '1990'], ans: 2, exp: 'The Berlin Wall fell on November 9, 1989.' },
      { q: 'The European Renaissance began in which country?', opts: ['France', 'Germany', 'England', 'Italy'], ans: 3, exp: 'The Renaissance began in 14th-century Italy.' },
      { q: 'Which country launched Sputnik 1 in 1957?', opts: ['USA', 'China', 'UK', 'USSR'], ans: 3, exp: 'The USSR launched Sputnik 1 on October 4, 1957.' },
    ],
  },
  cs: {
    label: 'Computer Science',
    questions: [
      { q: 'What is the time complexity of binary search on a sorted array?', opts: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], ans: 2, exp: 'Binary search halves the search space each step, yielding O(log n).' },
      { q: 'Which data structure follows LIFO (Last In, First Out)?', opts: ['Queue', 'Stack', 'Array', 'Binary Tree'], ans: 1, exp: 'A Stack pops the most recently pushed element first.' },
      { q: 'What does SQL stand for?', opts: ['Simple Query Language', 'Structured Query Language', 'Standard Question Logic', 'Sequential Query Language'], ans: 1, exp: 'SQL stands for Structured Query Language.' },
      { q: 'Which sorting algorithm has O(n) best-case time on nearly sorted arrays?', opts: ['Selection Sort', 'Merge Sort', 'Insertion Sort', 'Heap Sort'], ans: 2, exp: 'Insertion Sort only scans once without inner swaps when already sorted.' },
      { q: 'What is the output of 2 ** 3 in Python?', opts: ['6', '8', '5', '9'], ans: 1, exp: '** is exponentiation in Python: 2^3 = 8.' },
      { q: 'Which protocol encrypts HTTP traffic over TLS?', opts: ['FTP', 'SMTP', 'HTTPS', 'UDP'], ans: 2, exp: 'HTTPS layers HTTP over TLS/SSL.' },
    ],
  },
  general: {
    label: 'General Knowledge',
    questions: [
      { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], ans: 3, exp: 'The Pacific Ocean covers over 30% of Earth’s surface.' },
      { q: 'How many bones are in the adult human body?', opts: ['186', '196', '206', '216'], ans: 2, exp: 'Adults typically have 206 bones.' },
      { q: 'What is the currency of Japan?', opts: ['Won', 'Yuan', 'Yen', 'Baht'], ans: 2, exp: 'The Japanese Yen is Japan’s official currency.' },
      { q: 'Who painted the Mona Lisa?', opts: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], ans: 1, exp: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.' },
      { q: 'How many recognized planets are in our Solar System?', opts: ['7', '8', '9', '10'], ans: 1, exp: 'There are 8 recognized planets in our Solar System.' },
    ],
  },
};

export const INITIAL_SUBJECTS: SubjectProgress[] = [
  { id: 'sub-math', name: 'Mathematics', topics: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry'], done: ['Algebra', 'Statistics'] },
  { id: 'sub-phys', name: 'Physics', topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Waves'], done: ['Mechanics'] },
  { id: 'sub-chem', name: 'Chemistry', topics: ['Organic', 'Inorganic', 'Physical', 'Analytical'], done: ['Organic', 'Physical'] },
  { id: 'sub-cs', name: 'Computer Science', topics: ['Data Structures', 'Algorithms', 'Operating Systems', 'Networks', 'Databases'], done: ['Data Structures', 'Algorithms', 'Operating Systems'] },
];

export const INITIAL_GOALS: StudyGoal[] = [
  { id: 'g1', text: 'Complete Calculus practice chapter', done: false },
  { id: 'g2', text: 'Review 50 flashcards this week', done: false },
  { id: 'g3', text: 'Finish 4 Pomodoro focus blocks today', done: false },
];

export const STUDY_TIPS = [
  { title: 'Active Recall', text: 'Instead of rereading notes, close the page and write down everything you remember, then check gaps.' },
  { title: 'Spaced Repetition', text: 'Review material across increasing intervals — 1 day, 3 days, then 7 days — to cement long-term retention.' },
  { title: 'Pomodoro Rhythm', text: 'Pair 25 minutes of single-task focus with a 5-minute away-from-screen break to avoid mental drift.' },
  { title: 'The Feynman Check', text: 'Explain a topic in plain everyday terms. Where your explanation stalls is exactly what to revisit.' },
];

export const CURATED_RESOURCES: ResourceItem[] = [
  { id: 'r1', category: 'Math', title: 'Khan Academy Math', source: 'khanacademy.org', desc: 'Structured lessons from algebra through multivariable calculus with practice exercises.', tags: ['Free', 'Video', 'Practice'], url: 'https://www.khanacademy.org/math' },
  { id: 'r2', category: 'Math', title: 'Wolfram Alpha', source: 'wolframalpha.com', desc: 'Computational engine for checking equations, integrals, matrices, and step-by-step algebra.', tags: ['Calculator', 'Reference'], url: 'https://www.wolframalpha.com' },
  { id: 'r3', category: 'Math', title: 'Desmos Graphing', source: 'desmos.com', desc: 'Fast interactive graphing calculator for plotting functions, derivatives, and sliders.', tags: ['Free', 'Interactive'], url: 'https://www.desmos.com' },
  { id: 'r4', category: 'Science', title: 'PhET Simulations', source: 'phet.colorado.edu', desc: 'Interactive Physics, Chemistry, and Biology simulations built by University of Colorado.', tags: ['Free', 'Simulations'], url: 'https://phet.colorado.edu' },
  { id: 'r5', category: 'Science', title: 'Khan Academy Science', source: 'khanacademy.org', desc: 'Comprehensive science modules covering AP Physics, Chemistry, and Biology.', tags: ['Free', 'Coursework'], url: 'https://www.khanacademy.org/science' },
  { id: 'r6', category: 'Languages', title: 'Project Gutenberg', source: 'gutenberg.org', desc: 'Free classic literature library for humanities reading and essay research.', tags: ['Free', 'Books'], url: 'https://www.gutenberg.org' },
  { id: 'r7', category: 'Languages', title: 'Purdue OWL', source: 'owl.purdue.edu', desc: 'Authoritative writing guide for academic essays, citations (APA, MLA, Chicago), and grammar.', tags: ['Free', 'Writing'], url: 'https://owl.purdue.edu' },
  { id: 'r8', category: 'CS & Tech', title: 'freeCodeCamp', source: 'freecodecamp.org', desc: 'Hands-on programming curriculum covering web development, Python, and algorithms.', tags: ['Free', 'Projects'], url: 'https://www.freecodecamp.org' },
  { id: 'r9', category: 'CS & Tech', title: 'CS50 by Harvard', source: 'cs50.harvard.edu', desc: 'Foundational introduction to computer science, C, Python, SQL, and web architecture.', tags: ['Free', 'Lectures'], url: 'https://cs50.harvard.edu' },
  { id: 'r10', category: 'CS & Tech', title: 'LeetCode', source: 'leetcode.com', desc: 'Algorithm and data structure problem sets for technical interview practice.', tags: ['Practice', 'DSA'], url: 'https://leetcode.com' },
  { id: 'r11', category: 'Exam Prep', title: 'Khan Academy SAT Prep', source: 'khanacademy.org', desc: 'Official structured SAT practice tests, reading drills, and math diagnostics.', tags: ['Free', 'SAT'], url: 'https://www.khanacademy.org/sat' },
  { id: 'r12', category: 'Productivity', title: 'Anki', source: 'apps.ankiweb.net', desc: 'Open-source spaced repetition flashcard software for long-term memorization.', tags: ['Free', 'SRS'], url: 'https://apps.ankiweb.net' },
];

export const BUDDY_PROFILES: StudyBuddyProfile[] = [
  {
    id: 'b-aisha',
    name: 'Aisha Sharma',
    avatarColor: '#6A55DC',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    examTarget: 'JEE',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'morning',
    weeklyHours: 35,
    online: true,
    bio: 'Preparing for JEE Advanced. I prefer silent 50/10 Pomodoro blocks and checking problem sets after each block.',
    shortGoal: 'Finish Electrostatics & Rotational Mechanics problems this week',
  },
  {
    id: 'b-rahul',
    name: 'Rahul Verma',
    avatarColor: '#3B5BDB',
    subjects: ['Mathematics', 'Computer Science', 'Physics'],
    examTarget: 'JEE',
    studyStyle: 'mixed',
    timezone: 'IST',
    studyTime: 'evening',
    weeklyHours: 28,
    online: true,
    bio: 'Working through calculus and competitive programming drills every evening. Happy to compare approaches.',
    shortGoal: 'Solve 20 integration sets and 10 graph problems',
  },
  {
    id: 'b-priya',
    name: 'Priya Nair',
    avatarColor: '#0CA678',
    subjects: ['History', 'Economics', 'Literature'],
    examTarget: 'UPSC',
    studyStyle: 'deep-focus',
    timezone: 'IST',
    studyTime: 'morning',
    weeklyHours: 42,
    online: true,
    bio: 'Consistent morning study routine for UPSC Prelims and Mains answer writing. Looking for daily accountability.',
    shortGoal: 'Complete Modern History revision notes and 2 mock essays',
  },
  {
    id: 'b-zara',
    name: 'Zara Williams',
    avatarColor: '#D6336C',
    subjects: ['Mathematics', 'Literature', 'Economics'],
    examTarget: 'SAT',
    studyStyle: 'collaborative',
    timezone: 'EST',
    studyTime: 'afternoon',
    weeklyHours: 18,
    online: true,
    bio: 'Aiming for 1550+ on the SAT. Love quizzing each other on reading comprehension and math shortcuts.',
    shortGoal: 'Raise Reading & Writing timed section accuracy to 95%',
  },
  {
    id: 'b-chen',
    name: 'Chen Lei',
    avatarColor: '#0B7285',
    subjects: ['Computer Science', 'Mathematics', 'Economics'],
    examTarget: 'GRE',
    studyStyle: 'mixed',
    timezone: 'GMT',
    studyTime: 'evening',
    weeklyHours: 22,
    online: false,
    bio: 'Grad school applicant practicing GRE Quantitative and Verbal flashcards during evening focus sprints.',
    shortGoal: 'Master 300 high-frequency GRE vocabulary cards',
  },
  {
    id: 'b-maya',
    name: 'Maya Patel',
    avatarColor: '#AE3EC9',
    subjects: ['Biology', 'Chemistry', 'Psychology'],
    examTarget: 'Board Exams',
    studyStyle: 'collaborative',
    timezone: 'EST',
    studyTime: 'evening',
    weeklyHours: 24,
    online: true,
    bio: 'Pre-med student studying organic chemistry mechanisms and cellular biology through Feynman explanations.',
    shortGoal: 'Summarize biochemical pathways into clean flashcard decks',
  },
  {
    id: 'b-liam',
    name: 'Liam O’Connor',
    avatarColor: '#1C7ED6',
    subjects: ['Computer Science', 'Mathematics'],
    examTarget: 'GRE',
    studyStyle: 'deep-focus',
    timezone: 'PST',
    studyTime: 'night',
    weeklyHours: 20,
    online: false,
    bio: 'Late-night systems engineering student reviewing algorithms, linear algebra, and probability proofs.',
    shortGoal: 'Finish dynamic programming practice sheet',
  },
  {
    id: 'b-sofia',
    name: 'Sofia Lindqvist',
    avatarColor: '#E67700',
    subjects: ['Economics', 'History', 'Geography'],
    examTarget: 'GMAT',
    studyStyle: 'mixed',
    timezone: 'CET',
    studyTime: 'morning',
    weeklyHours: 25,
    online: true,
    bio: 'MBA applicant focusing on Data Insights and Quantitative reasoning with structured 25-minute intervals.',
    shortGoal: 'Complete two full timed GMAT practice blocks',
  },
];

export function computeMatchScore(user: UserProfile | null, buddy: StudyBuddyProfile): number {
  if (!user) return 0;
  let score = 30;
  const overlap = user.subjects.filter((s) => buddy.subjects.includes(s)).length;
  score += Math.min(35, overlap * 14);
  if (user.examTarget && user.examTarget === buddy.examTarget) score += 18;
  if (user.studyStyle && user.studyStyle === buddy.studyStyle) score += 10;
  if (user.timezone && user.timezone === buddy.timezone) score += 7;
  return Math.min(99, score);
}

export function buildBuddyGreeting(
  buddy: StudyBuddyProfile,
  user: UserProfile | null
): string {
  const sharedSubjects = user
    ? buddy.subjects.filter((s) => user.subjects.includes(s))
    : [];
  const primarySubject = sharedSubjects[0] || buddy.subjects[0] || 'our study goals';
  const examNote =
    user && user.examTarget === buddy.examTarget
      ? `Great to meet another ${buddy.examTarget} student!`
      : `I am prepping for ${buddy.examTarget}.`;

  if (sharedSubjects.length > 0) {
    return `Hey${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! ${examNote} Since we are both focusing on ${sharedSubjects.join(' and ')}, let's knock out a ${buddy.studyStyle.replace('-', ' ')} sprint. My focus today: ${buddy.shortGoal}.`;
  }

  return `Hey${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! ${examNote} Today I am focusing on ${primarySubject} — specifically: ${buddy.shortGoal}. What are you tackling in this block?`;
}

export function computeStudyStreak(
  days: Record<string, number>,
  activeDates: string[] = []
): number {
  const dateSet = new Set<string>(activeDates);
  for (const [dateKey, mins] of Object.entries(days)) {
    if (mins > 0) dateSet.add(dateKey);
  }
  if (dateSet.size === 0) return 0;

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  let cursor: Date | null = null;
  if (dateSet.has(todayKey)) {
    cursor = new Date(today);
  } else if (dateSet.has(yesterdayKey)) {
    cursor = new Date(yesterday);
  } else {
    return 0;
  }

  let streak = 0;
  while (cursor) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

