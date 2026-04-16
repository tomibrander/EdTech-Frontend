"use client";
import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ClipboardList, Loader2, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/data/EmptyState";
import { useCourseWork, useCreateCourseWork } from "@/features/classroom/hooks";
import { formatDate, fromNow } from "@/lib/utils";

export default function CourseWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [type, setType] = React.useState<"all" | "task" | "exam">("all");
  const { data, isLoading } = useCourseWork(id, type);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/classroom">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>
      <PageHeader
        title="Tareas y exámenes"
        description={`Curso ${id}`}
        actions={<NewWorkDialog courseId={id} />}
      />

      <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="task">Tareas</TabsTrigger>
          <TabsTrigger value="exam">Exámenes</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={w.type === "exam" ? "destructive" : "default"}>
                      {w.type === "exam" ? "Examen" : "Tarea"}
                    </Badge>
                    {w.state && <Badge variant="muted">{w.state}</Badge>}
                  </div>
                  <p className="mt-2 font-semibold">{w.title}</p>
                  {w.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{w.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Vence {formatDate(w.dueDate)} · {fromNow(w.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Puntos</p>
                  <p className="text-lg font-semibold">{w.maxPoints}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="Sin trabajos" />
      )}
    </div>
  );
}

function NewWorkDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = React.useState(false);
  const create = useCreateCourseWork(courseId);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<{
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string;
    maxPoints: number;
    type: "task" | "exam";
  }>({ defaultValues: { type: "task", maxPoints: 10 } });

  const type = watch("type");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        ...values,
        maxPoints: Number(values.maxPoints),
      });
      toast.success("Trabajo creado");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nueva tarea/examen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear tarea o examen</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => setValue("type", v as "task" | "exam")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Tarea</SelectItem>
                <SelectItem value="exam">Examen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder={
                type === "exam" ? "Ej: Números romanos" : "Ej: Ejercicios capítulo 3"
              }
              {...register("title", { required: true })}
            />
            <p className="text-xs text-muted-foreground">
              Si es examen, se guardará con el prefijo {'"[EXAMEN]"'}.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea rows={3} {...register("description")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" {...register("dueDate", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" {...register("dueTime")} />
            </div>
            <div className="space-y-2">
              <Label>Puntos máx</Label>
              <Input type="number" min={1} {...register("maxPoints", { valueAsNumber: true })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
