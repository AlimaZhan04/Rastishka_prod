import { adminPageHref, parseAdminListQuery } from "./admin-list-query";
import { APPLICATION_STATUS_LABELS } from "./admin-labels";

it("supports status, name or phone search, and pages beyond the old 100-row cutoff", () => {
  expect(
    parseAdminListQuery(
      { q: "  +996 502 114 888  ", status: "ARCHIVED", page: "5" },
      APPLICATION_STATUS_LABELS,
    ),
  ).toEqual({ q: "+996 502 114 888", status: "ARCHIVED", page: 5 });
});

it.each([
  { status: "invalid", page: "-4" },
  { status: "toString", page: "Infinity" },
  { status: ["NEW", "ARCHIVED"], page: ["2", "3"] },
])("normalizes malformed or repeated query parameters: %j", (query) => {
  expect(parseAdminListQuery(query, APPLICATION_STATUS_LABELS)).toEqual({
    q: "",
    status: undefined,
    page: 1,
  });
});

it("bounds query length and page offsets", () => {
  const result = parseAdminListQuery(
    { q: "x".repeat(300), page: "9".repeat(300) },
    APPLICATION_STATUS_LABELS,
  );
  expect(result.q).toHaveLength(120);
  expect(result.page).toBe(1_000_000);
});

it("keeps filters encoded while navigating pages", () => {
  const href = adminPageHref("/admin/applications", { q: "Иван & Мария", status: "NEW" }, 2);
  const url = new URL(href, "https://rastishka.pro");
  expect(url.searchParams.get("q")).toBe("Иван & Мария");
  expect(url.searchParams.get("status")).toBe("NEW");
  expect(url.searchParams.get("page")).toBe("2");
  expect(adminPageHref("/admin/news", { q: "" }, 1)).toBe("/admin/news");
});
