import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassroomLinkCard, ClassroomLinkDialog } from "./ClassroomLinkCard";

const mutateAsync = vi.fn();
let mockCourse: { classroomCourseId?: string } = {};
const mockClassroomCourses = [
  { id: "gc_1", name: "Matemática", section: "5to A" },
  { id: "gc_2", name: "Lengua", section: "5to A" },
];

vi.mock("@/features/courses/hooks", () => ({
  useCourse: () => ({ data: mockCourse }),
  useLinkClassroomCourse: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/features/classroom/hooks", () => ({
  useClassroomCourses: () => ({ data: mockClassroomCourses }),
}));

describe("ClassroomLinkCard", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mockCourse = {};
  });

  it("muestra el aviso de 'no vinculado' y el botón para vincular cuando no hay classroomCourseId", () => {
    render(<ClassroomLinkCard courseId="course_A" />);
    expect(
      screen.getByText(/todavía no está vinculado a una materia/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /vincular a classroom/i }),
    ).toBeInTheDocument();
  });

  it("muestra el nombre de la materia y los links de Tareas/Notas cuando ya está vinculado", () => {
    mockCourse = { classroomCourseId: "gc_1" };
    render(<ClassroomLinkCard courseId="course_A" />);
    expect(screen.getByText("Matemática")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tareas/i })).toHaveAttribute(
      "href",
      "/classroom/cursos/gc_1/tareas",
    );
    expect(screen.getByRole("link", { name: /notas/i })).toHaveAttribute(
      "href",
      "/classroom/cursos/gc_1/calificaciones",
    );
  });
});

describe("ClassroomLinkDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("llama a mutateAsync con el classroomCourseId elegido al confirmar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ClassroomLinkDialog
        courseId="course_A"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "gc_2");
    await user.click(screen.getByRole("button", { name: /^vincular$/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("gc_2"));
  });

  it("el botón de vincular está deshabilitado sin selección", () => {
    render(
      <ClassroomLinkDialog courseId="course_A" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /^vincular$/i })).toBeDisabled();
  });
});
