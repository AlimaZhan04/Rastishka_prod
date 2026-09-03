import { parseVacancyResponseFormData } from "@/lib/vacancy-response-submission";
import { MAX_RESUME_BYTES, validateResumeFile } from "@/lib/validation/file";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("vacancyId", "vacancy_test_001");
  formData.set("name", "Тестовый кандидат");
  formData.set("phone", "+996 700 123 456");
  formData.set("experienceText", "Работаю логопедом-дефектологом более двух лет.");
  formData.set("consent", "on");
  formData.set("sourcePage", "/vacancies/logoped-defektolog");
  return formData;
}

describe("vacancy response payload", () => {
  it("normalizes a text-only response before persistence", () => {
    const parsed = parseVacancyResponseFormData(validFormData());

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.phone).toBe("+996700123456");
    expect(parsed.data.resume).toBeUndefined();
    expect(parsed.data.source?.page).toBe("/vacancies/logoped-defektolog");
  });

  it("requires either a resume or experience text", () => {
    const formData = validFormData();
    formData.delete("experienceText");
    const parsed = parseVacancyResponseFormData(formData);

    expect(parsed).toMatchObject({
      success: false,
      fieldErrors: { experienceText: "Прикрепите резюме или опишите опыт" },
    });
  });

  it("returns human-readable errors for required contact fields", () => {
    const formData = validFormData();
    formData.delete("name");
    formData.delete("phone");
    const parsed = parseVacancyResponseFormData(formData);

    expect(parsed).toMatchObject({
      success: false,
      fieldErrors: {
        name: "Минимум 2 символа",
        phone: "Введите номер в формате +996 XXX XXX XXX",
      },
    });
  });

  it("rejects a resume that exceeds the allowed size or has a mismatched type", () => {
    expect(
      validateResumeFile({
        name: "resume.pdf",
        type: "application/pdf",
        size: MAX_RESUME_BYTES + 1,
      }),
    ).toMatchObject({ ok: false, message: "Размер файла не должен превышать 10 МБ" });
    expect(validateResumeFile({ name: "resume.pdf", type: "image/png", size: 100 })).toMatchObject({
      ok: false,
      message: "Тип файла не соответствует его расширению",
    });
  });
});
