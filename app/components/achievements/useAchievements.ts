import { useState, useEffect, useCallback } from "react";
import {
  ACHIEVEMENTS,
  AchievementsState,
  DEFAULT_ACHIEVEMENTS_STATE,
  Achievement,
} from "./achievementsData";

const STORAGE_KEY = "quizAchievements";

export interface NewAchievement {
  achievement: Achievement;
  timestamp: string;
}

export function useAchievements() {
  const [state, setState] = useState<AchievementsState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_ACHIEVEMENTS_STATE,
            ...parsed,
            achievements: {
              ...DEFAULT_ACHIEVEMENTS_STATE.achievements,
              ...parsed.achievements,
            },
            stats: {
              ...DEFAULT_ACHIEVEMENTS_STATE.stats,
              ...parsed.stats,
            },
          };
        } catch {
          return DEFAULT_ACHIEVEMENTS_STATE;
        }
      }
    }
    return DEFAULT_ACHIEVEMENTS_STATE;
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<NewAchievement[]>([]);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [hadWrongStreak, setHadWrongStreak] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return;

      if (state.achievements[achievementId]?.unlockedAt) return;

      const timestamp = new Date().toISOString();

      setState((prev) => ({
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: {
            unlockedAt: timestamp,
            progress: achievement.requirement,
          },
        },
      }));

      setNewlyUnlocked((prev) => [...prev, { achievement, timestamp }]);
    },
    [state.achievements],
  );

  const updateProgress = useCallback(
    (achievementId: string, progress: number) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return;

      if (state.achievements[achievementId]?.unlockedAt) return;

      setState((prev) => ({
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: {
            ...prev.achievements[achievementId],
            progress: Math.min(progress, achievement.requirement),
          },
        },
      }));

      if (progress >= achievement.requirement) {
        unlockAchievement(achievementId);
      }
    },
    [state.achievements, unlockAchievement],
  );

  const checkStreakAchievements = useCallback(
    (streak: number, difficulty?: string) => {
      if (streak >= 1) updateProgress("first_blood", 1);
      if (streak >= 3) updateProgress("streak_3", 3);
      if (streak >= 5) updateProgress("streak_5", 5);
      if (streak >= 10) updateProgress("streak_10", 10);
      if (streak >= 15) updateProgress("streak_15", 15);

      if (difficulty === "hard" && streak >= 5) {
        unlockAchievement("hard_streak_5");
      }
    },
    [updateProgress, unlockAchievement],
  );

  const recordAnswer = useCallback(
    (
      correct: boolean,
      currentStreak: number,
      theme?: string | null,
      difficulty?: string,
    ) => {
      setState((prev) => {
        const newStats = {
          ...prev.stats,
          totalQuestions: prev.stats.totalQuestions + 1,
          totalCorrect: correct
            ? prev.stats.totalCorrect + 1
            : prev.stats.totalCorrect,
          totalWrong: !correct
            ? prev.stats.totalWrong + 1
            : prev.stats.totalWrong,
          currentStreak: correct ? currentStreak : 0,
          bestStreak: Math.max(prev.stats.bestStreak, currentStreak),
          themesPlayed:
            theme && !prev.stats.themesPlayed.includes(theme)
              ? [...prev.stats.themesPlayed, theme]
              : prev.stats.themesPlayed,
          difficultiesPlayed:
            difficulty && !prev.stats.difficultiesPlayed.includes(difficulty)
              ? [...prev.stats.difficultiesPlayed, difficulty]
              : prev.stats.difficultiesPlayed,
        };

        return { ...prev, stats: newStats };
      });

      if (!correct) {
        setWrongStreak((prev) => {
          const newWrongStreak = prev + 1;
          if (newWrongStreak >= 3) {
            setHadWrongStreak(true);
          }
          return newWrongStreak;
        });
      } else {
        if (hadWrongStreak && currentStreak >= 5) {
          unlockAchievement("comeback");
          setHadWrongStreak(false);
        }
        setWrongStreak(0);
      }

      const totalQuestions = state.stats.totalQuestions + 1;
      if (totalQuestions >= 10) updateProgress("questions_10", totalQuestions);
      if (totalQuestions >= 50) updateProgress("questions_50", totalQuestions);
      if (totalQuestions >= 100)
        updateProgress("questions_100", totalQuestions);

      if (correct) {
        const totalCorrect = state.stats.totalCorrect + 1;
        if (totalCorrect >= 10) updateProgress("correct_10", totalCorrect);
        if (totalCorrect >= 50) updateProgress("correct_50", totalCorrect);
        if (totalCorrect >= 100) updateProgress("correct_100", totalCorrect);

        checkStreakAchievements(currentStreak, difficulty);
      }

      const themesCount = theme
        ? state.stats.themesPlayed.includes(theme)
          ? state.stats.themesPlayed.length
          : state.stats.themesPlayed.length + 1
        : state.stats.themesPlayed.length;
      if (themesCount >= 3) updateProgress("theme_explorer", themesCount);
      if (themesCount >= 7) updateProgress("theme_master", themesCount);

      const difficultiesCount = difficulty
        ? state.stats.difficultiesPlayed.includes(difficulty)
          ? state.stats.difficultiesPlayed.length
          : state.stats.difficultiesPlayed.length + 1
        : state.stats.difficultiesPlayed.length;
      if (difficultiesCount >= 3)
        updateProgress("difficulty_all", difficultiesCount);
    },
    [
      state.stats,
      hadWrongStreak,
      updateProgress,
      unlockAchievement,
      checkStreakAchievements,
    ],
  );

  const dismissNotification = useCallback((achievementId: string) => {
    setNewlyUnlocked((prev) =>
      prev.filter((n) => n.achievement.id !== achievementId),
    );
  }, []);

  const dismissAllNotifications = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const getUnlockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(
      (a) => state.achievements[a.id]?.unlockedAt !== null,
    );
  }, [state.achievements]);

  const getLockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(
      (a) => state.achievements[a.id]?.unlockedAt === null && !a.hidden,
    );
  }, [state.achievements]);

  const getAchievementProgress = useCallback(
    (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return { progress: 0, requirement: 0, percentage: 0 };

      const progress = state.achievements[achievementId]?.progress || 0;
      return {
        progress,
        requirement: achievement.requirement,
        percentage: Math.min(
          100,
          Math.round((progress / achievement.requirement) * 100),
        ),
      };
    },
    [state.achievements],
  );

  const resetAchievements = useCallback(() => {
    setState(DEFAULT_ACHIEVEMENTS_STATE);
    setNewlyUnlocked([]);
    setWrongStreak(0);
    setHadWrongStreak(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    state,
    newlyUnlocked,
    recordAnswer,
    dismissNotification,
    dismissAllNotifications,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    resetAchievements,
    unlockAchievement,
  };
}
