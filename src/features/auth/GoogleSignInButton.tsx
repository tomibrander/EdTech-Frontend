"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      logo_alignment?: "left" | "center";
      locale?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

interface Props {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export function GoogleSignInButton({
  clientId,
  onCredential,
  onError,
  disabled,
  text = "continue_with",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [width, setWidth] = useState(320);

  // Si el script ya estaba cargado por un mount anterior (ej. después de
  // logout + redirect al /login), `onLoad` de <Script> no vuelve a dispararse.
  // Detectamos manualmente la presencia de window.google.accounts.id y, si no
  // está, hacemos polling corto.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    let cancelled = false;
    const start = Date.now();
    const tick = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        return;
      }
      if (Date.now() - start < 5000) {
        window.setTimeout(tick, 100);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const w = containerRef.current?.parentElement?.clientWidth ?? 320;
      setWidth(Math.max(240, Math.min(400, Math.floor(w))));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError?.("Google no devolvió credencial");
        return;
      }
      onCredential(response.credential);
    },
    [onCredential, onError],
  );

  // Se inicializa una sola vez por script/clientId/callback. Si dependiera
  // también de `width`, cada resize dispara initialize() de nuevo y GSI
  // logea "initialize() is called multiple times" (warning inofensivo, pero
  // evitable separando init de render).
  useEffect(() => {
    if (!scriptReady) return;
    if (!clientId) {
      onError?.("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }
    const accounts = window.google?.accounts.id;
    if (!accounts) return;
    accounts.initialize({
      client_id: clientId,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [scriptReady, clientId, handleCredential, onError]);

  useEffect(() => {
    if (!scriptReady) return;
    if (!containerRef.current) return;
    if (!clientId) return;
    const accounts = window.google?.accounts.id;
    if (!accounts) return;
    containerRef.current.innerHTML = "";
    accounts.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      width,
      logo_alignment: "left",
      locale: "es",
    });
  }, [scriptReady, clientId, width, text]);

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        aria-disabled={disabled}
        className={disabled ? "pointer-events-none opacity-60" : undefined}
      />
    </div>
  );
}
