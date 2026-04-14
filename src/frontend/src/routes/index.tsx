import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LandingPage } from "../pages/LandingPage";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

function IndexComponent() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: "/chat" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
          <p className="text-muted-foreground font-body">
            Loading your study session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <LandingPage />;
}
