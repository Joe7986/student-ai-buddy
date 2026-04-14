import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Search,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { useChatSessionHistory } from "../hooks/use-chat";
import { useSessionSummaries } from "../hooks/use-progress";
import { useMyQuizAttempts } from "../hooks/use-quiz";
import type {
  QuizAttempt,
  SessionId,
  SessionSummary,
  MasteryLevel as _MasteryLevel,
} from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Number(ts / 1_000_000n)));
}

function scoreColor(correct: bigint, total: bigint): string {
  if (total === 0n) return "text-muted-foreground";
  const pct = Number(correct) / Number(total);
  if (pct >= 0.8) return "text-chart-3";
  if (pct >= 0.5) return "text-secondary";
  return "text-destructive";
}

// ─── Session Card ────────────────────────────────────────────────────────────

interface SessionCardProps {
  sessionId: SessionId;
  summary: SessionSummary | undefined;
  index: number;
}

function SessionCard({ sessionId, summary, index }: SessionCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const shortId = sessionId.slice(0, 8);
  const topic = summary?.topic ?? `Session ${shortId}`;
  const date = summary ? formatDate(summary.timestamp) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`chat_sessions.item.${index + 1}`}
    >
      <Card className="card-base hover:shadow-elevated transition-smooth">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground truncate">
                  {topic}
                </p>
                {date && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {date}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex-shrink-0 text-xs"
              onClick={() => navigate({ to: "/chat", search: { sessionId } })}
              data-ocid={`chat_sessions.item.${index + 1}.button`}
            >
              Continue
            </Button>
          </div>
        </CardHeader>

        {summary && (
          <CardContent className="pt-0">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mt-1"
              onClick={() => setExpanded((v) => !v)}
              data-ocid={`chat_sessions.item.${index + 1}.toggle`}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {expanded ? "Hide" : "View"} key takeaways (
              {summary.keyTakeaways.length})
            </button>

            {expanded && summary.keyTakeaways.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-1.5"
              >
                {summary.keyTakeaways.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

// ─── Quiz Card ───────────────────────────────────────────────────────────────

interface QuizGroupCardProps {
  sessionId: SessionId;
  attempts: QuizAttempt[];
  index: number;
}

function QuizGroupCard({ sessionId, attempts, index }: QuizGroupCardProps) {
  const correct = attempts.filter((a) => a.isCorrect).length;
  const total = attempts.length;
  const shortId = sessionId.slice(0, 8);
  const date = attempts[0] ? formatDate(attempts[0].timestamp) : null;
  const quizId = attempts[0]?.quizId ?? "—";
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`quiz_history.item.${index + 1}`}
    >
      <Card className="card-base hover:shadow-elevated transition-smooth">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground truncate">
                  Quiz · {quizId.slice(0, 12)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Session {shortId}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p
                className={`font-display font-bold text-xl ${scoreColor(BigInt(correct), BigInt(total))}`}
              >
                {pct}%
              </p>
              <p className="text-xs text-muted-foreground">
                {correct}/{total} correct
              </p>
            </div>
          </div>
          {date && (
            <div className="flex items-center gap-1.5 mt-1 ml-14">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
          )}
        </CardHeader>
      </Card>
    </motion.div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  cta,
  ocid,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: React.ReactNode;
  ocid: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      data-ocid={ocid}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
          {description}
        </p>
      </div>
      {cta}
    </div>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function SessionSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-base p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HistoryPage ─────────────────────────────────────────────────────────────

export function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  const { data: sessionIds = [], isLoading: loadingSessions } =
    useChatSessionHistory();
  const { data: summaries = [], isLoading: loadingSummaries } =
    useSessionSummaries();
  const { data: quizAttempts = [], isLoading: loadingQuizzes } =
    useMyQuizAttempts();

  // Map summaries by sessionId for quick lookup
  const summaryMap = useMemo(() => {
    const m = new Map<SessionId, SessionSummary>();
    for (const s of summaries) m.set(s.sessionId, s);
    return m;
  }, [summaries]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessionIds;
    const q = search.toLowerCase();
    return sessionIds.filter((id) => {
      const s = summaryMap.get(id);
      return (
        id.toLowerCase().includes(q) || s?.topic?.toLowerCase().includes(q)
      );
    });
  }, [sessionIds, summaryMap, search]);

  // Group quiz attempts by sessionId, filter by search
  const quizGroups = useMemo(() => {
    const groups = new Map<SessionId, QuizAttempt[]>();
    for (const a of quizAttempts) {
      const list = groups.get(a.sessionId) ?? [];
      list.push(a);
      groups.set(a.sessionId, list);
    }
    const entries = Array.from(groups.entries());
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      ([sid, attempts]) =>
        sid.toLowerCase().includes(q) ||
        attempts[0]?.quizId.toLowerCase().includes(q),
    );
  }, [quizAttempts, search]);

  if (isInitializing) {
    return (
      <Layout>
        <SessionSkeletons />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <EmptyState
          icon={<BookOpen className="w-7 h-7 text-muted-foreground" />}
          title="Log in to see your history"
          description="Your chat sessions and quiz results will appear here once you're logged in."
          ocid="history.not_authenticated"
          cta={
            <Button
              onClick={() => navigate({ to: "/" })}
              data-ocid="history.login_button"
            >
              Go to login
            </Button>
          }
        />
      </Layout>
    );
  }

  const isLoading = loadingSessions || loadingSummaries || loadingQuizzes;

  return (
    <Layout>
      <div className="space-y-5">
        {/* Search */}
        <div className="relative" data-ocid="history.search_input">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by topic or date…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="chats" data-ocid="history.chats_tab">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Sessions
              {sessionIds.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                  {sessionIds.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quizzes" data-ocid="history.quizzes_tab">
              <Trophy className="w-4 h-4 mr-2" />
              Quiz History
              {quizGroups.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                  {quizGroups.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chat Sessions */}
          <TabsContent value="chats" className="mt-4">
            {isLoading ? (
              <SessionSkeletons />
            ) : filteredSessions.length === 0 ? (
              <EmptyState
                icon={
                  <MessageSquare className="w-7 h-7 text-muted-foreground" />
                }
                title={
                  search
                    ? "No sessions match your search"
                    : "No chat sessions yet"
                }
                description={
                  search
                    ? "Try a different search term."
                    : "Start a conversation with your AI buddy and it'll show up here. You've got this! 🚀"
                }
                ocid="history.chats_empty_state"
                cta={
                  !search && (
                    <Button
                      onClick={() => navigate({ to: "/chat" })}
                      data-ocid="history.start_chat_button"
                    >
                      Start a Chat
                    </Button>
                  )
                }
              />
            ) : (
              <div className="space-y-3" data-ocid="history.chats_list">
                {filteredSessions.map((sessionId, i) => (
                  <SessionCard
                    key={sessionId}
                    sessionId={sessionId}
                    summary={summaryMap.get(sessionId)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quiz History */}
          <TabsContent value="quizzes" className="mt-4">
            {isLoading ? (
              <SessionSkeletons />
            ) : quizGroups.length === 0 ? (
              <EmptyState
                icon={<Trophy className="w-7 h-7 text-muted-foreground" />}
                title={
                  search
                    ? "No quizzes match your search"
                    : "No quizzes taken yet"
                }
                description={
                  search
                    ? "Try a different search term."
                    : "Challenge yourself with a quiz! Every attempt helps you grow. 💡"
                }
                ocid="history.quizzes_empty_state"
                cta={
                  !search && (
                    <Button
                      onClick={() => navigate({ to: "/quiz" })}
                      data-ocid="history.start_quiz_button"
                    >
                      Take a Quiz
                    </Button>
                  )
                }
              />
            ) : (
              <div className="space-y-3" data-ocid="history.quizzes_list">
                {quizGroups.map(([sessionId, attempts], i) => (
                  <QuizGroupCard
                    key={sessionId}
                    sessionId={sessionId}
                    attempts={attempts}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
