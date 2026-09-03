export function formatKgPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("996") ? digits.slice(3) : digits;
  const subscriber = (
    withoutCountryCode.startsWith("0") ? withoutCountryCode.slice(1) : withoutCountryCode
  ).slice(0, 9);
  const groups = [subscriber.slice(0, 3), subscriber.slice(3, 6), subscriber.slice(6, 9)].filter(
    Boolean,
  );

  return groups.length ? `+996 ${groups.join(" ")}` : "+996 ";
}
