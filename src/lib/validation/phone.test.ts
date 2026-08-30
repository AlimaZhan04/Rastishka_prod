import { isKnownKgOperator, phoneSchema } from "@/lib/validation/phone";

describe("phoneSchema", () => {
  it("normalizes Kyrgyz phone input to E.164", () => {
    expect(phoneSchema.parse("+996 502 123 456")).toBe("+996502123456");
  });

  it("rejects a number outside the +996 format", () => {
    expect(phoneSchema.safeParse("+7 555 123 4567").success).toBe(false);
  });

  it("recognizes a configured operator prefix without making it a form requirement", () => {
    expect(isKnownKgOperator("+996502123456")).toBe(true);
    expect(isKnownKgOperator("+996123123456")).toBe(false);
  });
});
