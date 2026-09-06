describe("site URLs", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalAdminUrl = process.env.ADMIN_BASE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    if (originalAdminUrl === undefined) delete process.env.ADMIN_BASE_URL;
    else process.env.ADMIN_BASE_URL = originalAdminUrl;
    jest.resetModules();
  });

  it("defaults to the confirmed production domain", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.ADMIN_BASE_URL;
    jest.resetModules();
    const { SITE_URL, adminRecordUrl } = await import("./site-url");
    expect(SITE_URL).toBe("https://rastishka.pro");
    expect(adminRecordUrl("applications", "record-1")).toBe(
      "https://rastishka.pro/admin/applications/record-1",
    );
  });

  it("keeps staging/local links in their environment and encodes record IDs", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.example.test/";
    process.env.ADMIN_BASE_URL = "https://staging.example.test/admin/";
    jest.resetModules();
    const { SITE_URL, adminRecordUrl } = await import("./site-url");
    expect(SITE_URL).toBe("https://staging.example.test");
    expect(adminRecordUrl("responses", "record/1")).toBe(
      "https://staging.example.test/admin/responses/record%2F1",
    );
  });
});
