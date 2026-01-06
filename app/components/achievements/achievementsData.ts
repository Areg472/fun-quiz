export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "streak" | "accuracy" | "milestone" | "special";
  requirement: number;
  hidden?: boolean;
}

export interface AchievementProgress {
  unlockedAt: string | null;
  progress: number;
}

export interface AchievementsState {
  achievements: Record<string, AchievementProgress>;
  stats: {
    totalCorrect: number;
    totalWrong: number;
    totalQuestions: number;
    currentStreak: number;
    bestStreak: number;
    perfectGames: number;
    themesPlayed: string[];
    difficultiesPlayed: string[];
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: "yay",
    description: "Get your first correct answer",
    emoji: "😃",
    category: "streak",
    requirement: 1,
  },
  {
    id: "streak_3",
    name: "Hello",
    description: "Reach a streak of 3",
    emoji: "⚡",
    category: "streak",
    requirement: 3,
  },
  {
    id: "streak_5",
    name: "Hmm...",
    description: "Reach a streak of 5",
    emoji: "💭",
    category: "streak",
    requirement: 5,
  },
  {
    id: "streak_10",
    name: "Unstoppable",
    description: "Ur smarter than Areg",
    emoji: "😡",
    category: "streak",
    requirement: 10,
  },
  {
    id: "streak_15",
    name: "A bad person",
    description: "Reach a streak of 15",
    emoji: "🎓",
    category: "streak",
    requirement: 15,
  },
  {
    id: "questions_10",
    name: "doing well ig",
    description: "Answer 10 questions",
    emoji: "📝",
    category: "milestone",
    requirement: 10,
  },
  {
    id: "questions_50",
    name: "quack!",
    description: "Answer 50 questions",
    emoji: "🦆",
    category: "milestone",
    requirement: 50,
  },
  {
    id: "questions_100",
    name: "Fake retirement",
    description: "Get a job, kid",
    emoji: "🏢",
    category: "milestone",
    requirement: 100,
  },
  {
    id: "correct_10",
    name: "Kewl",
    description: "Get 10 correct answers",
    emoji: "🧠",
    category: "accuracy",
    requirement: 10,
  },
  {
    id: "correct_50",
    name: "ill think about this one",
    description: "Get 50 correct answers",
    emoji: "😤",
    category: "accuracy",
    requirement: 50,
  },
  {
    id: "correct_100",
    name: "Philospher",
    description: "Ahlelele Ahlelas",
    emoji: "😭",
    category: "accuracy",
    requirement: 100,
  },
  {
    id: "theme_explorer",
    name: "Cuckoo",
    description: "Play 3 different themes",
    emoji: "🕰️",
    category: "special",
    requirement: 3,
  },
  {
    id: "theme_master",
    name: "Yipee",
    description: "Play all 7 themes",
    emoji: "🌈",
    category: "special",
    requirement: 7,
  },
  {
    id: "difficulty_all",
    name: "Interesting Person",
    description: "Play all difficulty levels",
    emoji: "🎮",
    category: "special",
    requirement: 3,
  },
  {
    id: "hard_streak_5",
    name: "imagine doing ts",
    description: "secret",
    emoji: "☠️",
    category: "special",
    requirement: 5,
  },
  {
    id: "comeback",
    name: "were u sleeping?",
    description: "secret",
    emoji: "🤫",
    category: "special",
    requirement: 1,
  },
  {
    id: "completionist",
    name: "True Completionist",
    description: "Unlock all other achievements",
    emoji: "👑",
    category: "special",
    requirement: 1,
    hidden: true,
  },
];

export const DEFAULT_ACHIEVEMENTS_STATE: AchievementsState = {
  achievements: ACHIEVEMENTS.reduce(
    (acc, achievement) => {
      acc[achievement.id] = { unlockedAt: null, progress: 0 };
      return acc;
    },
    {} as Record<string, AchievementProgress>,
  ),
  stats: {
    totalCorrect: 0,
    totalWrong: 0,
    totalQuestions: 0,
    currentStreak: 0,
    bestStreak: 0,
    perfectGames: 0,
    themesPlayed: [],
    difficultiesPlayed: [],
  },
};
