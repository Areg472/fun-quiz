"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import ThemeSelector from "./ThemeSelector";
import DifficultySelector from "./DifficultySelector";
import ShareImage from "./ShareImage";
import {
  useAchievements,
  AchievementsPanel,
  ACHIEVEMENTS,
} from "./achievements";

const THEMES = [
  { id: "general", name: "General Knowledge", emoji: "🧠" },
  { id: "science", name: "Science", emoji: "🔬" },
  { id: "history", name: "History", emoji: "📜" },
  { id: "geography", name: "Geography", emoji: "🌍" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "movies", name: "Movies & TV", emoji: "🎬" },
  { id: "music", name: "Music", emoji: "🎵" },
];

function getStreakEmoji(streak: number): string {
  if (streak >= 20) return "🔥🔥🔥";
  if (streak >= 10) return "🔥🔥";
  if (streak >= 5) return "🔥";
  if (streak >= 3) return "⚡";
  return "";
}

function getStreakMessage(streak: number): string {
  if (streak >= 50) return "bad person";
  if (streak >= 25) return "noooo";
  if (streak >= 20) return "quit it";
  if (streak >= 15) return "i want u to do a mistake";
  if (streak >= 10) return "no";
  if (streak >= 5) return "better";
  if (streak >= 3) return "kewl";
  return "";
}

export default function AIStuff() {
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [, setIsApproved] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [notApprovedCount, setNotApprovedCount] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintUsedForCurrentQuestion, setHintUsedForCurrentQuestion] =
    useState(false);
  const [selectedTheme, setSelectedTheme] = useState<(typeof THEMES)[0] | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakBroken, setStreakBroken] = useState(false);
  const isFirstResponse = useRef(true);
  const selectedDifficultyRef = useRef(selectedDifficulty);
  const selectedThemeRef = useRef(selectedTheme);
  const hasInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    state: achievementsState,
    recordAnswer,
    getAchievementProgress,
    resetAchievements,
  } = useAchievements();

  const bestStreak = achievementsState.stats.bestStreak;

  const { sendMessage, status } = useChat({
    onFinish: ({ message }) => {
      const firstPart = message.parts.find((part) => part.type === "text");
      if (firstPart && firstPart.type === "text") {
        const text = firstPart.text.trim();

        console.log("AI Response:", text);

        try {
          const parsed = JSON.parse(text);

          if (parsed.question) {
            setCurrentQuestion(parsed.question);
            setShowHint(false);
            setHintUsedForCurrentQuestion(false);
          }

          if (parsed.hint) {
            setCurrentHint(parsed.hint);
          }

          if (parsed.approval !== undefined) {
            const approved =
              parsed.approval === true || parsed.approval === "true";
            setIsApproved(approved);

            if (!isFirstResponse.current) {
              if (approved) {
                setApprovedCount((prev) => prev + 1);
                setStreakBroken(false);
                setCurrentStreak((prev) => {
                  const newStreak = prev + 1;
                  recordAnswer(
                    true,
                    newStreak,
                    selectedThemeRef.current?.name,
                    selectedDifficultyRef.current,
                  );
                  return newStreak;
                });
              } else {
                setNotApprovedCount((prev) => prev + 1);
                if (currentStreak >= 3) {
                  setStreakBroken(true);
                  setTimeout(() => setStreakBroken(false), 2000);
                }
                recordAnswer(
                  false,
                  0,
                  selectedThemeRef.current?.name,
                  selectedDifficultyRef.current,
                );
                setCurrentStreak(0);
              }
            }
          }

          if (parsed.answer) {
            setCurrentAnswer(parsed.answer);
          }

          isFirstResponse.current = false;
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }
      setIsWaiting(false);
    },
  });

  const buildQuestionRequest = (theme?: string | null, difficulty?: string) => {
    const difficultyText = difficulty || selectedDifficulty;
    const themeText = theme ? ` about ${theme}` : "";
    return `Give a ${difficultyText} difficulty question to ask the user${themeText}`;
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage({
        text: "Give a medium difficulty question to ask the user",
      });
    }
  }, [sendMessage]);

  useEffect(() => {
    if (currentQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const handleThemeSelect = (theme: (typeof THEMES)[0]) => {
    setSelectedTheme(theme);
    selectedThemeRef.current = theme;
    setCurrentQuestion("");
    setCurrentAnswer("");
    setCurrentHint("");
    setShowHint(false);
    setHintsUsed(0);
    setHintUsedForCurrentQuestion(false);
    setApprovedCount(0);
    setNotApprovedCount(0);
    setCurrentStreak(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(theme.name),
    });
  };

  const handleClearTheme = () => {
    setSelectedTheme(null);
    selectedThemeRef.current = null;
    setCurrentQuestion("");
    setCurrentAnswer("");
    setCurrentHint("");
    setShowHint(false);
    setHintsUsed(0);
    setHintUsedForCurrentQuestion(false);
    setApprovedCount(0);
    setNotApprovedCount(0);
    setCurrentStreak(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(null),
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    selectedDifficultyRef.current = difficulty;
    setCurrentQuestion("");
    setCurrentAnswer("");
    setCurrentHint("");
    setShowHint(false);
    setHintsUsed(0);
    setHintUsedForCurrentQuestion(false);
    setApprovedCount(0);
    setNotApprovedCount(0);
    setCurrentStreak(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(selectedTheme?.name, difficulty),
    });
  };

  const streakEmoji = getStreakEmoji(currentStreak);
  const streakMessage = getStreakMessage(currentStreak);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-2xl mb-8 mt-8">
        <ThemeSelector
          themes={THEMES}
          selectedTheme={selectedTheme}
          onThemeSelect={handleThemeSelect}
          onClearTheme={handleClearTheme}
          disabled={isWaiting || status === "streaming"}
        />

        <div className="mt-4">
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onDifficultySelect={handleDifficultyChange}
            disabled={isWaiting || status === "streaming"}
          />
        </div>

        <div className="border-2 border-white rounded-3xl p-12 bg-black mt-6">
          <div className="text-center mb-8">
            <h1
              className={`font-bold text-white mb-2 ${
                selectedDifficulty === "easy"
                  ? "text-4xl"
                  : selectedDifficulty === "medium"
                    ? "text-3xl"
                    : "text-2xl"
              }`}
            >
              {currentQuestion || "Pending question..."}
            </h1>
            <p className="text-gray-400">
              {selectedTheme
                ? `Theme: ${selectedTheme.emoji} ${selectedTheme.name}`
                : "Theme: 🎲 Random"}{" "}
              | Difficulty:{" "}
              {selectedDifficulty.charAt(0).toUpperCase() +
                selectedDifficulty.slice(1)}
            </p>
          </div>

          <div className="flex justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                  setIsApproved(false);
                  setIsWaiting(true);
                  setCurrentAnswer("");
                  setShowHint(false);
                }
              }}
              className="w-full max-w-md"
            >
              <input
                ref={inputRef}
                className="w-full p-4 text-center border-2 border-white rounded-xl bg-black text-white text-lg placeholder-gray-400"
                value={input}
                placeholder="Answer here"
                onChange={(e) => setInput(e.currentTarget.value)}
                disabled={isWaiting || status === "streaming"}
              />
            </form>
          </div>

          {currentHint && !isWaiting && status !== "streaming" && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (!showHint && !hintUsedForCurrentQuestion) {
                    setHintsUsed((prev) => prev + 1);
                    setHintUsedForCurrentQuestion(true);
                  }
                  setShowHint(!showHint);
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 cursor-pointer text-white rounded-lg transition-colors"
              >
                {showHint ? "Hide Hint" : "Show Hint 💡"}
              </button>
              {showHint && (
                <div className="mt-3 p-4 bg-gray-800 rounded-xl text-white">
                  <strong>Hint:</strong> {currentHint}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <div className={`transition-all duration-300`}>
              {currentStreak > 0 && (
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold">
                    {streakEmoji} Streak: {currentStreak} {streakEmoji}
                  </span>
                  {streakMessage && (
                    <div
                      className={`text-lg mt-1 ${currentStreak >= 10 ? "text-orange-400" : "text-yellow-400"}`}
                    >
                      {streakMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
            {streakBroken && (
              <div className="text-xl text-red-400 animate-pulse">
                Streak broken(yay)!
              </div>
            )}
            <div className="text-gray-400 mt-2">
              🏆 Best Streak: {bestStreak}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-8 text-white">
            <div className="text-center">
              <div className="text-2xl">✅ {approvedCount}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">❌ {notApprovedCount}</div>
            </div>
          </div>

          {(isWaiting || status === "streaming") && (
            <div className="mt-6 text-center text-white text-xl">
              ⏳ Waiting...
            </div>
          )}

          {currentAnswer && (
            <div className="mt-6 p-4 bg-yellow-900 rounded-xl text-center text-white">
              <strong>Previous Answer:</strong> {currentAnswer}
            </div>
          )}
          <ShareImage
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            approvedCount={approvedCount}
            notApprovedCount={notApprovedCount}
            theme={
              selectedTheme
                ? `${selectedTheme.emoji} ${selectedTheme.name}`
                : "🎲 Random"
            }
            difficulty={selectedDifficulty}
            achievementCount={
              ACHIEVEMENTS.filter(
                (a) =>
                  achievementsState.achievements[a.id]?.unlockedAt !== null,
              ).length
            }
            totalAchievements={ACHIEVEMENTS.filter((a) => !a.hidden).length}
            hintsUsed={hintsUsed}
          />
        </div>

        <div className="mt-6 text-center text-white text-lg">Areg :D</div>
      </div>

      <AchievementsPanel
        state={achievementsState}
        getAchievementProgress={getAchievementProgress}
        onReset={resetAchievements}
      />
    </div>
  );
}
