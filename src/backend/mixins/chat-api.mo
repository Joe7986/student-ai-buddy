import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Types "../types/chat";
import Common "../types/common";
import ChatLib "../lib/chat";

mixin (
  messageStore : Map.Map<Common.UserId, List.List<Types.ChatMessage>>,
  summaryStore : Map.Map<Common.SessionId, Types.SessionSummary>,
  messageIdCounter : [var Nat],
) {
  // IC management canister for HTTP outcalls
  type HttpHeader = { name : Text; value : Text };
  type HttpResult = { status : Nat; headers : [HttpHeader]; body : Blob };
  type HttpArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{ function : shared query { response : HttpResult; context : Blob } -> async HttpResult; context : Blob };
    is_replicated : ?Bool;
  };

  let ic : actor { http_request : HttpArgs -> async HttpResult } =
    actor "aaaaa-aa";

  // Build a JSON payload for the OpenAI chat completions API
  func buildOpenAIPayload(history : [Types.ChatMessage]) : Blob {
    let systemMsg = "{\"role\":\"system\",\"content\":\"You are a friendly and encouraging AI study buddy for students. Your role is to help students learn and understand concepts in a clear, engaging way. Use simple language, give examples, and always be supportive and positive. When a student is struggling, break concepts down into smaller pieces.\"}";

    // Take last 6 messages for context (3 turns)
    let total = history.size();
    let start : Nat = if (total > 6) total - 6 else 0;
    var msgs = systemMsg;
    var i = start;
    while (i < total) {
      let m = history[i];
      let roleStr = switch (m.role) { case (#student) "user"; case (#ai) "assistant" };
      let escaped = m.content.replace(#text "\"", "\\\"").replace(#text "\n", "\\n");
      msgs := msgs # ",{\"role\":\"" # roleStr # "\",\"content\":\"" # escaped # "\"}";
      i += 1;
    };

    let payload = "{\"model\":\"gpt-4o-mini\",\"messages\":[" # msgs # "],\"max_tokens\":512,\"temperature\":0.7}";
    payload.encodeUtf8();
  };

  // Parse the AI text out of the OpenAI response JSON using text split
  func extractAIContent(responseBlob : Blob) : Text {
    let fallback = "Great question! Let me help you understand this concept. 📚";
    switch (responseBlob.decodeUtf8()) {
      case (null) fallback;
      case (?responseText) {
        // Split on the marker "content":" — the second part starts with the AI reply
        let parts = responseText.split(#text "\"content\":\"").toArray();
        if (parts.size() < 2) return fallback;
        // Take second part, then split on first unescaped closing quote
        // For simplicity: split on "\",\"" which follows the content in role objects
        // Use the first part after the second "content":"
        let afterMarker = parts[1];
        // Extract until the next bare quote by splitting on `",` sequence
        let endParts = afterMarker.split(#text "\",").toArray();
        if (endParts.size() == 0) return fallback;
        let extracted = endParts[0];
        // Unescape \n sequences
        let unescaped = extracted.replace(#text "\\n", "\n").replace(#text "\\\"", "\"");
        if (unescaped.size() > 0) unescaped else fallback;
      };
    };
  };

  // Send a message and get an AI response
  public shared ({ caller }) func sendMessage(input : Types.SendMessageInput) : async Types.ChatMessage {
    // 1. Store the student's message
    ignore ChatLib.addMessage(messageStore, messageIdCounter, caller, #student, input, input.content);

    // 2. Get session history for context
    let history = ChatLib.getMessages(messageStore, caller, input.sessionId);

    // 3. Call the AI via IC HTTP outcall
    let payload = buildOpenAIPayload(history);
    let headers : [HttpHeader] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer YOUR_OPENAI_API_KEY" },
    ];

    let aiContent = try {
      let response = await ic.http_request({
        url = "https://api.openai.com/v1/chat/completions";
        max_response_bytes = ?(32768 : Nat64);
        method = #post;
        headers = headers;
        body = ?payload;
        transform = null;
        is_replicated = ?false;
      });
      if (response.status == 200) {
        extractAIContent(response.body);
      } else {
        "I'm experiencing a little hiccup right now! 🌟 Please try again in a moment. Your question was great!";
      };
    } catch (_) {
      "I'm here and ready to help! It seems I had a temporary connection issue. Please ask your question again! 😊";
    };

    // 4. Store and return the AI response
    let aiInput : Types.SendMessageInput = { sessionId = input.sessionId; content = aiContent };
    ChatLib.addMessage(messageStore, messageIdCounter, caller, #ai, aiInput, aiContent);
  };

  // Get all messages for a session
  public query ({ caller }) func getSessionMessages(sessionId : Common.SessionId) : async [Types.ChatMessage] {
    ChatLib.getMessages(messageStore, caller, sessionId);
  };

  // Set feedback (thumbs up/down) on a message
  public shared ({ caller }) func setMessageFeedback(messageId : Nat, feedback : Types.MessageFeedback) : async Bool {
    ChatLib.setFeedback(messageStore, caller, messageId, feedback);
  };

  // Get all session IDs for the caller
  public query ({ caller }) func getChatSessionHistory() : async [Common.SessionId] {
    ChatLib.getSessionHistory(messageStore, caller);
  };

  // Save a session summary
  public shared ({ caller }) func saveSessionSummary(input : Types.SessionSummaryInput) : async Types.SessionSummary {
    ChatLib.saveSummary(summaryStore, caller, input);
  };

  // Get summary for a session
  public query ({ caller }) func getSessionSummary(sessionId : Common.SessionId) : async ?Types.SessionSummary {
    ChatLib.getSummary(summaryStore, sessionId);
  };

  // Get all session summaries for the caller
  public query ({ caller }) func getUserSessionSummaries() : async [Types.SessionSummary] {
    ChatLib.getUserSummaries(summaryStore, messageStore, caller);
  };
};
