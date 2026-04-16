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
import { useCreateJobApplication } from "@/features/admissions/hooks";
import {
  jobApplicationSchema,
  type JobApplicationValues,
} from "@/features/admissions/schemas";

export default function PublicJobApplicationPage() {
  const create = useCreateJobApplication();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobApplicationValues>({ resolver: zodResolver(jobApplicationSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success("Postulación recibida");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos enviar la postulación");
    }
  });

  if (create.isSuccess) {
    return (
      <section className="container max-w-xl py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-2xl font-semibold">¡Recibimos tu postulación!</h1>
        <p className="mt-2 text-muted-foreground">
          Vamos a revisar tu CV y te contactaremos si tu perfil encaja con la búsqueda.
        </p>
      </section>
    );
  }

  return (
    <section className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Postulación laboral</CardTitle>
          <CardDescription>
            Dejanos tus datos y una breve presentación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Posición a la que aplicás" error={errors.position?.message}>
                <Input placeholder="Ej: Docente de Matemática" {...register("position")} />
              </Field>
              <Field label="Nombre completo" error={errors.applicantName?.message}>
                <Input {...register("applicantName")} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" {...register("email")} />
              </Field>
              <Field label="Teléfono" error={errors.phone?.message}>
                <Input type="tel" {...register("phone")} />
              </Field>
            </div>
            <Field label="URL del CV (Drive, etc.)" error={errors.cvUrl?.message}>
              <Input type="url" placeholder="https://drive.google.com/..." {...register("cvUrl")} />
            </Field>
            <Field label="Carta de presentación" error={errors.coverLetter?.message}>
              <Textarea rows={5} {...register("coverLetter")} />
            </Field>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar postulación
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
