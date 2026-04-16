"use client";
import * as React from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, Send, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useAIQuery } from "@/features/classroom/hooks";
import { useSession } from "@/features/auth/useSession";
import type { AIAssistantResponse } from "@/types";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
  sources?: AIAssistantResponse["sources"];
}

const SUGGESTIONS = [
  "¿Cuándo es el próximo examen?",
  "¿Qué tareas tengo pendientes esta semana?",
  "Mostrame mis últimas notas",
  "¿Hay alguna fecha importante este mes?",
];

export default function AIAssistantPage() {
  const { user } = useSession();
  const [messages, setMessages] = React.useState<ChatItem[]>([]);
  const [input, setInput] = React.useState("");
  const ask = useAIQuery();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function onSend(q?: string) {
    const query = (q ?? input).trim();
    if (!query) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    try {
      const res = await ask.mutateAsync(query);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error del asistente");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Asistente IA"
        description="Preguntá en lenguaje natural sobre tareas, exámenes y calificaciones."
      />

      <Card>
        <CardContent className="p-0">
          <div
            ref={scrollRef}
            className="flex h-[60vh] min-h-[420px] flex-col gap-3 overflow-y-auto p-5 scrollbar-thin"
          >
            {messages.length === 0 ? (
              <div className="m-auto max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">
                  ¿En qué te puedo ayudar?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usá las sugerencias o hacé tu propia pregunta.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      onClick={() => onSend(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <ChatBubble key={i} item={m} userName={user?.displayName} />
              ))
            )}
            {ask.isPending && (
              <ChatBubble
                item={{ role: "assistant", content: "Pensando…" }}
                typing
                userName={user?.displayName}
              />
            )}
          </div>
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Preguntale al asistente…"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button onClick={() => onSend()} disabled={ask.isPending || !input.trim()}>
                {ask.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              El asistente se basa en tus tareas, exámenes y calificaciones de Classroom.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChatBubble({
  item,
  typing,
  userName,
}: {
  item: ChatItem;
  typing?: boolean;
  userName?: string | null;
}) {
  const [showSources, setShowSources] = React.useState(false);
  const isUser = item.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10 text-primary">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[75%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            typing && "animate-pulse"
          )}
        >
          <p className="whitespace-pre-wrap">{item.content}</p>
        </div>
        {item.sources && item.sources.length > 0 && (
          <div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowSources((v) => !v)}
            >
              {showSources ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {item.sources.length} fuente{item.sources.length > 1 ? "s" : ""}
            </button>
            {showSources && (
              <ul className="mt-2 space-y-1 rounded-md border bg-background p-3 text-xs">
                {item.sources.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge variant="muted">{s.type}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.title ?? s.id}</p>
                      {s.dueDate && (
                        <p className="text-muted-foreground">
                          Vence {new Date(s.dueDate).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
