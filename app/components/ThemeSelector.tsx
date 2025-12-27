"use client";

interface Theme {
  id: string;
  name: string;
  emoji: string;
}

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
  onClearTheme: () => void;
  disabled?: boolean;
}

const themeColors: Record<string, string> = {
  general: "bg-gray-600 hover:bg-gray-500",
  science: "bg-green-600 hover:bg-green-500",
  history: "bg-amber-600 hover:bg-amber-500",
  geography: "bg-blue-600 hover:bg-blue-500",
  sports: "bg-red-900 hover:bg-red-800",
  movies: "bg-purple-600 hover:bg-purple-500",
  music: "bg-pink-900 hover:bg-pink-800",
};

export default function ThemeSelector({
  themes,
  selectedTheme,
  onThemeSelect,
  onClearTheme,
  disabled = false,
}: ThemeSelectorProps) {
  return (
    <div className="border-2 border-white rounded-3xl p-6 bg-black">
      <h2 className="text-white text-center text-lg mb-4 font-semibold">
        Select Theme
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeSelect(theme)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg text-white font-medium transition-all
              ${themeColors[theme.id] || "bg-gray-600 hover:bg-gray-500"}
              ${selectedTheme?.id === theme.id ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {theme.emoji} {theme.name}
          </button>
        ))}
        {selectedTheme && (
          <button
            onClick={onClearTheme}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg text-white font-medium transition-all
              bg-zinc-800 hover:bg-zinc-700 border border-zinc-600
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            ✕ Clear Theme
          </button>
        )}
      </div>
    </div>
  );
}
