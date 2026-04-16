"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, GraduationCap, BookOpen, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantConfig } from "@/config/tenant.config";
import { DASHBOARD_PATH, type Role } from "@/config/roles";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("from");
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login.mutateAsync(values);
      toast.success(`Bienvenido, ${res.user.displayName}`);
      router.replace(redirectTo ?? DASHBOARD_PATH[res.user.role as Role]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Credenciales inválidas");
    }
  });

  return (
    <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          {tenantConfig.shortName}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {tenantConfig.textos.heroLine}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Gestioná cursos, tareas, exámenes, asistencia y comunicación con las
          familias desde un solo lugar, con integración a Google Workspace y
          Classroom.
        </p>
        <ul className="mt-8 space-y-4">
          <Feature icon={GraduationCap} title="Panel por rol">
            Alumnos, padres, docentes y directores acceden solo a lo que necesitan.
          </Feature>
          <Feature icon={BookOpen} title="Classroom nativo">
            Tareas, exámenes y calificaciones sincronizadas con Google Classroom.
          </Feature>
          <Feature icon={MessageSquare} title="Familias conectadas">
            Mensajería padre-docente y anuncios con ventana horaria configurable.
          </Feature>
        </ul>
      </div>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{tenantConfig.textos.loginTitle}</CardTitle>
          <CardDescription>{tenantConfig.textos.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={`nombre@${tenantConfig.domain}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Ingresar
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link href="/admision/prospecto" className="text-primary hover:underline">
              Solicitar admisión
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
