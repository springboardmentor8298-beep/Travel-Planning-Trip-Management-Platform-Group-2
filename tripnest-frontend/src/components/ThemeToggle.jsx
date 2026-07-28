import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={`Switch to ${isDark ? "light" : "dark"} mode`}>
    <span className="theme-toggle__track"><Sun size={14}/><Moon size={14}/><i className={isDark ? "is-dark" : ""}/></span>
    <span>{isDark ? "Dark" : "Light"}</span>
  </button>;
}
