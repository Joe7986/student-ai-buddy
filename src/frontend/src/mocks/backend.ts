import type { backendInterface } from "../backend";
import {
  DifficultyLevel,
  GradeLevel,
  MasteryLevel,
  MessageFeedback,
  MessageRole,
  QuestionType,
} from "../backend";

const mockUserId = { toText: () => "aaaaa-bbbbb", _principal: true } as any;
const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleProfile = {
  userId: mockUserId,
  name: "Alex Johnson",
  createdAt: now,
  updatedAt: now,
  gradeLevel: GradeLevel.highSchool,
  preferredSubjects: ["Math", "Science"],
};

const sampleTopics = [
  {
    id: "math-arithmetic",
    subject: "Math",
    prerequisites: [],
    difficulty: DifficultyLevel.beginner,
    name: "Basic Arithmetic",
    createdAt: now,
    description: "Addition, subtraction, multiplication, and division — the building blocks of math!",
    facts: [
      { id: BigInt(1), factText: "The order of operations (PEMDAS/BODMAS): Parentheses, Exponents, Multiply/Divide, Add/Subtract.", tags: ["operations", "order"], topicId: "math-arithmetic" },
    ],
  },
  {
    id: "sci-cells",
    subject: "Science",
    prerequisites: ["sci-scientific-method"],
    difficulty: DifficultyLevel.beginner,
    name: "Cells: The Building Blocks of Life",
    createdAt: now,
    description: "Cell structure, organelles, and the difference between plant and animal cells.",
    facts: [
      { id: BigInt(2), factText: "The nucleus is the control center of the cell, containing DNA.", tags: ["nucleus", "DNA"], topicId: "sci-cells" },
    ],
  },
];

const sampleMessages: Array<import("../backend").ChatMessage> = [
  {
    id: BigInt(1),
    content: "Hi! I'm your AI Study Buddy 🎓 What would you like to learn today?",
    userId: mockUserId,
    role: MessageRole.ai,
    feedback: MessageFeedback.none,
    timestamp: now - BigInt(60_000_000_000),
    sessionId: "session-1",
  },
  {
    id: BigInt(2),
    content: "Can you help me understand Newton's Laws of Motion?",
    userId: mockUserId,
    role: MessageRole.student,
    feedback: MessageFeedback.none,
    timestamp: now - BigInt(30_000_000_000),
    sessionId: "session-1",
  },
  {
    id: BigInt(3),
    content: "Absolutely! 🚀 Newton's Three Laws of Motion are fundamental to physics.\n\n**1st Law (Inertia):** An object at rest stays at rest unless acted on by a force.\n\n**2nd Law:** Force = Mass × Acceleration (F = ma)\n\n**3rd Law:** For every action, there is an equal and opposite reaction!\n\nWould you like to dive deeper into any of these?",
    userId: mockUserId,
    role: MessageRole.ai,
    feedback: MessageFeedback.thumbsUp,
    timestamp: now,
    sessionId: "session-1",
  },
];

const sampleProgress = [
  { userId: mockUserId, masteryLevel: MasteryLevel.inProgress, lastUpdated: now, totalAttempts: BigInt(5), correctCount: BigInt(4), accuracyPercent: BigInt(80), topicId: "math-arithmetic" },
  { userId: mockUserId, masteryLevel: MasteryLevel.mastered, lastUpdated: now, totalAttempts: BigInt(8), correctCount: BigInt(8), accuracyPercent: BigInt(100), topicId: "sci-cells" },
  { userId: mockUserId, masteryLevel: MasteryLevel.needsWork, lastUpdated: now, totalAttempts: BigInt(3), correctCount: BigInt(1), accuracyPercent: BigInt(33), topicId: "prog-loops" },
];

const sampleSuggestedTopics = [
  { topicId: "sci-cells", topicName: "Cells: The Building Blocks of Life", reason: "Great match for your Science interest!" },
  { topicId: "math-algebra", topicName: "Introduction to Algebra", reason: "Next step after Basic Arithmetic!" },
];

const sampleQuizQuestion = {
  id: BigInt(1),
  explanation: "7 × 8 = 56. You can think of it as 7 × 4 = 28, then 28 × 2 = 56! 🎯",
  correctAnswer: "56",
  questionText: "What is 7 × 8?",
  questionType: QuestionType.multipleChoice,
  quizId: "quiz-arithmetic",
  choices: ["54", "56", "48", "64"],
  topicId: "math-arithmetic",
};

export const mockBackend: backendInterface = {
  addQuizQuestion: async (input) => ({ ...sampleQuizQuestion, id: BigInt(99), ...input }),
  addTopic: async (input) => ({ ...sampleTopics[0], ...input, createdAt: now, facts: [] }),
  addTopicFact: async (input) => ({ id: BigInt(99), ...input }),
  getAllMyProgress: async () => sampleProgress,
  getCallerUserProfile: async () => sampleProfile,
  getChatSessionHistory: async () => ["session-1", "session-2"],
  getMyQuizAttempts: async () => [
    { id: BigInt(1), userId: mockUserId, studentAnswer: "56", isCorrect: true, score: BigInt(10), timestamp: now, questionId: BigInt(1), sessionId: "session-1", quizId: "quiz-arithmetic" },
  ],
  getMyTopicProgress: async () => sampleProgress[0],
  getPrerequisiteTopics: async () => [],
  getQuizQuestion: async () => sampleQuizQuestion,
  getQuizQuestions: async () => [sampleQuizQuestion],
  getQuizSessionResult: async () => ({
    userId: mockUserId,
    score: BigInt(3),
    totalQuestions: BigInt(4),
    timestamp: now,
    sessionId: "session-1",
    correctCount: BigInt(3),
    quizId: "quiz-arithmetic",
  }),
  getSessionMessages: async () => sampleMessages,
  getSessionSummary: async () => ({
    keyTakeaways: ["Learned about Newton's Laws", "Understood F=ma"],
    topic: "Newton's Laws of Motion",
    userId: mockUserId,
    durationSeconds: BigInt(1200),
    timestamp: now,
    sessionId: "session-1",
  }),
  getSuggestedTopics: async () => sampleSuggestedTopics,
  getTopic: async () => sampleTopics[0],
  getTopicsBySubject: async () => sampleTopics,
  getUserProfile: async () => sampleProfile,
  getUserSessionSummaries: async () => [
    { keyTakeaways: ["Learned cells basics"], topic: "Cells", userId: mockUserId, durationSeconds: BigInt(600), timestamp: now, sessionId: "session-1" },
  ],
  listTopics: async () => sampleTopics,
  recordTopicAttempt: async () => sampleProgress[0],
  saveCallerUserProfile: async () => undefined,
  saveSessionSummary: async (input) => ({
    keyTakeaways: input.keyTakeaways,
    topic: input.topic,
    userId: mockUserId,
    durationSeconds: input.durationSeconds,
    timestamp: now,
    sessionId: input.sessionId,
  }),
  sendMessage: async (input) => ({
    id: BigInt(99),
    content: "Great question! Let me help you with that. 🌟 Keep exploring and learning — you're doing amazing!",
    userId: mockUserId,
    role: MessageRole.ai,
    feedback: MessageFeedback.none,
    timestamp: now,
    sessionId: input.sessionId,
  }),
  setMessageFeedback: async () => true,
  submitQuizAnswer: async (input) => ({
    id: BigInt(99),
    userId: mockUserId,
    studentAnswer: input.studentAnswer,
    isCorrect: true,
    score: BigInt(10),
    timestamp: now,
    questionId: input.questionId,
    sessionId: input.sessionId,
    quizId: input.quizId,
  }),
};
