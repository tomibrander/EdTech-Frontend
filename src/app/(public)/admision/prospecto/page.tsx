"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateProspect } from "@/features/admissions/hooks";
import { prospectCreateSchema, type ProspectCreateValues } from "@/features/admissions/schemas";
import { tenantConfig } from "@/config/tenant.config";

export default function PublicProspectFormPage() {
  const create = useCreateProspect();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProspectCreateValues>({ resolver: zodResolver(prospectCreateSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success("Recibimos tu solicitud. Te vamos a contactar por email.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos registrar la solicitud");
    }
  });

  if (create.isSuccess) {
    return (
      <section className="container max-w-xl py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-2xl font-semibold">¡Recibimos tu solicitud!</h1>
        <p className="mt-2 text-muted-foreground">
          Te vamos a contactar al email que dejaste para coordinar la entrevista.
        </p>
      </section>
    );
  }

  return (
    <section className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Solicitud de admisión</CardTitle>
          <CardDescription>
            Completá los datos del postulante y un miembro del equipo de{" "}
            {tenantConfig.name} se pondrá en contacto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del alumno" error={errors.studentName?.message}>
                <Input {...register("studentName")} />
              </Field>
              <Field label="Fecha de nacimiento" error={errors.birthDate?.message}>
                <Input type="date" {...register("birthDate")} />
              </Field>
            </div>

            <Field label="Grado al que aplica" error={errors.gradeApplying?.message}>
              <Input
                placeholder="Ej: 2do primaria"
                {...register("gradeApplying")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del adulto responsable" error={errors.parentName?.message}>
                <Input {...register("parentName")} />
              </Field>
              <Field label="Email de contacto" error={errors.parentEmail?.message}>
                <Input type="email" {...register("parentEmail")} />
              </Field>
            </div>

            <Field label="Teléfono" error={errors.parentPhone?.message}>
              <Input type="tel" placeholder="+54 11 ..." {...register("parentPhone")} />
            </Field>

            <Field label="Notas adicionales" error={errors.notes?.message}>
              <Textarea
                placeholder="Contanos algo sobre el alumno, escolaridad previa, etc."
                rows={4}
                {...register("notes")}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar solicitud
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
