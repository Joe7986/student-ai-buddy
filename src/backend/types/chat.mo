import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  // Chat message role
  public type MessageRole = { #student; #ai };

  // Feedback on AI message
  public type MessageFeedback = { #thumbsUp; #thumbsDown; #none };

  // A single chat message
  public type ChatMessage = {
    id : Nat;
    sessionId : Common.SessionId;
    userId : UserId;
    role : MessageRole;
    content : Text;
    feedback : MessageFeedback;
    timestamp : Timestamp;
  };

  // Input to send a new message
  public type SendMessageInput = {
    sessionId : Common.SessionId;
    content : Text;
  };

  // Session summary
  public type SessionSummary = {
    sessionId : Common.SessionId;
    userId : UserId;
    topic : Text;
    durationSeconds : Nat;
    keyTakeaways : [Text];
    timestamp : Timestamp;
  };

  public type SessionSummaryInput = {
    sessionId : Common.SessionId;
    topic : Text;
    durationSeconds : Nat;
    keyTakeaways : [Text];
  };
};
