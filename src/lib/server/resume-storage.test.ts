import { prisma } from "@/lib/db";
import { fileTypeFromBuffer } from "file-type";
import { getResumeDownloadUrl, InvalidResumeContentError, prepareResume } from "./resume-storage";
import { MAX_RESUME_BYTES } from "@/lib/validation/file";

jest.mock("server-only", () => ({}));
jest.mock("@/lib/db", () => ({ prisma: { resumeFile: { findUnique: jest.fn() } } }));
jest.mock("file-type", () => ({ fileTypeFromBuffer: jest.fn() }));

describe("PostgreSQL resume preparation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("prepares exact binary bytes without creating a database record", async () => {
    jest.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: "pdf", mime: "application/pdf" });
    const file = new File(["%PDF-1.7\nresume"], "Резюме.pdf", { type: "application/pdf" });
    const prepared = await prepareResume(file);
    expect(prepared).toMatchObject({ fileName: file.name, mimeType: file.type, size: file.size });
    expect(prepared.key).toMatch(/^[0-9a-f-]{36}$/);
    expect(prepared.content).toEqual(new Uint8Array(await file.arrayBuffer()));
    expect(prisma.resumeFile.findUnique).not.toHaveBeenCalled();
  });

  it("rejects unknown binary content even when the extension and MIME look valid", async () => {
    jest.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);
    await expect(
      prepareResume(new File(["not pdf"], "resume.pdf", { type: "application/pdf" })),
    ).rejects.toBeInstanceOf(InvalidResumeContentError);
  });

  it("rejects oversize files before reading bytes", async () => {
    const file = {
      name: "resume.pdf",
      type: "application/pdf",
      size: MAX_RESUME_BYTES + 1,
      arrayBuffer: jest.fn(),
    };
    await expect(prepareResume(file as unknown as File)).rejects.toBeInstanceOf(
      InvalidResumeContentError,
    );
    expect(file.arrayBuffer).not.toHaveBeenCalled();
  });

  it("rejects content detected as another format", async () => {
    jest.mocked(fileTypeFromBuffer).mockResolvedValue({ ext: "png", mime: "image/png" });
    await expect(
      prepareResume(new File(["wrong format"], "resume.pdf", { type: "application/pdf" })),
    ).rejects.toBeInstanceOf(InvalidResumeContentError);
  });

  it("looks up only metadata when linking the admin download", async () => {
    jest.mocked(prisma.resumeFile.findUnique).mockResolvedValue({ id: "file-id" } as never);
    expect(await getResumeDownloadUrl("file-id")).toBe("/api/admin/resumes/file-id");
    expect(prisma.resumeFile.findUnique).toHaveBeenCalledWith({
      where: { id: "file-id" },
      select: { id: true },
    });
    jest.mocked(prisma.resumeFile.findUnique).mockResolvedValue(null);
    expect(await getResumeDownloadUrl("legacy-external-key")).toBeNull();
  });
});
