import {
  getApplicationFieldErrors,
  parseApplicationFormData,
  validateSubmissionGuard,
} from "@/lib/application-submission";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("visitFormat", "INDIVIDUAL");
  formData.set("individualNote", "Будни после обеда");
  formData.set("speech", "DELAYED");
  formData.set("behavior", "HAS_ISSUES");
  formData.set("behaviorNote", "Нужна мягкая адаптация");
  formData.set("toilet", "NEEDS_PROMPTING");
  formData.append("food", "INDEPENDENT");
  formData.append("food", "SELECTIVE");
  formData.set("previousExperience", "NONE");
  formData.set("parentName", "Тестовый родитель");
  formData.set("phone", "+996 700 123 456");
  formData.set("consent", "on");
  formData.set("sourcePage", "/");
  formData.set("sourceCta", "hero");
  return formData;
}

describe("application form payload", () => {
  it("normalizes a valid form payload before it reaches persistence", () => {
    const parsed = parseApplicationFormData(validFormData());

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.phone).toBe("+996700123456");
    expect(parsed.data.food).toEqual(["INDEPENDENT", "SELECTIVE"]);
    expect(parsed.data.source).toMatchObject({ page: "/", cta: "hero" });
  });

  it("returns a field-specific error when an individual schedule is missing", () => {
    const formData = validFormData();
    formData.delete("individualNote");
    const parsed = parseApplicationFormData(formData);

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(getApplicationFieldErrors(parsed.error)).toMatchObject({
      individualNote: "Опишите желаемый график",
    });
  });

  it("rejects invalid idempotency keys and the honeypot", () => {
    const formData = validFormData();
    expect(validateSubmissionGuard(formData).ok).toBe(false);
    formData.set("idempotencyKey", "application_form_test_key_001");
    formData.set("website", "bot");
    expect(validateSubmissionGuard(formData).ok).toBe(false);
  });
});
