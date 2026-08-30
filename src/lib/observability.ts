type LogMetadata = Record<string, boolean | number | string | undefined>;

type LogError = {
  digest?: string;
  name: string;
};

const SENSITIVE_METADATA_KEY =
  /address|authorization|child|consent|cookie|email|name|note|parent|password|phone|resume|secret|token/i;

function toSafeError(error: unknown): LogError {
  if (error instanceof Error) {
    const errorWithDigest = error as Error & { digest?: unknown };
    return {
      name: error.name || "Error",
      ...(typeof errorWithDigest.digest === "string" ? { digest: errorWithDigest.digest } : {}),
    };
  }

  return { name: "UnknownError" };
}

/**
 * Removes values that may contain personal data or credentials before a server log is emitted.
 * Error messages and stacks are deliberately omitted: infrastructure credentials and form data
 * must never reach application logs.
 */
export function sanitizeLogMetadata(metadata: LogMetadata): LogMetadata {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (SENSITIVE_METADATA_KEY.test(key)) return [key, "[redacted]"];
      if (key === "path" && typeof value === "string") return [key, value.split("?", 1)[0]];
      return [key, value];
    }),
  );
}

export function logServerError(event: string, error: unknown, metadata: LogMetadata = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: "error",
    event,
    error: toSafeError(error),
    ...sanitizeLogMetadata(metadata),
  };

  console.error(JSON.stringify(entry));
}
