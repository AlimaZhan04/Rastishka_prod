"use client";

import { useActionState, useEffect, useRef } from "react";
import { unstable_rethrow } from "next/navigation";

/** React resets uncontrolled forms when an action returns, including validation errors. */
export function useAdminFormAction<State extends { success?: boolean; message?: string }>(
  serverAction: (previousState: State, formData: FormData) => Promise<State>,
  initialState: Awaited<State>,
) {
  const preserveValues = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<State, FormData>(
    async (previousState, formData): Promise<State> => {
      preserveValues.current = true;
      try {
        const result = await serverAction(previousState, formData);
        preserveValues.current = !result.success;
        return result;
      } catch (error) {
        unstable_rethrow(error);
        return {
          ...previousState,
          success: false,
          message:
            "Не удалось завершить действие. Введённые данные остались в форме. Проверьте соединение и повторите попытку.",
        };
      }
    },
    initialState,
  );

  useEffect(() => {
    const form = formRef.current;
    function preventFailedReset(event: Event) {
      if (preserveValues.current) event.preventDefault();
    }
    // React suppresses its synthetic events while committing its own form reset.
    form?.addEventListener("reset", preventFailedReset);
    return () => form?.removeEventListener("reset", preventFailedReset);
  }, []);

  useEffect(() => {
    if (state.message && !state.success) {
      formRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
    }
  }, [state]);

  return { state, action, pending, formRef };
}
