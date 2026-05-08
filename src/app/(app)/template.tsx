"use client";

/**
 * `template.tsx` re-monta en cada navegación dentro del segmento (app),
 * por eso las clases de `tailwindcss-animate` se disparan cada vez.
 * No usar `layout.tsx` para esto — layout NO se re-monta.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out">
      {children}
    </div>
  );
}
