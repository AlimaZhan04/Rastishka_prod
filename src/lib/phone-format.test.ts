import { formatKgPhone } from "@/lib/phone-format";

describe("formatKgPhone", () => {
  it("formats a Kyrgyz subscriber number", () => {
    expect(formatKgPhone("502123456")).toBe("+996 502 123 456");
  });

  it("keeps a formatted international number stable", () => {
    expect(formatKgPhone("+996 502 123 456")).toBe("+996 502 123 456");
  });

  it("accepts the common local leading zero", () => {
    expect(formatKgPhone("0502 123 456")).toBe("+996 502 123 456");
  });

  it("limits input to nine subscriber digits", () => {
    expect(formatKgPhone("+996 502 123 456 999")).toBe("+996 502 123 456");
  });
});
