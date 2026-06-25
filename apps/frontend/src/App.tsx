import { BarChart3, Clapperboard, Home, Search, Sun, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import { ToastProvider } from "./components/ui/toast";
import { cn } from "./lib/utils";
import { AppRoutes } from "./routes/AppRoutes";
import { Button } from "./components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/watchlist", label: "Library", icon: Clapperboard },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 }
];

export const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent">Framekeep</p>
              <p className="text-2xl font-semibold">Media Tracker</p>
            </div>
            <div className="flex items-center gap-3">
              <nav className="flex flex-wrap gap-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 border border-border hover:bg-muted rounded-md shrink-0"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500 animate-in spin-in-12 duration-500" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-slate-700 animate-in spin-in-12 duration-500" />
                )}
              </Button>
            </div>
          </div>
        </header>
        <AppRoutes />
      </div>
    </ToastProvider>
  );
};
