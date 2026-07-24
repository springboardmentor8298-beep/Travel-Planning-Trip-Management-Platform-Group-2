import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("tripnest-theme") || "light");
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("tripnest-theme", theme); }, [theme]);
  return <><ThemeToggle theme={theme} onToggle={() => setTheme((value) => value === "light" ? "dark" : "light")} /><AppRoutes /></>;
}

export default App;
