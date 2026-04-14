import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { BookOpen, Brain, Sparkles, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";

const FEATURES = [
  {
    icon: Brain,
    title: "Smart AI Conversations",
    description:
      "Ask anything — your AI buddy explains complex topics in a way that actually makes sense for you.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Personalized Quizzes",
    description:
      "Test your knowledge with quizzes tailored to your grade level and the subjects you care about.",
    color: "text-secondary-foreground",
    bg: "bg-secondary/20",
  },
  {
    icon: Trophy,
    title: "Track Your Progress",
    description:
      "Watch yourself grow! See your mastery level improve as you keep studying and practicing.",
    color: "text-accent-foreground",
    bg: "bg-accent/15",
  },
];

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Landing header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-display font-bold">
                S
              </span>
            </div>
            <span className="font-display font-bold text-foreground text-lg">
              Student AI Buddy
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          {/* Left: Text content */}
          <motion.div
            className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <Badge
              className="bg-secondary/30 text-secondary-foreground border-secondary/40 font-body font-medium px-3 py-1 rounded-full"
              data-ocid="landing.hero-badge"
            >
              <Sparkles size={13} className="mr-1.5 inline" />
              Your personal study companion
            </Badge>

            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Study smarter, <span className="text-primary">not harder</span> —
              with your AI buddy
            </h1>

            <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-lg">
              Get personalized help, ace your quizzes, and track how much you've
              grown. Learning has never felt this encouraging!
            </p>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="landing.login_button"
                className="rounded-xl px-8 py-3 text-base font-display font-semibold shadow-md hover:shadow-lg transition-smooth w-full sm:w-auto"
              >
                {isLoggingIn ? "Connecting..." : "Start Learning Now"}
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground font-body">
              Secure login with Internet Identity — no passwords needed
            </p>
          </motion.div>

          {/* Right: Hero illustration */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl scale-110" />
              <img
                src="/assets/generated/hero-ai-buddy.dim_800x600.png"
                alt="Friendly AI study buddy illustration"
                className="relative w-full rounded-2xl shadow-xl object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-t border-border py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">
              Three powerful tools in one place, designed to help you learn at
              your own pace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(
              ({ icon: Icon, title, description, color, bg }, i) => (
                <motion.div
                  key={title}
                  className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-smooth"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  data-ocid={`landing.feature.${i + 1}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <Icon className={color} size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                      {title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-16 px-4 border-t border-border">
        <motion.div
          className="max-w-xl mx-auto text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
            Ready to become a better student?
          </h2>
          <p className="text-muted-foreground font-body">
            Join thousands of students who are already learning smarter. It's
            free, it's fun, and it's built just for you.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="landing.cta_button"
              className="rounded-xl px-8 py-3 text-base font-display font-semibold shadow-md hover:shadow-lg transition-smooth"
            >
              {isLoggingIn ? "Connecting..." : "Get Started — It's Free"}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 border-t border-border py-4 text-center">
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
