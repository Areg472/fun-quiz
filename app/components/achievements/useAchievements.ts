import { useState, useEffect, useCallback, useRef } from "react";
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
  const wrongStreakRef = useRef(0);
  const hadWrongStreakRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const checkCompletionist = useCallback(
    (updatedAchievements: typeof state.achievements) => {
      if (updatedAchievements["completionist"]?.unlockedAt) return;

      const otherAchievements = ACHIEVEMENTS.filter(
        (a) => a.id !== "completionist",
      );
      const allOthersUnlocked = otherAchievements.every(
        (a) => updatedAchievements[a.id]?.unlockedAt !== null,
      );

      if (allOthersUnlocked) {
        const completionistAchievement = ACHIEVEMENTS.find(
          (a) => a.id === "completionist",
        );
        if (completionistAchievement) {
          const timestamp = new Date().toISOString();
          setState((prev) => ({
            ...prev,
            achievements: {
              ...prev.achievements,
              completionist: {
                unlockedAt: timestamp,
                progress: 1,
              },
            },
          }));
          setNewlyUnlocked((prev) => [
            ...prev,
            { achievement: completionistAchievement, timestamp },
          ]);
        }
      }
    },
    [],
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return;

      if (state.achievements[achievementId]?.unlockedAt) return;

      const timestamp = new Date().toISOString();

      const updatedAchievements = {
        ...state.achievements,
        [achievementId]: {
          unlockedAt: timestamp,
          progress: achievement.requirement,
        },
      };

      setState((prev) => ({
        ...prev,
        achievements: updatedAchievements,
      }));

      setNewlyUnlocked((prev) => [...prev, { achievement, timestamp }]);

      if (achievementId !== "completionist") {
        checkCompletionist(updatedAchievements);
      }
    },
    [state.achievements, checkCompletionist],
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
        wrongStreakRef.current += 1;
        if (wrongStreakRef.current >= 3) {
          hadWrongStreakRef.current = true;
        }
      } else {
        if (hadWrongStreakRef.current && currentStreak >= 5) {
          unlockAchievement("comeback");
          hadWrongStreakRef.current = false;
        }
        wrongStreakRef.current = 0;
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
    [state.stats, updateProgress, unlockAchievement, checkStreakAchievements],
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
    wrongStreakRef.current = 0;
    hadWrongStreakRef.current = false;
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
