import Map "mo:core/Map";
import Types "../types/knowledge";
import Common "../types/common";
import KnowledgeLib "../lib/knowledge";

mixin (
  topicStore : Map.Map<Common.TopicId, Types.Topic>,
  progressStore : Map.Map<Common.UserId, Map.Map<Common.TopicId, Types.TopicProgress>>,
  factIdCounter : [var Nat],
) {
  // --- Admin: manage knowledge base ---
  public shared ({ caller }) func addTopic(input : Types.TopicInput) : async Types.Topic {
    KnowledgeLib.addTopic(topicStore, input);
  };

  public shared ({ caller }) func addTopicFact(input : Types.TopicFactInput) : async Types.TopicFact {
    KnowledgeLib.addFact(topicStore, factIdCounter, input);
  };

  // --- Query knowledge base ---
  public query func getTopic(topicId : Common.TopicId) : async ?Types.Topic {
    KnowledgeLib.getTopic(topicStore, topicId);
  };

  public query func listTopics() : async [Types.Topic] {
    KnowledgeLib.listTopics(topicStore);
  };

  public query func getTopicsBySubject(subject : Text) : async [Types.Topic] {
    KnowledgeLib.getTopicsBySubject(topicStore, subject);
  };

  public query func getPrerequisiteTopics(topicId : Common.TopicId) : async [Types.Topic] {
    KnowledgeLib.getPrerequisiteTopics(topicStore, topicId);
  };

  // --- Student progress ---
  public query ({ caller }) func getMyTopicProgress(topicId : Common.TopicId) : async ?Types.TopicProgress {
    KnowledgeLib.getTopicProgress(progressStore, caller, topicId);
  };

  public query ({ caller }) func getAllMyProgress() : async [Types.TopicProgress] {
    KnowledgeLib.getAllProgress(progressStore, caller);
  };

  public shared ({ caller }) func recordTopicAttempt(topicId : Common.TopicId, isCorrect : Bool) : async Types.TopicProgress {
    KnowledgeLib.updateProgress(progressStore, caller, topicId, isCorrect);
  };

  // --- Suggested topics (from knowledge gaps) ---
  public query ({ caller }) func getSuggestedTopics() : async [Types.SuggestedTopic] {
    KnowledgeLib.getSuggestedTopics(topicStore, progressStore, caller);
  };
};
