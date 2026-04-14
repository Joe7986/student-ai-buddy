import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types/quiz";
import Common "../types/common";

module {
  public type QuestionStore = Map.Map<Common.QuizId, List.List<Types.QuizQuestion>>;
  public type AttemptStore = Map.Map<Common.UserId, List.List<Types.QuizAttempt>>;

  public func addQuestion(store : QuestionStore, idCounter : [var Nat], input : Types.QuizQuestionInput) : Types.QuizQuestion {
    let id = idCounter[0];
    idCounter[0] += 1;
    let question : Types.QuizQuestion = {
      id = id;
      quizId = input.quizId;
      topicId = input.topicId;
      questionText = input.questionText;
      questionType = input.questionType;
      choices = input.choices;
      correctAnswer = input.correctAnswer;
      explanation = input.explanation;
    };
    switch (store.get(input.quizId)) {
      case (null) {
        let lst = List.empty<Types.QuizQuestion>();
        lst.add(question);
        store.add(input.quizId, lst);
      };
      case (?lst) lst.add(question);
    };
    question;
  };

  public func getQuestion(store : QuestionStore, quizId : Common.QuizId, questionId : Nat) : ?Types.QuizQuestion {
    switch (store.get(quizId)) {
      case (null) null;
      case (?lst) lst.find(func(q) { q.id == questionId });
    };
  };

  public func getQuizQuestions(store : QuestionStore, quizId : Common.QuizId) : [Types.QuizQuestion] {
    switch (store.get(quizId)) {
      case (null) [];
      case (?lst) lst.toArray();
    };
  };

  public func submitAnswer(store : AttemptStore, questionStore : QuestionStore, idCounter : [var Nat], userId : Common.UserId, input : Types.QuizAttemptInput) : Types.QuizAttempt {
    let id = idCounter[0];
    idCounter[0] += 1;

    // Grade the answer
    let isCorrect = switch (getQuestion(questionStore, input.quizId, input.questionId)) {
      case (null) false;
      case (?q) {
        let normalizedStudent = input.studentAnswer.toLower().trim(#char ' ');
        let normalizedCorrect = q.correctAnswer.toLower().trim(#char ' ');
        normalizedStudent == normalizedCorrect;
      };
    };
    let score = if isCorrect 1 else 0;

    let attempt : Types.QuizAttempt = {
      id = id;
      userId = userId;
      sessionId = input.sessionId;
      quizId = input.quizId;
      questionId = input.questionId;
      studentAnswer = input.studentAnswer;
      isCorrect = isCorrect;
      score = score;
      timestamp = Time.now();
    };
    switch (store.get(userId)) {
      case (null) {
        let lst = List.empty<Types.QuizAttempt>();
        lst.add(attempt);
        store.add(userId, lst);
      };
      case (?lst) lst.add(attempt);
    };
    attempt;
  };

  public func getUserAttempts(store : AttemptStore, userId : Common.UserId) : [Types.QuizAttempt] {
    switch (store.get(userId)) {
      case (null) [];
      case (?lst) lst.toArray();
    };
  };

  public func getSessionResult(store : AttemptStore, userId : Common.UserId, sessionId : Common.SessionId, quizId : Common.QuizId) : Types.QuizSessionResult {
    let attempts = switch (store.get(userId)) {
      case (null) [];
      case (?lst) lst.filter(func(a) { a.sessionId == sessionId and a.quizId == quizId }).toArray();
    };
    let totalQuestions = attempts.size();
    let correctCount = attempts.filter(func(a) { a.isCorrect }).size();
    let score = if (totalQuestions == 0) 0 else (correctCount * 100) / totalQuestions;
    {
      userId = userId;
      sessionId = sessionId;
      quizId = quizId;
      totalQuestions = totalQuestions;
      correctCount = correctCount;
      score = score;
      timestamp = Time.now();
    };
  };
};
