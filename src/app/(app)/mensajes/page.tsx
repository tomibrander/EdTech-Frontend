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
import { EmptyState } from "@/components/data/EmptyState";
import { RoleBadge } from "@/components/layout/RoleBadge";
import {
  useCreateThread,
  useSendMessage,
  useThread,
  useThreads,
} from "@/features/messages/hooks";
import { fromNow, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth/useSession";

export default function MessagesPage() {
  const { data: threads, isLoading } = useThreads();
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
                  const other = t.participants[0];
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
                          <AvatarFallback>{getInitials(other?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{other?.name}</p>
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
          data.messages.map((m) => {
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
          })
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
  const { register, handleSubmit, reset } = useForm<{
    recipientId: string;
    subject: string;
    message: string;
  }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await create.mutateAsync(values);
      toast.success("Conversación iniciada");
      setOpen(false);
      reset();
      onCreated(res.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Label>Destinatario (userId)</Label>
            <Input placeholder="usr_TEACH1" {...register("recipientId", { required: true })} />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
