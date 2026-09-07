/** @jest-environment jsdom */

import { createElement } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { submitApplication } from "@/app/actions/application";
import { useAnketa } from "@/lib/anketa-store";
import { AnketaModal } from "./anketa-modal";

jest.mock("@/app/actions/application", () => ({ submitApplication: jest.fn() }));

function next() {
  fireEvent.click(screen.getByRole("button", { name: /Далее/ }));
}

function completeContactStep() {
  fireEvent.change(screen.getByLabelText("Ваше имя"), { target: { value: "Тестовый родитель" } });
  fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "0700123456" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Соглашаюсь/ }));
}

function goToContacts() {
  next();
  next();
  next();
  next();
  fireEvent.click(screen.getByLabelText("Ест самостоятельно"));
  next();
  next();
}

describe("public application flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAnketa.setState({
      isOpen: true,
      visitFormat: undefined,
      source: { page: "/", cta: "test" },
    });
  });

  afterEach(() => {
    act(() => useAnketa.getState().close());
  });

  it("validates the current step on submit and preserves answers when going back", async () => {
    useAnketa.setState({ visitFormat: "INDIVIDUAL" });
    render(createElement(AnketaModal));
    const note = screen.getByLabelText("Пожелания по графику");
    const form = note.closest("form")!;

    fireEvent.submit(form);
    expect(screen.getByText("Опишите желаемый график")).toBeVisible();
    // react-hook-form 7.80 defers setFocus to a timer after the input is mounted.
    await waitFor(() => expect(note).toHaveFocus());
    expect(submitApplication).not.toHaveBeenCalled();

    fireEvent.change(note, { target: { value: "По будням после обеда" } });
    await waitFor(() =>
      expect(screen.queryByText("Опишите желаемый график")).not.toBeInTheDocument(),
    );
    fireEvent.submit(form);
    expect(screen.getByText("Шаг 2 из 7")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Назад/ }));
    expect(screen.getByLabelText("Пожелания по графику")).toHaveValue("По будням после обеда");

    fireEvent.click(screen.getByRole("button", { name: "Закрыть анкету" }));
    act(() => useAnketa.getState().open({ visitFormat: "MORNING" }));
    expect(screen.getByText("Шаг 1 из 7")).toBeVisible();
    expect(screen.getByLabelText("Группа утро, 8:00–13:00")).toBeChecked();
    expect(screen.queryByLabelText("Пожелания по графику")).not.toBeInTheDocument();
  });

  it("requires food choices and sends all seven steps exactly once while pending", async () => {
    let resolveSubmission!: (value: { status: "success" }) => void;
    jest.mocked(submitApplication).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    render(createElement(AnketaModal));
    next();
    next();
    next();
    next();
    next();
    expect(screen.getByText("Шаг 5 из 7")).toBeVisible();
    expect(screen.getByText("Выберите хотя бы один вариант")).toBeVisible();
    fireEvent.click(screen.getByLabelText("Ест самостоятельно"));
    next();
    next();
    completeContactStep();

    const form = screen.getByLabelText("Ваше имя").closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(submitApplication).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Закрыть анкету" })).toBeDisabled();
    const payload = jest.mocked(submitApplication).mock.calls[0][1];
    expect(payload.get("parentName")).toBe("Тестовый родитель");
    expect(payload.get("phone")).toBe("+996 700 123 456");
    expect(payload.getAll("food")).toEqual(["INDEPENDENT"]);
    expect(payload.get("sourceCta")).toBe("test");
    expect(payload.get("idempotencyKey")).toMatch(/^application_/);
    await act(async () => resolveSubmission({ status: "success" }));
    expect(await screen.findByText("Анкета отправлена")).toBeVisible();
  });

  it("reveals and focuses a previous step when the server rejects its field", async () => {
    jest.mocked(submitApplication).mockResolvedValue({
      status: "error",
      message: "Проверьте анкету",
      fieldErrors: { visitFormat: "Выберите формат" },
    });
    render(createElement(AnketaModal));
    goToContacts();
    completeContactStep();
    fireEvent.click(screen.getByRole("button", { name: "Отправить анкету" }));
    expect(await screen.findByText("Выберите формат")).toBeVisible();
    expect(screen.getByText("Шаг 1 из 7")).toBeVisible();
    await waitFor(() =>
      expect(screen.getByLabelText("Группа полного дня, 8:00–19:00")).toHaveFocus(),
    );
  });

  it("keeps answers and the idempotency key after a network failure", async () => {
    jest
      .mocked(submitApplication)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ status: "success" });
    render(createElement(AnketaModal));
    goToContacts();
    completeContactStep();
    fireEvent.click(screen.getByRole("button", { name: "Отправить анкету" }));
    expect(await screen.findByText(/Не удалось связаться с сервером/)).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Отправить анкету" })).toBeEnabled(),
    );
    expect(screen.getByLabelText("Ваше имя")).toHaveValue("Тестовый родитель");
    fireEvent.click(screen.getByRole("button", { name: "Отправить анкету" }));
    expect(await screen.findByText("Анкета отправлена")).toBeVisible();
    const calls = jest.mocked(submitApplication).mock.calls;
    expect(calls[1][1].get("idempotencyKey")).toBe(calls[0][1].get("idempotencyKey"));
  });
});
