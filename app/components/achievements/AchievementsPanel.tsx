"use client";

import { useState } from "react";
import { ACHIEVEMENTS, Achievement } from "./achievementsData";
import { AchievementsState } from "./achievementsData";

interface AchievementsPanelProps {
  state: AchievementsState;
  getAchievementProgress: (id: string) => {
    progress: number;
    requirement: number;
    percentage: number;
  };
  onReset?: () => void;
}

type CategoryFilter = "all" | "streak" | "accuracy" | "milestone" | "special";

export default function AchievementsPanel({
  state,
  getAchievementProgress,
  onReset,
}: AchievementsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const unlockedCount = ACHIEVEMENTS.filter(
    (a) => state.achievements[a.id]?.unlockedAt !== null,
  ).length;

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (a.hidden && !state.achievements[a.id]?.unlockedAt) return false;
    if (filter === "all") return true;
    return a.category === filter;
  });

  const getCategoryColor = (category: Achievement["category"]) => {
    switch (category) {
      case "streak":
        return "bg-orange-500/20 border-orange-500";
      case "accuracy":
        return "bg-blue-500/20 border-blue-500";
      case "milestone":
        return "bg-purple-500/20 border-purple-500";
      case "special":
        return "bg-pink-500/20 border-pink-500";
      default:
        return "bg-gray-500/20 border-gray-500";
    }
  };

  const getCategoryEmoji = (category: Achievement["category"]) => {
    switch (category) {
      case "streak":
        return "🔥";
      case "accuracy":
        return "🎯";
      case "milestone":
        return "📊";
      case "special":
        return "⭐";
      default:
        return "📌";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer z-40"
      >
        <span className="text-xl">🏆</span>
        <span className="font-semibold">
          {unlockedCount}/{ACHIEVEMENTS.filter((a) => !a.hidden).length}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 border-2 border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700 bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Achievements
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {unlockedCount} of{" "}
                    {ACHIEVEMENTS.filter((a) => !a.hidden).length} unlocked
                    {ACHIEVEMENTS.filter(
                      (a) => a.hidden && state.achievements[a.id]?.unlockedAt,
                    ).length > 0 && (
                      <span className="text-yellow-400 ml-2">
                        +
                        {
                          ACHIEVEMENTS.filter(
                            (a) =>
                              a.hidden && state.achievements[a.id]?.unlockedAt,
                          ).length
                        }{" "}
                        secret
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 cursor-pointer hover:text-white text-2xl p-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">
                    {state.stats.totalCorrect}
                  </div>
                  <div className="text-xs text-gray-400">Correct</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-red-400">
                    {state.stats.totalWrong}
                  </div>
                  <div className="text-xs text-gray-400">Wrong</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-400">
                    {state.stats.bestStreak}
                  </div>
                  <div className="text-xs text-gray-400">Best Streak</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">
                    {state.stats.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {(
                  [
                    "all",
                    "streak",
                    "accuracy",
                    "milestone",
                    "special",
                  ] as CategoryFilter[]
                ).map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer font-medium transition-all ${
                      filter === category
                        ? "bg-gray-600 text-black"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {category === "all"
                      ? "🎪 All"
                      : `${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-3">
                {filteredAchievements.map((achievement) => {
                  const isUnlocked =
                    state.achievements[achievement.id]?.unlockedAt !== null;
                  const { progress, requirement, percentage } =
                    getAchievementProgress(achievement.id);

                  return (
                    <div
                      key={achievement.id}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${
                          isUnlocked
                            ? `${getCategoryColor(achievement.category)} opacity-100`
                            : "bg-gray-800/50 border-gray-700 opacity-60"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-3xl flex-shrink-0 ${isUnlocked ? "" : "grayscale opacity-50"}`}
                        >
                          {achievement.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bold ${
                                isUnlocked ? "text-white" : "text-gray-400"
                              }`}
                            >
                              {achievement.name}
                            </h3>
                            {achievement.hidden && (
                              <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                                Secret
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              isUnlocked ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            {achievement.description}
                          </p>
                          {isUnlocked &&
                            state.achievements[achievement.id]?.unlockedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Unlocked{" "}
                                {new Date(
                                  state.achievements[achievement.id]
                                    .unlockedAt!,
                                ).toLocaleDateString()}
                              </p>
                            )}

                          {!isUnlocked && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>
                                  {progress}/{requirement}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {isUnlocked && (
                          <div className="text-2xl flex-shrink-0">✅</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {state.stats.themesPlayed.length} themes explored •{" "}
                {state.stats.difficultiesPlayed.length} difficulties tried
              </div>
              {onReset && (
                <div className="relative">
                  {showConfirmReset ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-red-400">
                        Are you sure?
                      </span>
                      <button
                        onClick={() => {
                          onReset();
                          setShowConfirmReset(false);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmReset(true)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Reset Progress
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
