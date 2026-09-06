import { optionalImageUrlSchema } from "./admin-content-validation";
import { formatAdminDateInput } from "./admin-labels";

it.each(["", "/images/rastishka-hero-v1.png", "https://images.example.com/photo.jpg"])(
  "allows existing image source %s",
  (source) => {
    expect(optionalImageUrlSchema.safeParse(source).success).toBe(true);
  },
);

it.each([
  "javascript:alert(1)",
  "//external.example/image.png",
  "/\\external.example/image.png",
  "data:image/svg+xml,test",
])("rejects unsafe image source %s", (source) => {
  expect(optionalImageUrlSchema.safeParse(source).success).toBe(false);
});

it("uses the Bishkek date after local midnight even while UTC is still yesterday", () => {
  expect(formatAdminDateInput(new Date("2026-09-06T23:45:00Z"))).toBe("2026-09-07");
});
