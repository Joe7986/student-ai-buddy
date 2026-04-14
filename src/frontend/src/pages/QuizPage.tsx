import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RefreshCcw,
  Sparkles,
  Star,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { QuestionType } from "../backend";
import { Layout } from "../components/Layout";
import { useRecordTopicAttempt } from "../hooks/use-progress";
import { useQuizQuestions, useSubmitQuizAnswer } from "../hooks/use-quiz";
import { useTopics } from "../hooks/use-topics";
import type { DifficultyLevel, QuizQuestion, Topic } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function difficultyColor(level: DifficultyLevel) {
  const map: Record<string, string> = {
    beginner: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    intermediate: "bg-primary/15 text-primary border-primary/30",
    advanced: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[level as string] ?? "bg-muted text-muted-foreground border-border";
}

function difficultyLabel(level: DifficultyLevel) {
  const map: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };
  return map[level as string] ?? String(level);
}

function subjectColor(subject: string) {
  const palette = [
    "bg-chart-1/15 text-chart-1 border-chart-1/30",
    "bg-chart-2/15 text-chart-2 border-chart-2/30",
    "bg-chart-3/15 text-chart-3 border-chart-3/30",
    "bg-chart-4/15 text-chart-4 border-chart-4/30",
    "bg-chart-5/15 text-chart-5 border-chart-5/30",
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash += subject.charCodeAt(i);
  return palette[hash % palette.length];
}

function encouragingMessage(correctCount: number, total: number) {
  const pct = total > 0 ? (correctCount / total) * 100 : 0;
  if (pct >= 80) return { text: "Amazing work! 🌟", color: "text-chart-3" };
  if (pct >= 60) return { text: "Great effort! 💪", color: "text-chart-2" };
  return { text: "Keep practicing! 🔥", color: "text-primary" };
}

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── TopicGrid ───────────────────────────────────────────────────────────────

interface TopicGridProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}

function TopicGrid({ topics, onSelect }: TopicGridProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display font-bold text-2xl text-foreground">
          Choose a Topic
        </h2>
        <p className="text-muted-foreground text-sm font-body">
          Pick something you want to practice today 📚
        </p>
      </div>

      {topics.length === 0 ? (
        <div
          data-ocid="quiz.empty_state"
          className="text-center py-16 space-y-3"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground font-body">
            No topics available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <button
                type="button"
                data-ocid={`quiz.topic.item.${i + 1}`}
                onClick={() => onSelect(topic)}
                className="w-full text-left card-base p-4 hover:shadow-elevated hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-display font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors duration-200">
                    {topic.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors duration-200" />
                </div>
                <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-3">
                  {topic.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${subjectColor(topic.subject)}`}
                  >
                    {topic.subject}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColor(topic.difficulty)}`}
                  >
                    {difficultyLabel(topic.difficulty)}
                  </span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QuizRunner ──────────────────────────────────────────────────────────────

interface AnswerState {
  selected: string | null;
  isCorrect: boolean | null;
  explanation: string;
  submitted: boolean;
}

interface QuizRunnerProps {
  topic: Topic;
  questions: QuizQuestion[];
  onComplete: (sessionId: string, correct: number) => void;
}

function QuizRunner({ topic, questions, onComplete }: QuizRunnerProps) {
  const [sessionId] = useState(generateSessionId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shortAnswer, setShortAnswer] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>({
    selected: null,
    isCorrect: null,
    explanation: "",
    submitted: false,
  });
  const [correctCount, setCorrectCount] = useState(0);

  const submitAnswer = useSubmitQuizAnswer();
  const question = questions[currentIndex];
  const total = questions.length;
  const progress = (currentIndex / total) * 100;

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (answerState.submitted || !question) return;
      try {
        const attempt = await submitAnswer.mutateAsync({
          studentAnswer: answer,
          questionId: question.id,
          sessionId,
          quizId: question.quizId,
        });
        const correct = attempt.isCorrect;
        if (correct) setCorrectCount((c) => c + 1);
        setAnswerState({
          selected: answer,
          isCorrect: correct,
          explanation: question.explanation,
          submitted: true,
        });
      } catch {
        // optimistic fallback
        const correct =
          answer.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase();
        if (correct) setCorrectCount((c) => c + 1);
        setAnswerState({
          selected: answer,
          isCorrect: correct,
          explanation: question.explanation,
          submitted: true,
        });
      }
    },
    [answerState.submitted, question, submitAnswer, sessionId],
  );

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      onComplete(sessionId, correctCount);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setAnswerState({
      selected: null,
      isCorrect: null,
      explanation: "",
      submitted: false,
    });
    setShortAnswer("");
  };

  if (!question) return null;

  const isMultipleChoice =
    question.questionType === QuestionType.multipleChoice;

  return (
    <div className="space-y-5">
      {/* Header + progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
          <span>{topic.name}</span>
          <span
            data-ocid="quiz.progress_indicator"
            className="font-medium text-foreground"
          >
            Question {currentIndex + 1}/{total}
          </span>
        </div>
        <div
          data-ocid="quiz.progress_bar"
          className="h-2.5 bg-muted rounded-full overflow-hidden"
          aria-label={`Question ${currentIndex + 1} of ${total}`}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress + (1 / total) * 0}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="bg-card border-border shadow-card">
            <CardContent className="p-5 space-y-5">
              <p
                data-ocid="quiz.question_text"
                className="font-display font-semibold text-lg text-foreground leading-snug"
              >
                {question.questionText}
              </p>

              {/* Multiple choice */}
              {isMultipleChoice && (
                <div className="space-y-2.5">
                  {question.choices.map((choice, ci) => {
                    const isSelected = answerState.selected === choice;
                    const isCorrectChoice = choice === question.correctAnswer;
                    let choiceStyle =
                      "border border-border bg-background hover:bg-muted/50 text-foreground";
                    if (answerState.submitted) {
                      if (isCorrectChoice)
                        choiceStyle =
                          "border-2 border-chart-3 bg-chart-3/10 text-foreground";
                      else if (isSelected && !isCorrectChoice)
                        choiceStyle =
                          "border-2 border-destructive bg-destructive/10 text-foreground";
                      else
                        choiceStyle =
                          "border border-border bg-muted/30 text-muted-foreground";
                    }
                    return (
                      <button
                        type="button"
                        key={choice}
                        data-ocid={`quiz.choice.${ci + 1}`}
                        disabled={answerState.submitted}
                        onClick={() => handleSubmit(choice)}
                        className={`w-full text-left rounded-xl px-4 py-3.5 font-body text-sm transition-smooth flex items-center gap-3 ${choiceStyle} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default`}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                          {String.fromCharCode(65 + ci)}
                        </span>
                        <span className="flex-1 min-w-0">{choice}</span>
                        {answerState.submitted && isCorrectChoice && (
                          <CheckCircle2 className="w-5 h-5 text-chart-3 shrink-0" />
                        )}
                        {answerState.submitted &&
                          isSelected &&
                          !isCorrectChoice && (
                            <XCircle className="w-5 h-5 text-destructive shrink-0" />
                          )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short answer */}
              {!isMultipleChoice && (
                <div className="space-y-3">
                  <Input
                    data-ocid="quiz.short_answer_input"
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !answerState.submitted &&
                        shortAnswer.trim()
                      )
                        handleSubmit(shortAnswer.trim());
                    }}
                    placeholder="Type your answer here…"
                    disabled={answerState.submitted || submitAnswer.isPending}
                    className="text-base py-3"
                  />
                  {!answerState.submitted && (
                    <Button
                      data-ocid="quiz.submit_button"
                      onClick={() => handleSubmit(shortAnswer.trim())}
                      disabled={!shortAnswer.trim() || submitAnswer.isPending}
                      className="w-full"
                    >
                      {submitAnswer.isPending ? "Checking…" : "Submit Answer"}
                    </Button>
                  )}
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {answerState.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    data-ocid={
                      answerState.isCorrect
                        ? "quiz.correct_feedback"
                        : "quiz.incorrect_feedback"
                    }
                    className={`rounded-xl p-4 flex gap-3 ${
                      answerState.isCorrect
                        ? "bg-chart-3/10 border border-chart-3/30"
                        : "bg-destructive/10 border border-destructive/30"
                    }`}
                  >
                    {answerState.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {answerState.isCorrect
                          ? "Correct! 🎉"
                          : `Not quite — the answer was: ${question.correctAnswer}`}
                      </p>
                      {answerState.explanation && (
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                          {answerState.explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {answerState.submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button
                    data-ocid="quiz.next_button"
                    onClick={handleNext}
                    className="w-full gap-2"
                  >
                    {currentIndex + 1 >= total ? (
                      <>
                        <Trophy className="w-4 h-4" /> See Results
                      </>
                    ) : (
                      <>
                        Next Question <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── ResultsScreen ───────────────────────────────────────────────────────────

interface ResultsScreenProps {
  topic: Topic;
  correctCount: number;
  total: number;
  onTryAgain: () => void;
  onNewTopic: () => void;
}

function ResultsScreen({
  topic,
  correctCount,
  total,
  onTryAgain,
  onNewTopic,
}: ResultsScreenProps) {
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const msg = encouragingMessage(correctCount, total);
  const celebrate = pct >= 80;

  return (
    <motion.div
      data-ocid="quiz.results_screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 text-center"
    >
      {/* Trophy / icon */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            celebrate ? "bg-chart-3/20" : "bg-primary/15"
          }`}
        >
          {celebrate ? (
            <Sparkles className="w-10 h-10 text-chart-3" />
          ) : (
            <Zap className="w-10 h-10 text-primary" />
          )}
        </motion.div>

        {celebrate && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3 + i * 0.1,
                  type: "spring",
                  stiffness: 260,
                }}
              >
                <Star className="w-5 h-5 text-chart-2 fill-chart-2" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="space-y-1">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-ocid="quiz.score_display"
          className="font-display font-bold text-5xl text-foreground"
        >
          {correctCount}
          <span className="text-muted-foreground text-3xl">/{total}</span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-muted-foreground font-body text-sm"
        >
          {pct}% accuracy on{" "}
          <span className="font-medium text-foreground">{topic.name}</span>
        </motion.p>
      </div>

      {/* Encouraging message */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        data-ocid="quiz.encouraging_message"
        className={`font-display font-semibold text-xl ${msg.color}`}
      >
        {msg.text}
      </motion.p>

      {/* Score bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-muted rounded-full h-3 overflow-hidden mx-auto max-w-xs"
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 pt-2"
      >
        <Button
          data-ocid="quiz.try_again_button"
          variant="outline"
          onClick={onTryAgain}
          className="flex-1 gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </Button>
        <Button
          data-ocid="quiz.new_topic_button"
          onClick={onNewTopic}
          className="flex-1 gap-2"
        >
          <BookOpen className="w-4 h-4" /> New Topic
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── QuizPage (main) ─────────────────────────────────────────────────────────

type QuizStage = "topic_select" | "loading_questions" | "in_quiz" | "results";

export default function QuizPage() {
  const [stage, setStage] = useState<QuizStage>("topic_select");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const { data: questions = [], isLoading: questionsLoading } =
    useQuizQuestions(selectedTopic?.id ?? null);
  const recordAttempt = useRecordTopicAttempt();

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setStage("loading_questions");
  };

  // Transition to quiz once questions load
  if (
    stage === "loading_questions" &&
    !questionsLoading &&
    questions.length > 0
  ) {
    setStage("in_quiz");
  }

  const handleQuizComplete = async (_sid: string, correct: number) => {
    setCorrectCount(correct);
    setStage("results");

    if (selectedTopic) {
      const isGoodScore =
        questions.length > 0 ? correct / questions.length >= 0.6 : false;
      await recordAttempt.mutateAsync({
        topicId: selectedTopic.id,
        isCorrect: isGoodScore,
      });
    }
  };

  const handleTryAgain = () => {
    setStage("in_quiz");
    setCorrectCount(0);
  };

  const handleNewTopic = () => {
    setSelectedTopic(null);
    setCorrectCount(0);
    setStage("topic_select");
  };

  return (
    <Layout>
      <div data-ocid="quiz.page" className="max-w-xl mx-auto space-y-4">
        {/* Topic selection */}
        {stage === "topic_select" && (
          <div>
            {topicsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <TopicGrid topics={topics} onSelect={handleTopicSelect} />
            )}
          </div>
        )}

        {/* Loading questions */}
        {stage === "loading_questions" && (
          <div
            data-ocid="quiz.loading_state"
            className="flex flex-col items-center gap-4 py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary"
            />
            <p className="text-muted-foreground font-body text-sm">
              Loading your questions…
            </p>
          </div>
        )}

        {/* In-quiz */}
        {stage === "in_quiz" && selectedTopic && questions.length > 0 && (
          <QuizRunner
            topic={selectedTopic}
            questions={questions.slice(0, 5)}
            onComplete={handleQuizComplete}
          />
        )}

        {/* No questions fallback */}
        {stage === "in_quiz" && questions.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground font-body">
              No questions found for this topic yet.
            </p>
            <Button
              data-ocid="quiz.back_button"
              variant="outline"
              onClick={handleNewTopic}
            >
              ← Back to Topics
            </Button>
          </div>
        )}

        {/* Results */}
        {stage === "results" && selectedTopic && (
          <ResultsScreen
            topic={selectedTopic}
            correctCount={correctCount}
            total={Math.min(questions.length, 5)}
            onTryAgain={handleTryAgain}
            onNewTopic={handleNewTopic}
          />
        )}
      </div>
    </Layout>
  );
}
