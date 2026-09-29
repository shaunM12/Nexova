/** Demo gate only — not security. The login page displays these credentials. */
export const DEMO_CREDENTIALS = {
  email: "demo@nexova.dev",
  password: "nexova-demo",
} as const;

export const SESSION_COOKIE = "nexova_backoffice_session";
export const SESSION_VALUE = "demo";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const SESSION_COOKIE_PATH = "/backoffice";

export const LOGIN_PATH = "/backoffice/login";
export const DEFAULT_AFTER_LOGIN = "/backoffice/pipeline";
