import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const routeTitles: Record<string, string> = {
  "/chat": "AI Chat",
  "/quiz": "Quizzes",
  "/dashboard": "Dashboard",
  "/history": "History",
  "/profile": "Profile",
};

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useInternetIdentity();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const title = routeTitles[currentPath] ?? "Student AI Buddy";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-display font-bold">
                S
              </span>
            </div>
            <span className="font-display font-bold text-foreground text-lg leading-none">
              {title}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom nav (mobile) / Sidebar nav (desktop) */}
      {isAuthenticated && <BottomNav />}

      {/* Footer */}
      <footer className="bg-muted/20 border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-200 underline underline-offset-2"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
