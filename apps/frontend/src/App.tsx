import { BarChart3, Clapperboard, Home, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

import { ToastProvider } from "./components/ui/toast";
import { cn } from "./lib/utils";
import { AppRoutes } from "./routes/AppRoutes";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/watchlist", label: "Watchlist", icon: Clapperboard },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 }
];

export const App = () => (
  <ToastProvider>
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-accent">Framekeep</p>
            <p className="text-2xl font-semibold">Media Tracker</p>
          </div>
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
        </div>
      </header>
      <AppRoutes />
    </div>
  </ToastProvider>
);
