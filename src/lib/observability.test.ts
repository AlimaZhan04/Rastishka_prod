import { sanitizeLogMetadata } from "@/lib/observability";

describe("sanitizeLogMetadata", () => {
  it("redacts sensitive fields and removes query parameters from paths", () => {
    expect(
      sanitizeLogMetadata({
        operation: "get_site_settings",
        parentName: "Тестовый родитель",
        path: "/application?phone=%2B996502123456",
        telegramToken: "secret",
      }),
    ).toEqual({
      operation: "get_site_settings",
      parentName: "[redacted]",
      path: "/application",
      telegramToken: "[redacted]",
    });
  });
});
