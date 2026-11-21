import { useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const choose = (next: Theme) => {
    applyTheme(next);
    setTheme(next);
  };

  return (
    <div className={`flex rounded-full bg-paper/80 p-1 ${className}`} role="group" aria-label="Tema">
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => choose("light")}
        className={`rounded-full px-3 py-1.5 text-sm ${theme === "light" ? "bg-accent text-on-accent" : "text-ink/70"}`}
      >
        Claro
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => choose("dark")}
        className={`rounded-full px-3 py-1.5 text-sm ${theme === "dark" ? "bg-accent text-on-accent" : "text-ink/70"}`}
      >
        Oscuro
      </button>
    </div>
  );
};
