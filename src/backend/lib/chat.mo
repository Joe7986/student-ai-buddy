import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/chat";
import Common "../types/common";

module {
  public type MessageStore = Map.Map<Common.UserId, List.List<Types.ChatMessage>>;
  public type SummaryStore = Map.Map<Common.SessionId, Types.SessionSummary>;

  public func getMessages(store : MessageStore, userId : Common.UserId, sessionId : Common.SessionId) : [Types.ChatMessage] {
    switch (store.get(userId)) {
      case (null) [];
      case (?msgs) msgs.filter(func(m) { m.sessionId == sessionId }).toArray();
    };
  };

  public func addMessage(store : MessageStore, idCounter : [var Nat], userId : Common.UserId, role : Types.MessageRole, input : Types.SendMessageInput, content : Text) : Types.ChatMessage {
    let id = idCounter[0];
    idCounter[0] += 1;
    let msg : Types.ChatMessage = {
      id = id;
      sessionId = input.sessionId;
      userId = userId;
      role = role;
      content = content;
      feedback = #none;
      timestamp = Time.now();
    };
    switch (store.get(userId)) {
      case (null) {
        let lst = List.empty<Types.ChatMessage>();
        lst.add(msg);
        store.add(userId, lst);
      };
      case (?lst) lst.add(msg);
    };
    msg;
  };

  public func setFeedback(store : MessageStore, userId : Common.UserId, messageId : Nat, feedback : Types.MessageFeedback) : Bool {
    switch (store.get(userId)) {
      case (null) false;
      case (?msgs) {
        switch (msgs.findIndex(func(m) { m.id == messageId })) {
          case (null) false;
          case (?idx) {
            let existing = msgs.at(idx);
            msgs.put(idx, { existing with feedback = feedback });
            true;
          };
        };
      };
    };
  };

  public func getSessionHistory(store : MessageStore, userId : Common.UserId) : [Common.SessionId] {
    switch (store.get(userId)) {
      case (null) [];
      case (?msgs) {
        // Collect unique session IDs
        let seen = Map.empty<Common.SessionId, Bool>();
        let result = List.empty<Common.SessionId>();
        for (msg in msgs.values()) {
          if (not seen.containsKey(msg.sessionId)) {
            seen.add(msg.sessionId, true);
            result.add(msg.sessionId);
          };
        };
        result.toArray();
      };
    };
  };

  public func saveSummary(summaryStore : SummaryStore, userId : Common.UserId, input : Types.SessionSummaryInput) : Types.SessionSummary {
    let summary : Types.SessionSummary = {
      sessionId = input.sessionId;
      userId = userId;
      topic = input.topic;
      durationSeconds = input.durationSeconds;
      keyTakeaways = input.keyTakeaways;
      timestamp = Time.now();
    };
    summaryStore.add(input.sessionId, summary);
    summary;
  };

  public func getSummary(summaryStore : SummaryStore, sessionId : Common.SessionId) : ?Types.SessionSummary {
    summaryStore.get(sessionId);
  };

  public func getUserSummaries(summaryStore : SummaryStore, messageStore : MessageStore, userId : Common.UserId) : [Types.SessionSummary] {
    let sessionIds = getSessionHistory(messageStore, userId);
    let result = List.empty<Types.SessionSummary>();
    for (sid in sessionIds.values()) {
      switch (summaryStore.get(sid)) {
        case (?s) if (s.userId == userId) result.add(s);
        case (null) {};
      };
    };
    result.toArray();
  };
};
