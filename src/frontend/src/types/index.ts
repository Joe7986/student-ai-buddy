import type {
  ChatMessage,
  DifficultyLevel,
  GradeLevel,
  MasteryLevel,
  MessageFeedback,
  MessageRole,
  QuestionType,
  QuizAttempt,
  QuizAttemptInput,
  QuizId,
  QuizQuestion,
  QuizQuestionInput,
  QuizSessionResult,
  SendMessageInput,
  SessionId,
  SessionSummary,
  SessionSummaryInput,
  StudentProfileInput,
  StudentProfilePublic,
  SuggestedTopic,
  Timestamp,
  Topic,
  TopicFact,
  TopicFactInput,
  TopicId,
  TopicInput,
  TopicProgress,
  UserId,
} from "../backend.d.ts";

// Re-export all backend types for use throughout the app
export type {
  ChatMessage,
  DifficultyLevel,
  GradeLevel,
  MasteryLevel,
  MessageFeedback,
  MessageRole,
  QuestionType,
  QuizAttempt,
  QuizAttemptInput,
  QuizId,
  QuizQuestion,
  QuizQuestionInput,
  QuizSessionResult,
  SendMessageInput,
  SessionId,
  SessionSummary,
  SessionSummaryInput,
  StudentProfileInput,
  StudentProfilePublic,
  SuggestedTopic,
  Timestamp,
  Topic,
  TopicFact,
  TopicFactInput,
  TopicId,
  TopicInput,
  TopicProgress,
  UserId,
};

// Nav route types
export type NavRoute =
  | "/chat"
  | "/quiz"
  | "/dashboard"
  | "/history"
  | "/profile";

export interface NavItem {
  path: NavRoute;
  label: string;
  icon: string;
}
