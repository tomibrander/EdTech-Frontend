import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RoleGate } from "./RoleGate";

const replace = vi.fn();
let mockRole: string | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/anuncios",
}));

vi.mock("@/features/auth/useSession", () => ({
  useSession: () => ({ role: mockRole }),
}));

describe("RoleGate", () => {
  beforeEach(() => {
    replace.mockClear();
    mockRole = undefined;
  });

  it("renderiza los children cuando el rol tiene permiso", async () => {
    mockRole = "docente";
    render(
      <RoleGate roles={["docente", "director"]}>
        <p>Contenido protegido</p>
      </RoleGate>,
    );
    await waitFor(() => expect(screen.getByText("Contenido protegido")).toBeInTheDocument());
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirige a acceso-denegado cuando el rol no tiene permiso y no hay fallback", async () => {
    mockRole = "alumno";
    render(
      <RoleGate roles={["docente", "director"]}>
        <p>Contenido protegido</p>
      </RoleGate>,
    );
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        expect.stringContaining("/acceso-denegado"),
      ),
    );
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("con fallback, renderiza el fallback y NO redirige (regresión del bug de Anuncios)", async () => {
    mockRole = "alumno";
    render(
      <RoleGate roles={["docente", "director"]} fallback={null}>
        <button>Nuevo anuncio</button>
      </RoleGate>,
    );
    await waitFor(() => {
      expect(screen.queryByText("Nuevo anuncio")).not.toBeInTheDocument();
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
