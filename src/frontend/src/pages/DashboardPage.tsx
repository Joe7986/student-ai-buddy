import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { MasteryLevel } from "../backend";
import { Layout } from "../components/Layout";
import { useProfile } from "../hooks/use-profile";
import { useAllProgress } from "../hooks/use-progress";
import { useSuggestedTopics, useTopics } from "../hooks/use-topics";
import type { SuggestedTopic, Topic, TopicProgress } from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const motivationalMessages = [
  "Every question you answer makes you smarter! 🚀",
  "You're doing amazing — keep up the momentum! ⭐",
  "Learning is a superpower. You've got this! 💪",
  "Great things happen when you study every day! 🌟",
  "Your brain is leveling up with every session! 🧠",
];

function getMotivationalMessage(name: string): string {
  const idx = name.charCodeAt(0) % motivationalMessages.length;
  return motivationalMessages[idx];
}

function getMasteryColor(level: MasteryLevel) {
  switch (level) {
    case MasteryLevel.mastered:
      return {
        bg: "bg-chart-2/10",
        border: "border-chart-2/30",
        badge: "bg-chart-2/20 text-foreground",
        bar: "bg-chart-2",
        text: "text-chart-2",
      };
    case MasteryLevel.inProgress:
      return {
        bg: "bg-secondary/10",
        border: "border-secondary/30",
        badge: "bg-secondary/20 text-secondary-foreground",
        bar: "bg-secondary",
        text: "text-secondary-foreground",
      };
    default:
      return {
        bg: "bg-destructive/10",
        border: "border-destructive/30",
        badge: "bg-destructive/20 text-destructive-foreground",
        bar: "bg-destructive",
        text: "text-destructive",
      };
  }
}

function getMasteryLabel(level: MasteryLevel): string {
  switch (level) {
    case MasteryLevel.mastered:
      return "Mastered";
    case MasteryLevel.inProgress:
      return "In Progress";
    default:
      return "Needs Work";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  colorClass: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="card-base h-full">
        <CardContent className="p-4 flex flex-col gap-2">
          <div
            className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground leading-none">
            {value}
          </p>
          <p className="text-xs text-muted-foreground font-body">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopicProgressCard({
  progress,
  topic,
  index,
}: {
  progress: TopicProgress;
  topic: Topic | undefined;
  index: number;
}) {
  const colors = getMasteryColor(progress.masteryLevel);
  const accuracy = Number(progress.accuracyPercent);
  const label = getMasteryLabel(progress.masteryLevel);
  const name = topic?.name ?? progress.topicId;
  const subject = topic?.subject ?? "General";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`topic_progress.item.${index + 1}`}
    >
      <div
        className={`rounded-xl border p-4 ${colors.bg} ${colors.border} transition-smooth`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="font-display font-semibold text-foreground text-sm truncate">
              {name}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {subject}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}
          >
            {label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Accuracy</span>
            <span className={`text-xs font-bold ${colors.text}`}>
              {accuracy}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(accuracy, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MasterySection({
  title,
  icon: Icon,
  progressItems,
  topicsMap,
  colorClass,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  progressItems: TopicProgress[];
  topicsMap: Map<string, Topic>;
  colorClass: string;
}) {
  if (progressItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-display font-semibold text-foreground text-sm">
          {title}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {progressItems.length}
        </Badge>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {progressItems.map((p, i) => (
          <TopicProgressCard
            key={p.topicId}
            progress={p}
            topic={topicsMap.get(p.topicId)}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

function SuggestedTopicCard({
  suggestion,
  topicsMap,
  index,
  onSelect,
}: {
  suggestion: SuggestedTopic;
  topicsMap: Map<string, Topic>;
  index: number;
  onSelect: (topicId: string) => void;
}) {
  const topic = topicsMap.get(suggestion.topicId);
  const subject = topic?.subject ?? "General";

  const subjectEmojis: Record<string, string> = {
    Math: "➕",
    Science: "🔬",
    History: "📜",
    English: "📝",
    Programming: "💻",
    Biology: "🌿",
    Chemistry: "⚗️",
    Physics: "⚡",
    Geography: "🌍",
  };
  const emoji = subjectEmojis[subject] ?? "📚";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`suggested_topics.item.${index + 1}`}
    >
      <Card
        className="card-base group cursor-pointer hover:border-primary/40 transition-smooth"
        onClick={() => onSelect(suggestion.topicId)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-smooth">
            <span className="text-xl">{emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-foreground text-sm truncate">
              {suggestion.topicName}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">
              {suggestion.reason}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-smooth" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6" data-ocid="dashboard.loading_state">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-5 w-36" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-64 gap-5 py-10"
      data-ocid="dashboard.empty_state"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <div className="text-center space-y-1.5 max-w-xs">
        <h2 className="font-display font-bold text-xl text-foreground">
          Your journey starts here!
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Complete your first quiz to unlock your personalized dashboard with
          progress tracking and AI-powered recommendations.
        </p>
      </div>
      <Button
        onClick={() => navigate({ to: "/quiz" })}
        className="gap-2"
        data-ocid="dashboard.start_quiz_button"
      >
        <Zap className="w-4 h-4" />
        Start your first quiz
      </Button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: allProgress = [], isLoading: progressLoading } =
    useAllProgress();
  const { data: suggestedTopics = [], isLoading: suggestionsLoading } =
    useSuggestedTopics();
  const { data: topics = [], isLoading: topicsLoading } = useTopics();

  const isLoading =
    isInitializing || progressLoading || topicsLoading || suggestionsLoading;

  const topicsMap = new Map<string, Topic>(topics.map((t) => [t.id, t]));

  const studentName = profile?.name ?? "Learner";
  const motivational = getMotivationalMessage(studentName);

  // Compute stats
  const totalSessions = allProgress.reduce(
    (sum, p) => sum + Number(p.totalAttempts),
    0,
  );
  const uniqueTopicsStudied = allProgress.length;
  const overallAccuracy =
    allProgress.length > 0
      ? Math.round(
          allProgress.reduce((sum, p) => sum + Number(p.accuracyPercent), 0) /
            allProgress.length,
        )
      : 0;

  // Mastery groups
  const mastered = allProgress.filter(
    (p) => p.masteryLevel === MasteryLevel.mastered,
  );
  const inProgress = allProgress.filter(
    (p) => p.masteryLevel === MasteryLevel.inProgress,
  );
  const needsWork = allProgress.filter(
    (p) => p.masteryLevel === MasteryLevel.needsWork,
  );

  const hasProgress = allProgress.length > 0;

  const handleSuggestedTopicClick = (topicId: string) => {
    // Store pre-selected topicId so QuizPage can pick it up
    sessionStorage.setItem("preselectedTopicId", topicId);
    navigate({ to: "/quiz" });
  };

  if (!isAuthenticated && !isInitializing) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-64 gap-4">
          <p className="text-muted-foreground font-body">
            Please log in to view your dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-4" data-ocid="dashboard.page">
        {/* Welcome header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          data-ocid="dashboard.welcome_section"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0 shadow-sm">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-2xl text-foreground leading-tight">
                Hey, {studentName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground font-body mt-0.5">
                {motivational}
              </p>
            </div>
          </div>
        </motion.section>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats row */}
            <section data-ocid="dashboard.stats_section">
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={BookOpen}
                  label="Total Sessions"
                  value={totalSessions}
                  colorClass="bg-primary/10 text-primary"
                  index={0}
                />
                <StatCard
                  icon={Target}
                  label="Topics Studied"
                  value={uniqueTopicsStudied}
                  colorClass="bg-secondary/30 text-secondary-foreground"
                  index={1}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Accuracy"
                  value={`${overallAccuracy}%`}
                  colorClass="bg-accent/20 text-accent-foreground"
                  index={2}
                />
              </div>
            </section>

            {/* Topic mastery or empty state */}
            {!hasProgress ? (
              <EmptyState />
            ) : (
              <>
                {/* Topic Mastery */}
                <section
                  className="space-y-5"
                  data-ocid="dashboard.mastery_section"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <h2 className="font-display font-bold text-lg text-foreground">
                      Topic Mastery
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <MasterySection
                      title="Mastered"
                      icon={CheckCircle2}
                      progressItems={mastered}
                      topicsMap={topicsMap}
                      colorClass="bg-chart-2/15 text-chart-2"
                    />
                    <MasterySection
                      title="In Progress"
                      icon={TrendingUp}
                      progressItems={inProgress}
                      topicsMap={topicsMap}
                      colorClass="bg-secondary/15 text-secondary-foreground"
                    />
                    <MasterySection
                      title="Needs Work"
                      icon={Target}
                      progressItems={needsWork}
                      topicsMap={topicsMap}
                      colorClass="bg-destructive/15 text-destructive"
                    />
                  </div>
                </section>

                {/* Suggested Topics */}
                {suggestedTopics.length > 0 && (
                  <section
                    className="space-y-4"
                    data-ocid="dashboard.suggested_section"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-secondary" />
                      <h2 className="font-display font-bold text-lg text-foreground">
                        Suggested for You
                      </h2>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-secondary/20 text-secondary-foreground"
                      >
                        AI Picks
                      </Badge>
                    </div>
                    <div className="space-y-2.5">
                      {suggestedTopics.slice(0, 3).map((s, i) => (
                        <SuggestedTopicCard
                          key={s.topicId}
                          suggestion={s}
                          topicsMap={topicsMap}
                          index={i}
                          onSelect={handleSuggestedTopicClick}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
