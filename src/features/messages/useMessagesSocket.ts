"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export function useMessagesSocket(): void {
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const { data } = await api.get<{ ticket: string }>(
          "/messages/threads/ws-ticket",
        );
        if (!active) return;

        const socket = connectSocket(data.ticket);

        socket.on("new_message", ({ threadId }: { threadId: string }) => {
          void qc.invalidateQueries({ queryKey: ["thread", threadId] });
          void qc.invalidateQueries({ queryKey: ["threads"] });
          void qc.invalidateQueries({ queryKey: ["unread-count"] });
        });

        socket.on("thread_created", () => {
          void qc.invalidateQueries({ queryKey: ["threads"] });
          void qc.invalidateQueries({ queryKey: ["unread-count"] });
        });

        // si el socket pierde conexión y reconecta, el ticket ya fue consumido —
        // pedimos uno nuevo para que la reautenticación funcione
        socket.on("connect_error", async () => {
          try {
            const { data: fresh } = await api.get<{ ticket: string }>(
              "/messages/threads/ws-ticket",
            );
            socket.auth = { ticket: fresh.ticket };
            socket.connect();
          } catch {
            // ignorar — el socket seguirá intentando
          }
        });
      } catch {
        // servidor de sockets no disponible — el polling sigue activo como fallback
      }
    }

    void init();

    return () => {
      active = false;
      disconnectSocket();
    };
  }, [qc]);
}
