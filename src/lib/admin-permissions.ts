export type AdminPermission =
  "dashboard" | "applications" | "responses" | "content" | "settings" | "notifications" | "users";

export type CurrentAdmin = {
  id: string;
  name: string;
  login: string;
  role: "ADMIN" | "CONTENT_MANAGER";
  canViewApplications: boolean;
  canViewResponses: boolean;
};

export function hasAdminPermission(user: CurrentAdmin, permission: AdminPermission): boolean {
  if (user.role === "ADMIN") return true;
  if (permission === "applications") return user.canViewApplications;
  if (permission === "responses") return user.canViewResponses;
  return ["dashboard", "content", "settings"].includes(permission);
}
