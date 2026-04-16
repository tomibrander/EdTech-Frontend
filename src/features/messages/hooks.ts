"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Announcement, Message, MessageThread, Paginated } from "@/types";

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () =>
      (await api.get<Paginated<MessageThread>>("/messages/threads")).data,
  });
}

export function useThread(id: string, page = 1) {
  return useQuery({
    queryKey: ["thread", id, page],
    queryFn: async () =>
      (
        await api.get<{
          thread: { id: string; subject: string };
          messages: Message[];
          pagination: { page: number; total: number };
        }>(`/messages/threads/${id}`, { params: { page } })
      ).data,
    enabled: !!id,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      recipientId: string;
      subject: string;
      message: string;
    }) => (await api.post("/messages/threads", values)).data as { id: string },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) =>
      (await api.post(`/messages/threads/${threadId}`, { body })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useAnnouncements(courseId?: string) {
  return useQuery({
    queryKey: ["announcements", courseId],
    queryFn: async () =>
      (
        await api.get<Paginated<Announcement>>("/messages/announcements", {
          params: courseId ? { courseId } : {},
        })
      ).data,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      title: string;
      body: string;
      courseId?: string;
      audience?: string[];
      publishAt?: string;
      visibleUntil?: string;
    }) => (await api.post("/messages/announcements", values)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useScheduleAnnouncement(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { publishAt?: string; visibleUntil?: string }) =>
      (await api.patch(`/messages/announcements/${id}/schedule`, values)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
