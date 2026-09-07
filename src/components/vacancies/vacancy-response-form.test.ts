/** @jest-environment jsdom */

import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { submitVacancyResponse } from "@/app/actions/vacancy-response";
import { VacancyResponseForm } from "./vacancy-response-form";

jest.mock("@/app/actions/vacancy-response", () => ({ submitVacancyResponse: jest.fn() }));

function renderForm() {
  return render(
    createElement(VacancyResponseForm, {
      vacancyId: "test-vacancy",
      sourcePage: "/vacancies/test",
    }),
  );
}

function fillTextResponse() {
  fireEvent.change(screen.getByLabelText("ФИО"), { target: { value: "Тестовый кандидат" } });
  fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "0700123456" } });
  fireEvent.change(screen.getByLabelText("Или кратко опишите опыт работы"), {
    target: { value: "Опыт работы в детском центре" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /Соглашаюсь/ }));
}

describe("public vacancy response flow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("focuses linked validation feedback before sending invalid data", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Отправить отклик" }));
    expect(submitVacancyResponse).not.toHaveBeenCalled();
    expect(
      screen.getByText("Проверьте, пожалуйста, заполнение формы.").parentElement,
    ).toHaveFocus();
    fireEvent.click(screen.getByRole("link", { name: "Минимум 2 символа" }));
    expect(screen.getByLabelText("ФИО")).toHaveFocus();
    expect(screen.getByRole("link", { name: "Прикрепите резюме или опишите опыт" })).toBeVisible();
  });

  it("lets a candidate remove an invalid attachment and submit a text-only response", async () => {
    jest.mocked(submitVacancyResponse).mockResolvedValue({ status: "success" });
    renderForm();
    const file = new File(["invalid"], "resume.exe", { type: "application/octet-stream" });
    fireEvent.change(screen.getByLabelText("Резюме"), { target: { files: [file] } });
    expect(screen.getByText("Разрешены PDF, DOC, DOCX, JPG и PNG")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Убрать файл" }));
    expect(screen.queryByText("Разрешены PDF, DOC, DOCX, JPG и PNG")).not.toBeInTheDocument();
    fillTextResponse();
    fireEvent.click(screen.getByRole("button", { name: "Отправить отклик" }));
    expect(await screen.findByText("Отклик отправлен")).toBeVisible();
    const payload = jest.mocked(submitVacancyResponse).mock.calls[0][1];
    expect(payload.get("experienceText")).toBe("Опыт работы в детском центре");
    expect(payload.get("vacancyId")).toBe("test-vacancy");
  });

  it("retains inputs and safely retries a failed network request", async () => {
    jest
      .mocked(submitVacancyResponse)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ status: "success" });
    renderForm();
    fillTextResponse();
    const form = screen.getByLabelText("ФИО").closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(await screen.findByText(/Не удалось связаться с сервером/)).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Отправить отклик" })).toBeEnabled(),
    );
    expect(submitVacancyResponse).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("ФИО")).toHaveValue("Тестовый кандидат");
    expect(screen.getByLabelText("Телефон")).toHaveValue("+996 700 123 456");
    fireEvent.submit(form);
    expect(await screen.findByText("Отклик отправлен")).toBeVisible();
    const calls = jest.mocked(submitVacancyResponse).mock.calls;
    expect(calls[1][1].get("idempotencyKey")).toBe(calls[0][1].get("idempotencyKey"));
  });
});
