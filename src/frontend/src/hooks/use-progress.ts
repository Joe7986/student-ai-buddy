import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  SessionSummary,
  SessionSummaryInput,
  TopicId,
  TopicProgress,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useAllProgress() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<TopicProgress[]>({
    queryKey: ["allProgress"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMyProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopicProgress(topicId: TopicId | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<TopicProgress | null>({
    queryKey: ["topicProgress", topicId],
    queryFn: async () => {
      if (!actor || !topicId) return null;
      return actor.getMyTopicProgress(topicId);
    },
    enabled: !!actor && !isFetching && !!topicId,
  });
}

export function useRecordTopicAttempt() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      isCorrect,
    }: { topicId: TopicId; isCorrect: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordTopicAttempt(topicId, isCorrect);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProgress"] });
      queryClient.invalidateQueries({ queryKey: ["topicProgress"] });
    },
  });
}

export function useSessionSummaries() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<SessionSummary[]>({
    queryKey: ["sessionSummaries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserSessionSummaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSessionSummary() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SessionSummaryInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveSessionSummary(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionSummaries"] });
    },
  });
}
