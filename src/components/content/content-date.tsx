export function ContentDate({ value }: { value: Date }) {
  return (
    <time dateTime={value.toISOString()}>
      {new Intl.DateTimeFormat("ru-KG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(value)}
    </time>
  );
}
