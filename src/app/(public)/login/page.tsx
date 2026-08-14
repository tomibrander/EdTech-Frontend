"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tenantConfig } from "@/config/tenant.config";
import { DASHBOARD_PATH, type Role } from "@/config/roles";
import { useGoogleLogin, useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { getApiErrorMessage } from "@/lib/api/client";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

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
  const googleLogin = useGoogleLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const handleSuccess = (user: { displayName: string; role: string }) => {
    toast.success(`Bienvenido, ${user.displayName}`);
    router.replace(redirectTo ?? DASHBOARD_PATH[user.role as Role] ?? "/dashboard");
    router.refresh();
  };

  const onSubmitPassword = handleSubmit(async (values) => {
    try {
      const res = await login.mutateAsync(values);
      handleSuccess(res.user);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  });

  const handleGoogleCredential = async (idToken: string) => {
    try {
      const res = await googleLogin.mutateAsync(idToken);
      handleSuccess(res.user);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

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

      <div className="mx-auto w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {tenantConfig.textos.loginTitle}
            </CardTitle>
            <CardDescription>
              Ingresá con tu cuenta institucional de Google.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {GOOGLE_CLIENT_ID ? (
              <div className="flex w-full justify-center">
                <GoogleSignInButton
                  clientId={GOOGLE_CLIENT_ID}
                  onCredential={handleGoogleCredential}
                  disabled={googleLogin.isPending}
                  onError={(m) => toast.error(m)}
                />
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
                Falta configurar <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> en
                <code> .env.local</code> para habilitar el inicio de sesión con
                Google.
              </p>
            )}
            {googleLogin.isPending && (
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando con Google…
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Solo cuentas del dominio{" "}
              <span className="font-medium">@{tenantConfig.domain}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-primary" />
              ¿Sos padre o madre? Ingresá acá
            </CardTitle>
            <CardDescription>
              Si no tenés cuenta institucional, usá el email y contraseña que te
              dio el colegio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
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
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ingresar
              </Button>
            </form>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link
                href="/admision/prospecto"
                className="text-primary hover:underline"
              >
                Solicitar admisión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
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
