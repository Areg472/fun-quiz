"use client";

import { useRef, useCallback } from "react";

interface ShareImageProps {
  currentStreak: number;
  bestStreak: number;
  approvedCount: number;
  notApprovedCount: number;
  theme: string;
  difficulty: string;
  achievementCount: number;
  totalAchievements: number;
  hintsUsed: number;
}

export default function ShareImage({
  currentStreak,
  bestStreak,
  approvedCount,
  notApprovedCount,
  theme,
  difficulty,
  achievementCount,
  totalAchievements,
  hintsUsed,
}: ShareImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("My Quiz Stats 🎯", width / 2, 100);

    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#9ca3af";
    const capitalizedDifficulty =
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    ctx.fillText(`${capitalizedDifficulty} | ${theme}`, width / 2, 150);

    const statsY = 320;
    const statSpacing = 170;
    const startX = width / 2 - statSpacing * 2.5;

    const drawStat = (
      emoji: string,
      label: string,
      value: string,
      x: number,
      color: string,
    ) => {
      ctx.textAlign = "center";

      ctx.font = "60px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(emoji, x, statsY);

      ctx.font = "24px sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(label, x, statsY + 45);

      ctx.font = "bold 60px sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(value, x, statsY + 115);
    };

    const currentStreakColor =
      currentStreak >= 20
        ? "#f97316"
        : currentStreak >= 10
          ? "#fbbf24"
          : "#fde047";
    const bestStreakColor =
      bestStreak >= 20 ? "#f97316" : bestStreak >= 10 ? "#fbbf24" : "#fde047";

    const achievementColor =
      achievementCount === totalAchievements
        ? "#fbbf24"
        : achievementCount >= totalAchievements / 2
          ? "#a78bfa"
          : "#60a5fa";

    drawStat(
      "⚡",
      "Current Streak",
      currentStreak.toString(),
      startX,
      currentStreakColor,
    );
    drawStat(
      "🔥",
      "Max Streak",
      bestStreak.toString(),
      startX + statSpacing,
      bestStreakColor,
    );
    drawStat(
      "✅",
      "Correct",
      approvedCount.toString(),
      startX + statSpacing * 2,
      "#10b981",
    );
    drawStat(
      "❌",
      "Mistakes",
      notApprovedCount.toString(),
      startX + statSpacing * 3,
      "#ef4444",
    );
    drawStat(
      "🏆",
      "Achievements",
      `${achievementCount}/${totalAchievements}`,
      startX + statSpacing * 4,
      achievementColor,
    );
    drawStat(
      "💡",
      "Hints Used",
      hintsUsed.toString(),
      startX + statSpacing * 5,
      "#fbbf24",
    );

    ctx.textAlign = "center";
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Share your quiz stats on Slack!", width / 2, height - 70);
    ctx.fillText("fun-quiz.aregus.me", width / 2, height - 40);
  }, [
    currentStreak,
    bestStreak,
    approvedCount,
    notApprovedCount,
    theme,
    difficulty,
    achievementCount,
    totalAchievements,
    hintsUsed,
  ]);

  const handleDownload = useCallback(() => {
    generateImage();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setTimeout(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `quiz-stats-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    }, 100);
  }, [generateImage]);

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-gray-700 cursor-pointer text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center gap-2"
      >
        <span>Share My Stats :P</span>
      </button>
    </div>
  );
}
