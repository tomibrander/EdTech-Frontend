import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getApiErrorMessage } from "./client";

function axiosErrorWithData(data: unknown, message = "Request failed"): AxiosError {
  const err = new AxiosError(message);
  err.response = {
    data,
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return err;
}

describe("getApiErrorMessage", () => {
  it("usa el mensaje real del backend (data.message) cuando está presente", () => {
    const err = axiosErrorWithData({ message: "No tenés acceso a este alumno" });
    expect(getApiErrorMessage(err)).toBe("No tenés acceso a este alumno");
  });

  it("cae a data.error si no hay data.message", () => {
    const err = axiosErrorWithData({ error: "FORBIDDEN" });
    expect(getApiErrorMessage(err)).toBe("FORBIDDEN");
  });

  it("junta los errores de validación de class-validator (fields)", () => {
    const err = axiosErrorWithData({
      fields: [
        { field: "email", message: "email inválido" },
        { field: "name", message: "requerido" },
      ],
    });
    expect(getApiErrorMessage(err)).toBe(
      "email: email inválido · name: requerido",
    );
  });

  it("cae al mensaje genérico de axios si no hay body reconocible (el bug original)", () => {
    const err = axiosErrorWithData(undefined, "Request failed with status code 404");
    err.response!.data = {};
    expect(getApiErrorMessage(err)).toBe("Request failed with status code 404");
  });

  it("maneja errores que no son de axios", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBe("boom");
    expect(getApiErrorMessage("string plano")).toBe("Error desconocido");
  });
});
