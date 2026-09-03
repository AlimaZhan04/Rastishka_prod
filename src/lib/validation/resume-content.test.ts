import { isDetectedResumeTypeCompatible } from "@/lib/validation/resume-content";

describe("isDetectedResumeTypeCompatible", () => {
  it("accepts a DOCX detected as an Office Open XML document", () => {
    expect(
      isDetectedResumeTypeCompatible({
        extension: ".docx",
        declaredMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        detectedMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ).toBe(true);
  });

  it("rejects a generic ZIP renamed to DOCX", () => {
    expect(
      isDetectedResumeTypeCompatible({
        extension: ".docx",
        declaredMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        detectedMime: "application/zip",
      }),
    ).toBe(false);
  });

  it("accepts the compound-file signature used by legacy DOC files", () => {
    expect(
      isDetectedResumeTypeCompatible({
        extension: ".doc",
        declaredMime: "application/msword",
        detectedMime: "application/x-cfb",
      }),
    ).toBe(true);
  });

  it("rejects content when the binary type cannot be detected", () => {
    expect(
      isDetectedResumeTypeCompatible({
        extension: ".pdf",
        declaredMime: "application/pdf",
        detectedMime: undefined,
      }),
    ).toBe(false);
  });
});
