import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/knowledge";
import Common "../types/common";

module {
  public type TopicStore = Map.Map<Common.TopicId, Types.Topic>;
  public type ProgressStore = Map.Map<Common.UserId, Map.Map<Common.TopicId, Types.TopicProgress>>;

  // --- Topic / knowledge graph ---
  public func addTopic(store : TopicStore, input : Types.TopicInput) : Types.Topic {
    let topic : Types.Topic = {
      id = input.id;
      name = input.name;
      description = input.description;
      subject = input.subject;
      difficulty = input.difficulty;
      prerequisites = input.prerequisites;
      facts = [];
      createdAt = Time.now();
    };
    store.add(input.id, topic);
    topic;
  };

  public func getTopic(store : TopicStore, topicId : Common.TopicId) : ?Types.Topic {
    store.get(topicId);
  };

  public func listTopics(store : TopicStore) : [Types.Topic] {
    store.values().toArray();
  };

  public func addFact(store : TopicStore, idCounter : [var Nat], input : Types.TopicFactInput) : Types.TopicFact {
    let factId = idCounter[0];
    idCounter[0] += 1;
    let fact : Types.TopicFact = {
      id = factId;
      topicId = input.topicId;
      factText = input.factText;
      tags = input.tags;
    };
    switch (store.get(input.topicId)) {
      case (null) {};
      case (?topic) {
        let updated : Types.Topic = { topic with facts = topic.facts.concat([fact]) };
        store.add(input.topicId, updated);
      };
    };
    fact;
  };

  public func getTopicsBySubject(store : TopicStore, subject : Text) : [Types.Topic] {
    store.values().filter(func(t) { t.subject == subject }).toArray();
  };

  public func getPrerequisiteTopics(store : TopicStore, topicId : Common.TopicId) : [Types.Topic] {
    switch (store.get(topicId)) {
      case (null) [];
      case (?topic) {
        let result = List.empty<Types.Topic>();
        for (prereqId in topic.prerequisites.values()) {
          switch (store.get(prereqId)) {
            case (?prereq) result.add(prereq);
            case (null) {};
          };
        };
        result.toArray();
      };
    };
  };

  // --- Progress tracking ---
  public func getTopicProgress(progressStore : ProgressStore, userId : Common.UserId, topicId : Common.TopicId) : ?Types.TopicProgress {
    switch (progressStore.get(userId)) {
      case (null) null;
      case (?userProgress) userProgress.get(topicId);
    };
  };

  public func getAllProgress(progressStore : ProgressStore, userId : Common.UserId) : [Types.TopicProgress] {
    switch (progressStore.get(userId)) {
      case (null) [];
      case (?userProgress) userProgress.values().toArray();
    };
  };

  public func updateProgress(progressStore : ProgressStore, userId : Common.UserId, topicId : Common.TopicId, isCorrect : Bool) : Types.TopicProgress {
    let existing = switch (progressStore.get(userId)) {
      case (null) null;
      case (?userProgress) userProgress.get(topicId);
    };
    let (prevAttempts, prevCorrect) = switch (existing) {
      case (null) (0, 0);
      case (?p) (p.totalAttempts, p.correctCount);
    };
    let totalAttempts = prevAttempts + 1;
    let correctCount = if isCorrect prevCorrect + 1 else prevCorrect;
    let accuracyPercent = (correctCount * 100) / totalAttempts;
    let masteryLevel : Types.MasteryLevel = if (accuracyPercent >= 70) #mastered
      else if (accuracyPercent >= 40) #inProgress
      else #needsWork;
    let progress : Types.TopicProgress = {
      userId = userId;
      topicId = topicId;
      totalAttempts = totalAttempts;
      correctCount = correctCount;
      accuracyPercent = accuracyPercent;
      masteryLevel = masteryLevel;
      lastUpdated = Time.now();
    };
    // Ensure inner map exists
    let userMap = switch (progressStore.get(userId)) {
      case (null) {
        let m = Map.empty<Common.TopicId, Types.TopicProgress>();
        progressStore.add(userId, m);
        m;
      };
      case (?m) m;
    };
    userMap.add(topicId, progress);
    progress;
  };

  public func getSuggestedTopics(topicStore : TopicStore, progressStore : ProgressStore, userId : Common.UserId) : [Types.SuggestedTopic] {
    let userProgressMap = switch (progressStore.get(userId)) {
      case (null) Map.empty<Common.TopicId, Types.TopicProgress>();
      case (?m) m;
    };

    let result = List.empty<Types.SuggestedTopic>();
    for (topic in topicStore.values()) {
      // Determine mastery of this topic for the student
      let isMastered = switch (userProgressMap.get(topic.id)) {
        case (?p) p.masteryLevel == #mastered;
        case (null) false;
      };
      if (not isMastered) {
        // Check prerequisites are all mastered (empty prereqs → always true)
        let prereqsMet = topic.prerequisites.all(func(prereqId) {
          switch (userProgressMap.get(prereqId)) {
            case (?p) p.masteryLevel == #mastered;
            case (null) false;
          };
        });
        if (prereqsMet) {
          let reason = switch (userProgressMap.get(topic.id)) {
            case (null) "New topic — start your learning journey! 🚀";
            case (?p) switch (p.masteryLevel) {
              case (#needsWork) "Keep practicing — you're making progress! 💪";
              case (#inProgress) "Almost there — a little more practice! 📚";
              case (#mastered) ""; // unreachable — filtered by isMastered above
            };
          };
          if (reason != "") {
            result.add({
              topicId = topic.id;
              topicName = topic.name;
              reason = reason;
            });
          };
        };
      };
    };
    result.toArray();
  };
};
