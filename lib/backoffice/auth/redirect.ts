import { DEFAULT_AFTER_LOGIN, LOGIN_PATH } from "./constants";

/** Only same-app backoffice paths are accepted, so `next` can't redirect to another site. */
export function safeNext(next: string | null | undefined): string {
  if (
    typeof next === "string" &&
    next.startsWith("/backoffice/") &&
    !next.includes("\\") &&
    !next.startsWith(LOGIN_PATH)
  ) {
    return next;
  }
  return DEFAULT_AFTER_LOGIN;
}

/**
 * Where a request should go, or `null` to continue.
 * `pathname` may include the query string so users return to the exact view they asked for.
 */
export function resolveAuthRedirect(
  pathname: string,
  hasSession: boolean,
  next?: string | null,
): string | null {
  const path = pathname.split("?")[0];
  if (path !== "/backoffice" && !path.startsWith("/backoffice/")) return null;

  if (path === LOGIN_PATH) return hasSession ? safeNext(next) : null;

  if (hasSession) return null;
  return `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`;
}
