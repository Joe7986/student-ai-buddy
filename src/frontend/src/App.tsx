import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";
import {
  chatRoute,
  dashboardRoute,
  historyRoute,
  profileRoute,
  quizRoute,
} from "./routes/protected";

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  quizRoute,
  dashboardRoute,
  historyRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
