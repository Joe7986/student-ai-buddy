import { MessageFeedback, MessageRole } from "@/backend.d";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useSendMessage,
  useSessionMessages,
  useSetMessageFeedback,
} from "@/hooks/use-chat";
import {
  BookOpen,
  Calculator,
  Clock,
  Globe,
  MessageSquarePlus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Subject = "all" | "math" | "science" | "history" | "programming";

const SUBJECTS: { value: Subject; label: string; icon: React.ReactNode }[] = [
  {
    value: "all",
    label: "All Subjects",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    value: "math",
    label: "Math",
    icon: <Calculator className="w-3.5 h-3.5" />,
  },
  {
    value: "science",
    label: "Science",
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
  {
    value: "history",
    label: "History",
    icon: <Globe className="w-3.5 h-3.5" />,
  },
  {
    value: "programming",
    label: "Programming",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
];

const CONVERSATION_STARTERS = [
  { label: "Explain photosynthesis", subject: "science" },
  { label: "Help me with algebra", subject: "math" },
  { label: "What caused WWI?", subject: "history" },
  { label: "How does recursion work?", subject: "programming" },
];

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2 mb-4"
      data-ocid="chat.loading_state"
    >
      <Avatar className="w-7 h-7 shrink-0">
        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-display font-bold">
          AI
        </AvatarFallback>
      </Avatar>
      <div className="chat-bubble-ai flex items-center gap-1 py-3 px-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-secondary-foreground/60 block"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.16,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  id: bigint;
  content: string;
  role: MessageRole;
  feedback: MessageFeedback;
  timestamp: bigint;
  index: number;
}

function MessageBubble({
  id,
  content,
  role,
  feedback,
  timestamp,
  index,
}: MessageBubbleProps) {
  const { mutate: setFeedback, isPending: feedbackPending } =
    useSetMessageFeedback();
  const isAI = role === MessageRole.ai;

  function handleFeedback(value: MessageFeedback) {
    if (feedbackPending) return;
    const next = feedback === value ? MessageFeedback.none : value;
    setFeedback({ messageId: id, feedback: next });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.04, 0.3 as number),
      }}
      className={`flex items-end gap-2 mb-4 ${isAI ? "flex-row" : "flex-row-reverse"}`}
      data-ocid={`chat.item.${index + 1}`}
    >
      <Avatar className="w-7 h-7 shrink-0">
        <AvatarFallback
          className={
            isAI
              ? "bg-accent text-accent-foreground text-xs font-display font-bold"
              : "bg-primary text-primary-foreground text-xs font-display font-bold"
          }
        >
          {isAI ? "AI" : "Me"}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col ${isAI ? "items-start" : "items-end"} max-w-[75%]`}
      >
        <div className={isAI ? "chat-bubble-ai" : "chat-bubble-user"}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        <div
          className={`flex items-center gap-1.5 mt-1 ${isAI ? "flex-row" : "flex-row-reverse"}`}
        >
          <span className="text-[10px] text-muted-foreground font-body">
            {formatTime(timestamp)}
          </span>

          {isAI && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleFeedback(MessageFeedback.thumbsUp)}
                disabled={feedbackPending}
                aria-label="Thumbs up"
                data-ocid={`chat.feedback_up.${index + 1}`}
                className={`p-1 rounded-md transition-colors duration-150 hover:bg-muted ${
                  feedback === MessageFeedback.thumbsUp
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFeedback(MessageFeedback.thumbsDown)}
                disabled={feedbackPending}
                aria-label="Thumbs down"
                data-ocid={`chat.feedback_down.${index + 1}`}
                className={`p-1 rounded-md transition-colors duration-150 hover:bg-muted ${
                  feedback === MessageFeedback.thumbsDown
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  subject: Subject;
  onStarter: (text: string) => void;
}

function EmptyState({ subject, onStarter }: EmptyStateProps) {
  const starters =
    subject === "all"
      ? CONVERSATION_STARTERS
      : CONVERSATION_STARTERS.filter((s) => s.subject === subject);
  const display = starters.length ? starters : CONVERSATION_STARTERS;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center h-full py-16 gap-6"
      data-ocid="chat.empty_state"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-md">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-xl text-foreground">
          Hey there, let's learn something! 🎉
        </h2>
        <p className="text-muted-foreground text-sm font-body max-w-xs">
          Ask me anything — I'm here to help you understand any topic at your
          own pace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {display.map((s) => (
          <motion.button
            key={s.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStarter(s.label)}
            data-ocid={`chat.starter_${s.subject}`}
            className="text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-smooth text-sm font-body text-foreground shadow-sm"
          >
            <span className="font-medium">💬 </span>
            {s.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Chat Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [subject, setSubject] = useState<Subject>("all");
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isFetching: loadingMessages } =
    useSessionMessages(sessionId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }); // run after every render — intentionally no deps array

  const handleSend = useCallback(() => {
    const content = inputText.trim();
    if (!content || sending) return;
    const fullContent =
      subject !== "all" ? `[${subject.toUpperCase()}] ${content}` : content;
    setInputText("");
    sendMessage({ content: fullContent, sessionId });
  }, [inputText, sending, sendMessage, sessionId, subject]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setSessionId(generateSessionId());
    setInputText("");
    textareaRef.current?.focus();
  };

  const handleStarter = (text: string) => {
    setInputText(text);
    textareaRef.current?.focus();
  };

  const isEmpty = !loadingMessages && messages.length === 0;

  return (
    <Layout>
      {/* Chat header bar */}
      <div
        className="flex items-center gap-2 mb-3 flex-wrap"
        data-ocid="chat.header_section"
      >
        {/* Subject selector */}
        <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
          <SelectTrigger
            className="w-40 h-9 text-xs font-body rounded-xl border-border"
            data-ocid="chat.subject_select"
          >
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                <span className="flex items-center gap-1.5">
                  {s.icon} {s.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subject badge */}
        {subject !== "all" && (
          <Badge variant="secondary" className="text-xs capitalize font-body">
            {subject}
          </Badge>
        )}

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="h-9 gap-1.5 rounded-xl text-xs font-body border-border hover:border-primary/50 hover:bg-primary/5"
            data-ocid="chat.new_conversation_button"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="flex flex-col rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        style={{ height: "calc(100dvh - 220px)", minHeight: "400px" }}
      >
        {/* Messages area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 pb-2">
            {isEmpty ? (
              <EmptyState subject={subject} onStarter={handleStarter} />
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={String(msg.id)}
                      id={msg.id}
                      content={msg.content}
                      role={msg.role}
                      feedback={msg.feedback}
                      timestamp={msg.timestamp}
                      index={i}
                    />
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {sending && <TypingIndicator />}
                </AnimatePresence>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Input area */}
        <div className="p-3 bg-card">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                subject !== "all"
                  ? `Ask about ${subject}... (Enter to send)`
                  : "Ask me anything... (Enter to send)"
              }
              rows={1}
              disabled={sending}
              data-ocid="chat.input"
              className="flex-1 resize-none rounded-xl border-input bg-background text-sm font-body min-h-[42px] max-h-32 py-2.5 px-3 leading-relaxed focus-visible:ring-1 focus-visible:ring-primary transition-smooth"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              size="icon"
              data-ocid="chat.send_button"
              className="h-[42px] w-[42px] rounded-xl bg-primary text-primary-foreground shrink-0 hover:opacity-90 transition-smooth disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-body text-center">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>
    </Layout>
  );
}
