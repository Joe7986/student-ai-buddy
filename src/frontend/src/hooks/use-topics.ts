import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { SuggestedTopic, Topic, TopicId } from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useTopics() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Topic[]>({
    queryKey: ["topics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTopics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopic(topicId: TopicId | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Topic | null>({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      if (!actor || !topicId) return null;
      return actor.getTopic(topicId);
    },
    enabled: !!actor && !isFetching && !!topicId,
  });
}

export function useTopicsBySubject(subject: string | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Topic[]>({
    queryKey: ["topicsBySubject", subject],
    queryFn: async () => {
      if (!actor || !subject) return [];
      return actor.getTopicsBySubject(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}

export function useSuggestedTopics() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<SuggestedTopic[]>({
    queryKey: ["suggestedTopics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuggestedTopics();
    },
    enabled: !!actor && !isFetching,
  });
}
