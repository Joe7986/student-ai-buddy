import Common "common";

module {
  public type TopicId = Common.TopicId;
  public type Timestamp = Common.Timestamp;

  // Difficulty level (Prolog-inspired knowledge system)
  public type DifficultyLevel = { #beginner; #intermediate; #advanced };

  // A fact/rule about a topic
  public type TopicFact = {
    id : Nat;
    topicId : TopicId;
    factText : Text;
    tags : [Text];
  };

  // A topic node in the knowledge graph
  public type Topic = {
    id : TopicId;
    name : Text;
    description : Text;
    subject : Text;
    difficulty : DifficultyLevel;
    prerequisites : [TopicId];
    facts : [TopicFact];
    createdAt : Timestamp;
  };

  // Input to add a topic
  public type TopicInput = {
    id : TopicId;
    name : Text;
    description : Text;
    subject : Text;
    difficulty : DifficultyLevel;
    prerequisites : [TopicId];
  };

  // Input to add a fact to a topic
  public type TopicFactInput = {
    topicId : TopicId;
    factText : Text;
    tags : [Text];
  };

  // Mastery level per student-topic
  public type MasteryLevel = { #mastered; #inProgress; #needsWork };

  // Progress tracking per topic per student
  public type TopicProgress = {
    userId : Common.UserId;
    topicId : TopicId;
    totalAttempts : Nat;
    correctCount : Nat;
    accuracyPercent : Nat;
    masteryLevel : MasteryLevel;
    lastUpdated : Timestamp;
  };

  // Suggested topic for a student
  public type SuggestedTopic = {
    topicId : TopicId;
    topicName : Text;
    reason : Text;
  };
};
