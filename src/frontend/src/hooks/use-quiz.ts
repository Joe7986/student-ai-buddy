import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  QuizAttempt,
  QuizAttemptInput,
  QuizId,
  QuizQuestion,
  QuizSessionResult,
  SessionId,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useQuizQuestions(quizId: QuizId | null) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<QuizQuestion[]>({
    queryKey: ["quizQuestions", quizId],
    queryFn: async () => {
      if (!actor || !quizId) return [];
      return actor.getQuizQuestions(quizId);
    },
    enabled: !!actor && !isFetching && !!quizId,
  });
}

export function useMyQuizAttempts() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<QuizAttempt[]>({
    queryKey: ["myQuizAttempts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyQuizAttempts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuizSessionResult(
  sessionId: SessionId | null,
  quizId: QuizId | null,
) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<QuizSessionResult | null>({
    queryKey: ["quizSessionResult", sessionId, quizId],
    queryFn: async () => {
      if (!actor || !sessionId || !quizId) return null;
      return actor.getQuizSessionResult(sessionId, quizId);
    },
    enabled: !!actor && !isFetching && !!sessionId && !!quizId,
  });
}

export function useSubmitQuizAnswer() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: QuizAttemptInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuizAnswer(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myQuizAttempts"] });
      queryClient.invalidateQueries({ queryKey: ["quizSessionResult"] });
    },
  });
}
