"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import ThemeSelector from "./ThemeSelector";
import DifficultySelector from "./DifficultySelector";

const THEMES = [
  { id: "general", name: "General Knowledge", emoji: "🧠" },
  { id: "science", name: "Science", emoji: "🔬" },
  { id: "history", name: "History", emoji: "📜" },
  { id: "geography", name: "Geography", emoji: "🌍" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "movies", name: "Movies & TV", emoji: "🎬" },
  { id: "music", name: "Music", emoji: "🎵" },
];

export default function AIStuff() {
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [, setIsApproved] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [notApprovedCount, setNotApprovedCount] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<(typeof THEMES)[0] | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const isFirstResponse = useRef(true);
  const hasInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
          }

          if (parsed.approval !== undefined) {
            const approved =
              parsed.approval === true || parsed.approval === "true";
            setIsApproved(approved);

            if (!isFirstResponse.current) {
              if (approved) {
                setApprovedCount((prev) => prev + 1);
              } else {
                setNotApprovedCount((prev) => prev + 1);
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

  const handleThemeChange = (theme: (typeof THEMES)[0]) => {
    setSelectedTheme(theme);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setApprovedCount(0);
    setNotApprovedCount(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(theme.name),
    });
  };

  const handleClearTheme = () => {
    setSelectedTheme(null);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setApprovedCount(0);
    setNotApprovedCount(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(null),
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setApprovedCount(0);
    setNotApprovedCount(0);
    isFirstResponse.current = true;
    sendMessage({
      text: buildQuestionRequest(selectedTheme?.name, difficulty),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-2xl mb-8 mt-8">
        <ThemeSelector
          themes={THEMES}
          selectedTheme={selectedTheme}
          onThemeSelect={handleThemeChange}
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
            <h1 className="text-4xl font-bold text-white mb-2">
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

          <div className="mt-8 flex justify-center gap-8 text-white">
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
        </div>

        <div className="mt-6 text-center text-white text-lg">Areg :D</div>
      </div>
    </div>
  );
}
