"use client";
import Link from "next/link";
import { MessageSquare, Megaphone, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/useSession";

export default function ParentDashboardPage() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${user?.displayName ?? ""}`}
        description="Mantenete en contacto con los docentes y al tanto de novedades."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-primary" /> Mensajes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Consultá con los docentes sobre tareas, exámenes o lo que necesites.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/mensajes">Abrir mensajes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-5 w-5 text-primary" /> Anuncios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Novedades del colegio y del curso de tus hijos.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/anuncios">Ver anuncios</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" /> Asistente IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Preguntá en lenguaje natural sobre próximos exámenes y tareas.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/classroom/asistente">Abrir asistente</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
