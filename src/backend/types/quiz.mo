import Common "common";

module {
  public type TopicId = Common.TopicId;
  public type QuizId = Common.QuizId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  // Question type
  public type QuestionType = { #multipleChoice; #shortAnswer };

  // A single quiz question
  public type QuizQuestion = {
    id : Nat;
    quizId : QuizId;
    topicId : TopicId;
    questionText : Text;
    questionType : QuestionType;
    choices : [Text];       // empty for short answer
    correctAnswer : Text;
    explanation : Text;
  };

  // Input to add a quiz question
  public type QuizQuestionInput = {
    quizId : QuizId;
    topicId : TopicId;
    questionText : Text;
    questionType : QuestionType;
    choices : [Text];
    correctAnswer : Text;
    explanation : Text;
  };

  // A student's answer attempt for one question
  public type QuizAttempt = {
    id : Nat;
    userId : UserId;
    sessionId : Common.SessionId;
    quizId : QuizId;
    questionId : Nat;
    studentAnswer : Text;
    isCorrect : Bool;
    score : Nat;
    timestamp : Timestamp;
  };

  // Input for submitting a quiz answer
  public type QuizAttemptInput = {
    sessionId : Common.SessionId;
    quizId : QuizId;
    questionId : Nat;
    studentAnswer : Text;
  };

  // Summary of a quiz session
  public type QuizSessionResult = {
    userId : UserId;
    sessionId : Common.SessionId;
    quizId : QuizId;
    totalQuestions : Nat;
    correctCount : Nat;
    score : Nat;
    timestamp : Timestamp;
  };
};
