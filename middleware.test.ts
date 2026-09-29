import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/backoffice/auth/constants";
import { config, middleware } from "./middleware";

function request(path: string, withSession = false) {
  const req = new NextRequest(new URL(path, "http://localhost:3456"));
  if (withSession) req.cookies.set(SESSION_COOKIE, SESSION_VALUE);
  return req;
}

describe("middleware", () => {
  it("only matches backoffice routes", () => {
    expect(config.matcher).toEqual(["/backoffice/:path*"]);
  });

  it("redirects signed-out users to login, keeping the destination", () => {
    const response = middleware(request("/backoffice/pipeline?stage=review"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/backoffice/login");
    expect(location.searchParams.get("next")).toBe("/backoffice/pipeline?stage=review");
  });

  it("lets signed-in users through", () => {
    const response = middleware(request("/backoffice/pipeline", true));
    expect(response.headers.get("location")).toBeNull();
  });

  it("ignores an external next on login", () => {
    const response = middleware(request("/backoffice/login?next=https://evil.example", true));
    expect(new URL(response.headers.get("location")!).pathname).toBe("/backoffice/pipeline");
  });
});
