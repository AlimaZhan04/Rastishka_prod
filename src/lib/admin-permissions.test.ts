import { hasAdminPermission, type CurrentAdmin } from "@/lib/admin-permissions";

const manager: CurrentAdmin = {
  id: "manager-1",
  name: "Контент-менеджер",
  login: "manager",
  role: "CONTENT_MANAGER",
  canViewApplications: false,
  canViewResponses: true,
};

describe("admin permissions", () => {
  it("allows an administrator to use every admin module", () => {
    const admin = { ...manager, role: "ADMIN" as const };
    for (const permission of [
      "dashboard",
      "applications",
      "responses",
      "content",
      "settings",
      "notifications",
      "users",
    ] as const) {
      expect(hasAdminPermission(admin, permission)).toBe(true);
    }
  });

  it("limits a content manager according to explicit PII permissions", () => {
    expect(hasAdminPermission(manager, "dashboard")).toBe(true);
    expect(hasAdminPermission(manager, "content")).toBe(true);
    expect(hasAdminPermission(manager, "settings")).toBe(true);
    expect(hasAdminPermission(manager, "applications")).toBe(false);
    expect(hasAdminPermission(manager, "responses")).toBe(true);
    expect(hasAdminPermission(manager, "notifications")).toBe(false);
    expect(hasAdminPermission(manager, "users")).toBe(false);
  });
});
