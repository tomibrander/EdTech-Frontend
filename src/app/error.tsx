"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Algo salió mal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "No pudimos cargar esta sección. Reintentá en unos segundos."}
        </p>
        <Button onClick={reset} className="mt-5">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>
    </div>
  );
}
