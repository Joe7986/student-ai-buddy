import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface QuizQuestion {
    id: bigint;
    explanation: string;
    correctAnswer: string;
    questionText: string;
    questionType: QuestionType;
    quizId: QuizId;
    choices: Array<string>;
    topicId: TopicId;
}
export interface TopicFact {
    id: bigint;
    factText: string;
    tags: Array<string>;
    topicId: TopicId;
}
export interface SuggestedTopic {
    topicName: string;
    topicId: TopicId;
    reason: string;
}
export type TopicId = string;
export interface StudentProfileInput {
    name: string;
    gradeLevel: GradeLevel;
    preferredSubjects: Array<string>;
}
export interface QuizQuestionInput {
    explanation: string;
    correctAnswer: string;
    questionText: string;
    questionType: QuestionType;
    quizId: QuizId;
    choices: Array<string>;
    topicId: TopicId;
}
export interface QuizAttempt {
    id: bigint;
    userId: UserId;
    studentAnswer: string;
    isCorrect: boolean;
    score: bigint;
    timestamp: Timestamp;
    questionId: bigint;
    sessionId: SessionId;
    quizId: QuizId;
}
export interface QuizSessionResult {
    userId: UserId;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Timestamp;
    sessionId: SessionId;
    correctCount: bigint;
    quizId: QuizId;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    userId: UserId;
    role: MessageRole;
    feedback: MessageFeedback;
    timestamp: Timestamp;
    sessionId: SessionId;
}
export interface SendMessageInput {
    content: string;
    sessionId: SessionId;
}
export interface SessionSummaryInput {
    keyTakeaways: Array<string>;
    topic: string;
    durationSeconds: bigint;
    sessionId: SessionId;
}
export interface StudentProfilePublic {
    userId: UserId;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    gradeLevel: GradeLevel;
    preferredSubjects: Array<string>;
}
export interface TopicInput {
    id: TopicId;
    subject: string;
    prerequisites: Array<TopicId>;
    difficulty: DifficultyLevel;
    name: string;
    description: string;
}
export type SessionId = string;
export type UserId = Principal;
export interface SessionSummary {
    keyTakeaways: Array<string>;
    topic: string;
    userId: UserId;
    durationSeconds: bigint;
    timestamp: Timestamp;
    sessionId: SessionId;
}
export interface TopicFactInput {
    factText: string;
    tags: Array<string>;
    topicId: TopicId;
}
export interface Topic {
    id: TopicId;
    subject: string;
    prerequisites: Array<TopicId>;
    difficulty: DifficultyLevel;
    name: string;
    createdAt: Timestamp;
    description: string;
    facts: Array<TopicFact>;
}
export interface TopicProgress {
    userId: UserId;
    masteryLevel: MasteryLevel;
    lastUpdated: Timestamp;
    totalAttempts: bigint;
    correctCount: bigint;
    accuracyPercent: bigint;
    topicId: TopicId;
}
export interface QuizAttemptInput {
    studentAnswer: string;
    questionId: bigint;
    sessionId: SessionId;
    quizId: QuizId;
}
export type QuizId = string;
export enum DifficultyLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum GradeLevel {
    highSchool = "highSchool",
    elementary = "elementary",
    other = "other",
    middleSchool = "middleSchool",
    college = "college"
}
export enum MasteryLevel {
    needsWork = "needsWork",
    mastered = "mastered",
    inProgress = "inProgress"
}
export enum MessageFeedback {
    thumbsDown = "thumbsDown",
    none = "none",
    thumbsUp = "thumbsUp"
}
export enum MessageRole {
    ai = "ai",
    student = "student"
}
export enum QuestionType {
    shortAnswer = "shortAnswer",
    multipleChoice = "multipleChoice"
}
export interface backendInterface {
    addQuizQuestion(input: QuizQuestionInput): Promise<QuizQuestion>;
    addTopic(input: TopicInput): Promise<Topic>;
    addTopicFact(input: TopicFactInput): Promise<TopicFact>;
    getAllMyProgress(): Promise<Array<TopicProgress>>;
    getCallerUserProfile(): Promise<StudentProfilePublic | null>;
    getChatSessionHistory(): Promise<Array<SessionId>>;
    getMyQuizAttempts(): Promise<Array<QuizAttempt>>;
    getMyTopicProgress(topicId: TopicId): Promise<TopicProgress | null>;
    getPrerequisiteTopics(topicId: TopicId): Promise<Array<Topic>>;
    getQuizQuestion(quizId: QuizId, questionId: bigint): Promise<QuizQuestion | null>;
    getQuizQuestions(quizId: QuizId): Promise<Array<QuizQuestion>>;
    getQuizSessionResult(sessionId: SessionId, quizId: QuizId): Promise<QuizSessionResult>;
    getSessionMessages(sessionId: SessionId): Promise<Array<ChatMessage>>;
    getSessionSummary(sessionId: SessionId): Promise<SessionSummary | null>;
    getSuggestedTopics(): Promise<Array<SuggestedTopic>>;
    getTopic(topicId: TopicId): Promise<Topic | null>;
    getTopicsBySubject(subject: string): Promise<Array<Topic>>;
    getUserProfile(userId: UserId): Promise<StudentProfilePublic | null>;
    getUserSessionSummaries(): Promise<Array<SessionSummary>>;
    listTopics(): Promise<Array<Topic>>;
    recordTopicAttempt(topicId: TopicId, isCorrect: boolean): Promise<TopicProgress>;
    saveCallerUserProfile(input: StudentProfileInput): Promise<void>;
    saveSessionSummary(input: SessionSummaryInput): Promise<SessionSummary>;
    sendMessage(input: SendMessageInput): Promise<ChatMessage>;
    setMessageFeedback(messageId: bigint, feedback: MessageFeedback): Promise<boolean>;
    submitQuizAnswer(input: QuizAttemptInput): Promise<QuizAttempt>;
}
