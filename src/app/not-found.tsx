import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        La página que buscás no existe o fue movida.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard">Volver al inicio</Link>
      </Button>
    </div>
  );
}
