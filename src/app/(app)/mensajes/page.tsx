"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Send } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmptyState } from "@/components/data/EmptyState";
import { RoleBadge } from "@/components/layout/RoleBadge";
import {
  useCreateThread,
  useSendMessage,
  useThread,
  useThreads,
  useUserSearch,
} from "@/features/messages/hooks";
import { useMessagesSocket } from "@/features/messages/useMessagesSocket";
import { fromNow, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth/useSession";

export default function MessagesPage() {
  useMessagesSocket();
  const { data: threads, isLoading } = useThreads();
  const { user } = useSession();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedId && threads?.data[0]) setSelectedId(threads.data[0].id);
  }, [threads, selectedId]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mensajes"
        description="Comunicación directa con las familias y docentes"
        actions={<NewThreadDialog onCreated={(id) => setSelectedId(id)} />}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : threads && threads.data.length > 0 ? (
              <ul className="divide-y">
                {threads.data.map((t) => {
                  const other =
                    t.participants.find((p) => p.id !== user?.id) ??
                    t.participants[0];
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/50",
                          selectedId === t.id && "bg-accent/50"
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(other?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {other?.name}
                            </p>
                            {t.unreadCount ? (
                              <Badge variant="default" className="h-5 shrink-0">
                                {t.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.subject}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {fromNow(t.lastMessageAt)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="Sin conversaciones" className="border-none py-10" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {selectedId ? (
              <ThreadView threadId={selectedId} />
            ) : (
              <EmptyState title="Elegí una conversación" className="border-none py-20" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ThreadView({ threadId }: { threadId: string }) {
  const { data, isLoading } = useThread(threadId);
  const send = useSendMessage(threadId);
  const [body, setBody] = React.useState("");
  const { user } = useSession();
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  async function onSend() {
    if (!body.trim()) return;
    try {
      await send.mutateAsync(body);
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos enviar");
    }
  }

  return (
    <div className="flex h-[70vh] min-h-[400px] flex-col">
      <div className="border-b p-4">
        <p className="font-semibold">{data?.thread.subject ?? "—"}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : data && data.messages.length > 0 ? (
          <>
            {data.messages.map((m) => {
              const own = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1",
                    own ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{m.senderName}</span>
                    <RoleBadge role={m.senderRole} />
                    <span>· {fromNow(m.sentAt)}</span>
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      own
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        ) : (
          <EmptyState title="Sin mensajes" className="border-none" />
        )}
      </div>
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Escribí un mensaje…"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
            }}
          />
          <Button onClick={onSend} disabled={send.isPending || !body.trim()}>
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewThreadDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const create = useCreateThread();
  const { register, handleSubmit, reset, setValue, watch } = useForm<{
    recipientId: string;
    recipientName: string;
    subject: string;
    message: string;
  }>();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { data: searchResults, isFetching } = useUserSearch(searchQuery);
  const recipientName = watch("recipientName");

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await create.mutateAsync({
        recipientId: values.recipientId,
        subject: values.subject,
        message: values.message,
      });
      toast.success("Conversación iniciada");
      setOpen(false);
      reset();
      setSearchQuery("");
      onCreated(res.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  function handleDialogClose(v: boolean) {
    if (!v) {
      reset();
      setSearchQuery("");
    }
    setOpen(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nuevo mensaje
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo mensaje</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Destinatario</Label>
            <input type="hidden" {...register("recipientId", { required: true })} />
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-left"
                >
                  {recipientName ? (
                    <span>{recipientName}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Buscar por nombre…
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <Input
                  placeholder="Nombre o email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {isFetching && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      Buscando…
                    </p>
                  )}
                  {!isFetching &&
                    searchQuery.trim().length >= 2 &&
                    (!searchResults || searchResults.length === 0) && (
                      <p className="py-2 text-center text-xs text-muted-foreground">
                        Sin resultados
                      </p>
                    )}
                  {searchResults?.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setValue("recipientId", u.id);
                        setValue("recipientName", u.displayName);
                        setSearchOpen(false);
                      }}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(u.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{u.displayName}</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {u.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input {...register("subject", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea rows={4} {...register("message", { required: true })} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
