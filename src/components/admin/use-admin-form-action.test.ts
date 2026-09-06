/** @jest-environment jsdom */
import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useAdminFormAction } from "./use-admin-form-action";

function TestForm({ success, fail }: { success: boolean; fail?: boolean }) {
  const { state, action, pending, formRef } = useAdminFormAction(
    async () => {
      if (fail) throw new TypeError("Failed to fetch");
      return { success, message: success ? "Saved" : "Duplicate slug" };
    },
    { success: false, message: "" },
  );
  return createElement(
    "form",
    { action, ref: formRef },
    createElement("input", { name: "title", "aria-label": "Title", defaultValue: "" }),
    createElement("button", { type: "submit", disabled: pending }, "Save"),
    state.message
      ? createElement("p", { role: success ? "status" : "alert", tabIndex: -1 }, state.message)
      : null,
  );
}

it("retains entered fields and focuses the error after failed server validation", async () => {
  render(createElement(TestForm, { success: false }));
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Do not lose my draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Title")).toHaveValue("Do not lose my draft");
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  await waitFor(() => expect(screen.getByRole("alert")).toHaveFocus());
});

it("allows successful create forms to reset", async () => {
  render(createElement(TestForm, { success: true }));
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Created user" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("status");
  expect(screen.getByLabelText("Title")).toHaveValue("");
});

it("keeps a draft editable when the network request fails", async () => {
  render(createElement(TestForm, { success: false, fail: true }));
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Offline draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("Проверьте соединение");
  expect(screen.getByLabelText("Title")).toHaveValue("Offline draft");
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
});
