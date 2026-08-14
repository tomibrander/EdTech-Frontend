import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassroomLinkCard, ClassroomLinkDialog } from "./ClassroomLinkCard";

const addMutateAsync = vi.fn();
const removeMutateAsync = vi.fn();
let mockCourse: { classroomCourseIds?: string[] } = {};
const mockClassroomCourses = [
  { id: "gc_1", name: "Matemática", section: "5to A" },
  { id: "gc_2", name: "Lengua", section: "5to A" },
];

vi.mock("@/features/courses/hooks", () => ({
  useCourse: () => ({ data: mockCourse }),
  useAddClassroomLink: () => ({ mutateAsync: addMutateAsync, isPending: false }),
  useRemoveClassroomLink: () => ({
    mutateAsync: removeMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/classroom/hooks", () => ({
  useClassroomCourses: () => ({ data: mockClassroomCourses }),
}));

describe("ClassroomLinkCard", () => {
  beforeEach(() => {
    addMutateAsync.mockReset();
    removeMutateAsync.mockReset();
    mockCourse = {};
  });

  it("muestra el aviso de 'no vinculado' cuando classroomCourseIds está vacío", () => {
    render(<ClassroomLinkCard courseId="course_A" />);
    expect(
      screen.getByText(/no tiene ninguna materia de Google Classroom/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /vincular materia/i }),
    ).toBeInTheDocument();
  });

  it("lista cada materia vinculada con sus links de Tareas/Notas", () => {
    mockCourse = { classroomCourseIds: ["gc_1", "gc_2"] };
    render(<ClassroomLinkCard courseId="course_A" />);
    expect(screen.getByText("Matemática")).toBeInTheDocument();
    expect(screen.getByText("Lengua")).toBeInTheDocument();

    const tareasLinks = screen.getAllByRole("link", { name: /tareas/i });
    expect(tareasLinks).toHaveLength(2);
    expect(tareasLinks[0]).toHaveAttribute(
      "href",
      "/classroom/cursos/gc_1/tareas",
    );
    expect(tareasLinks[1]).toHaveAttribute(
      "href",
      "/classroom/cursos/gc_2/tareas",
    );
  });

  it("desvincula una materia al clickear la X", async () => {
    mockCourse = { classroomCourseIds: ["gc_1"] };
    removeMutateAsync.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ClassroomLinkCard courseId="course_A" />);

    await user.click(screen.getByRole("button", { name: /desvincular/i }));

    await waitFor(() => expect(removeMutateAsync).toHaveBeenCalledWith("gc_1"));
  });
});

describe("ClassroomLinkDialog", () => {
  beforeEach(() => {
    addMutateAsync.mockReset();
    addMutateAsync.mockResolvedValue(undefined);
  });

  it("solo ofrece materias todavía no vinculadas", () => {
    render(
      <ClassroomLinkDialog
        courseId="course_A"
        linkedIds={["gc_1"]}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByText("Matemática")).not.toBeInTheDocument();
    expect(screen.getByText("Lengua — 5to A")).toBeInTheDocument();
  });

  it("llama a mutateAsync con la materia elegida al confirmar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ClassroomLinkDialog
        courseId="course_A"
        linkedIds={[]}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "gc_2");
    await user.click(screen.getByRole("button", { name: /^vincular$/i }));

    await waitFor(() => expect(addMutateAsync).toHaveBeenCalledWith("gc_2"));
  });
});
