"use client";

interface DifficultySelectorProps {
  selectedDifficulty: string;
  onDifficultySelect: (difficulty: string) => void;
  disabled?: boolean;
}

const difficulties = [
  { id: "easy", name: "Easy", emoji: "🟢", color: "bg-green-600 hover:bg-green-500" },
  { id: "medium", name: "Medium", emoji: "🟡", color: "bg-yellow-600 hover:bg-yellow-500" },
  { id: "hard", name: "Hard", emoji: "🔴", color: "bg-red-700 hover:bg-red-600" },
];

export default function DifficultySelector({
  selectedDifficulty,
  onDifficultySelect,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <div className="border-2 border-white rounded-3xl p-6 bg-black">
      <h2 className="text-white text-center text-lg mb-4 font-semibold">
        Select Difficulty
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.id}
            onClick={() => onDifficultySelect(difficulty.id)}
            disabled={disabled}
            className={`
              px-6 py-2 rounded-lg text-white font-medium transition-all
              ${difficulty.color}
              ${selectedDifficulty === difficulty.id ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {difficulty.emoji} {difficulty.name}
          </button>
        ))}
      </div>
    </div>
  );
}
