import { z } from "zod";

export const optionalWebUrlSchema = z.union([
  z.literal(""),
  z.url({ protocol: /^https?$/, error: "Укажите ссылку с http:// или https://" }),
]);

export const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value || /^\/(?!\/)[^\s\\]*$/.test(value) || optionalWebUrlSchema.safeParse(value).success,
    "Укажите путь /images/… или ссылку с http:// или https://",
  );
