import type { Instrumentation } from "next";
import { logServerError } from "@/lib/observability";

/**
 * Centralized server-error hook supported by Next.js 16.
 * Only route metadata is logged; request headers, bodies and query parameters are excluded.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logServerError("next.request.error", error, {
    method: request.method,
    path: request.path.split("?", 1)[0],
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
  });
};
