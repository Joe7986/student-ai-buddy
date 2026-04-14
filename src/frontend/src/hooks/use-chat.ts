import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  ChatMessage,
  MessageFeedback,
  SendMessageInput,
  SessionId,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useSessionMessages(sessionId: SessionId | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<ChatMessage[]>({
    queryKey: ["messages", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      return actor.getSessionMessages(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useChatSessionHistory() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<SessionId[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatSessionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(input);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useSetMessageFeedback() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      feedback,
    }: { messageId: bigint; feedback: MessageFeedback }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setMessageFeedback(messageId, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
