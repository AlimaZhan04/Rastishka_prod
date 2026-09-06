import { updateApplicationWorkflow, updateResponseWorkflow } from "./admin-workflow";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { writeAdminAudit } from "@/lib/server/admin-audit";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/db", () => ({
  prisma: {
    adminUser: { findFirst: jest.fn() },
    application: { findUnique: jest.fn(), update: jest.fn() },
    vacancyResponse: { findUnique: jest.fn(), update: jest.fn() },
  },
}));
jest.mock("@/lib/server/admin-auth", () => ({ requireAdminAction: jest.fn() }));
jest.mock("@/lib/server/admin-audit", () => ({ writeAdminAudit: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(requireAdminAction).mockResolvedValue({ id: "actor" } as never);
  jest
    .mocked(prisma.application.findUnique)
    .mockResolvedValue({ status: "NEW", adminComment: null, responsibleId: null } as never);
  jest
    .mocked(prisma.vacancyResponse.findUnique)
    .mockResolvedValue({ status: "NEW", adminComment: null, responsibleId: null } as never);
});

function form(status: string, responsibleId = "") {
  const data = new FormData();
  data.set("id", "record-1");
  data.set("status", status);
  data.set("responsibleId", responsibleId);
  data.set("adminComment", "  Проверено администратором  ");
  return data;
}

it.each(["NEW", "IN_PROGRESS", "CONTACTED", "ENROLLED", "REJECTED", "ARCHIVED"])(
  "saves application status %s, comment, audit and refreshed list",
  async (status) => {
    expect(await updateApplicationWorkflow({}, form(status))).toMatchObject({ success: true });
    expect(requireAdminAction).toHaveBeenCalledWith("applications");
    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: "record-1" },
      data: { status, adminComment: "Проверено администратором", responsibleId: null },
    });
    expect(writeAdminAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        diff: expect.objectContaining({ fromStatus: "NEW", toStatus: status }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/applications");
  },
);

it.each(["NEW", "IN_REVIEW", "INVITED", "REJECTED", "ARCHIVED"])(
  "saves response status %s",
  async (status) => {
    expect(await updateResponseWorkflow({}, form(status))).toMatchObject({ success: true });
    expect(requireAdminAction).toHaveBeenCalledWith("responses");
    expect(prisma.vacancyResponse.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status }) }),
    );
  },
);

it.each([
  [updateApplicationWorkflow, "canViewApplications"],
  [updateResponseWorkflow, "canViewResponses"],
] as const)("refuses inactive or unauthorized assignees", async (action, permission) => {
  jest.mocked(prisma.adminUser.findFirst).mockResolvedValue(null);
  expect(await action({}, form("NEW", "no-access"))).toMatchObject({
    fieldErrors: { responsibleId: expect.any(String) },
  });
  expect(prisma.adminUser.findFirst).toHaveBeenCalledWith({
    where: { id: "no-access", active: true, OR: [{ role: "ADMIN" }, { [permission]: true }] },
    select: { id: true },
  });
  expect(prisma.application.update).not.toHaveBeenCalled();
  expect(prisma.vacancyResponse.update).not.toHaveBeenCalled();
});

it("returns validation errors without a server exception or mutation", async () => {
  expect(await updateApplicationWorkflow({}, form("INVITED"))).toMatchObject({
    fieldErrors: { status: expect.any(String) },
  });
  const data = form("NEW");
  data.set("adminComment", "x".repeat(5001));
  expect(await updateResponseWorkflow({}, data)).toMatchObject({
    fieldErrors: { adminComment: expect.any(String) },
  });
  expect(prisma.application.update).not.toHaveBeenCalled();
  expect(prisma.vacancyResponse.update).not.toHaveBeenCalled();
});

it("enforces access before reading or writing a record", async () => {
  jest.mocked(requireAdminAction).mockRejectedValue(new Error("Forbidden"));
  await expect(updateApplicationWorkflow({}, form("NEW"))).rejects.toThrow("Forbidden");
  expect(prisma.application.findUnique).not.toHaveBeenCalled();
});
