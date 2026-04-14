import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/quiz";
import Common "../types/common";
import QuizLib "../lib/quiz";
import KnowledgeLib "../lib/knowledge";
import KnowledgeTypes "../types/knowledge";

mixin (
  questionStore : Map.Map<Common.QuizId, List.List<Types.QuizQuestion>>,
  attemptStore : Map.Map<Common.UserId, List.List<Types.QuizAttempt>>,
  questionIdCounter : [var Nat],
  attemptIdCounter : [var Nat],
  topicStore : Map.Map<Common.TopicId, KnowledgeTypes.Topic>,
  progressStore : Map.Map<Common.UserId, Map.Map<Common.TopicId, KnowledgeTypes.TopicProgress>>,
) {
  // --- Admin: manage quiz content ---
  public shared ({ caller }) func addQuizQuestion(input : Types.QuizQuestionInput) : async Types.QuizQuestion {
    QuizLib.addQuestion(questionStore, questionIdCounter, input);
  };

  // --- Query quiz content ---
  public query func getQuizQuestions(quizId : Common.QuizId) : async [Types.QuizQuestion] {
    QuizLib.getQuizQuestions(questionStore, quizId);
  };

  public query func getQuizQuestion(quizId : Common.QuizId, questionId : Nat) : async ?Types.QuizQuestion {
    QuizLib.getQuestion(questionStore, quizId, questionId);
  };

  // --- Student: take quiz — grades answer and updates progress ---
  public shared ({ caller }) func submitQuizAnswer(input : Types.QuizAttemptInput) : async Types.QuizAttempt {
    let attempt = QuizLib.submitAnswer(attemptStore, questionStore, attemptIdCounter, caller, input);
    // Find the topic for this question and update progress
    switch (QuizLib.getQuestion(questionStore, input.quizId, input.questionId)) {
      case (?q) ignore KnowledgeLib.updateProgress(progressStore, caller, q.topicId, attempt.isCorrect);
      case (null) {};
    };
    attempt;
  };

  // --- Student: view results ---
  public query ({ caller }) func getMyQuizAttempts() : async [Types.QuizAttempt] {
    QuizLib.getUserAttempts(attemptStore, caller);
  };

  public query ({ caller }) func getQuizSessionResult(sessionId : Common.SessionId, quizId : Common.QuizId) : async Types.QuizSessionResult {
    QuizLib.getSessionResult(attemptStore, caller, sessionId, quizId);
  };
};
