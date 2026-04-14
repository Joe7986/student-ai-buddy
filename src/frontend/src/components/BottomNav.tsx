import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  History,
  MessageCircle,
  User,
} from "lucide-react";
import type { NavRoute } from "../types";

interface NavItem {
  path: NavRoute;
  label: string;
  Icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/chat", label: "Chat", Icon: MessageCircle },
  { path: "/quiz", label: "Quiz", Icon: BookOpen },
  { path: "/dashboard", label: "Dashboard", Icon: BarChart2 },
  { path: "/history", label: "History", Icon: History },
  { path: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around h-16">
        {NAV_ITEMS.map(({ path, label, Icon }, idx) => {
          const isActive = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              data-ocid={`bottom-nav.item.${idx + 1}`}
              className={[
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-smooth",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={20}
                className={isActive ? "drop-shadow-sm" : ""}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-body font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
