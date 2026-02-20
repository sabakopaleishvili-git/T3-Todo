"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme === "light" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setTheme(initialTheme);
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
  };

  if (!isMounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="rounded-md border border-slate-300 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
      >
        Theme
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-md border border-slate-300 bg-white/80 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
};

export default ThemeToggle;
