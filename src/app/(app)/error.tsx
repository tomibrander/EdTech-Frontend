"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-3 text-base font-semibold">Error al cargar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "No pudimos obtener los datos."}
        </p>
        <Button onClick={reset} size="sm" className="mt-4">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>
    </div>
  );
}
