import { describe, expect, it } from "vitest";
import { resolveAuthRedirect, safeNext } from "./redirect";

describe("resolveAuthRedirect", () => {
  it("never redirects public routes", () => {
    for (const path of ["/", "/application", "/backofficex", "/about?next=/backoffice/pipeline"]) {
      expect(resolveAuthRedirect(path, false)).toBeNull();
    }
  });

  it("sends signed-out users to login with the page they asked for", () => {
    expect(resolveAuthRedirect("/backoffice/pipeline/abc", false)).toBe(
      "/backoffice/login?next=%2Fbackoffice%2Fpipeline%2Fabc",
    );
    expect(resolveAuthRedirect("/backoffice/pipeline?status=selected", false)).toBe(
      "/backoffice/login?next=%2Fbackoffice%2Fpipeline%3Fstatus%3Dselected",
    );
  });

  it("lets signed-out users see the login page", () => {
    expect(resolveAuthRedirect("/backoffice/login", false)).toBeNull();
  });

  it("sends signed-in users away from login", () => {
    expect(resolveAuthRedirect("/backoffice/login", true)).toBe("/backoffice/pipeline");
    expect(resolveAuthRedirect("/backoffice/login", true, "/backoffice/pipeline/abc")).toBe(
      "/backoffice/pipeline/abc",
    );
  });

  it("lets signed-in users through", () => {
    expect(resolveAuthRedirect("/backoffice/pipeline", true)).toBeNull();
  });
});

describe("safeNext", () => {
  it("ignores anything outside the backoffice", () => {
    for (const next of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/application",
      "/backoffice/login",
      "/backoffice/\\evil",
      null,
      undefined,
      "",
    ]) {
      expect(safeNext(next)).toBe("/backoffice/pipeline");
    }
  });

  it("accepts backoffice paths", () => {
    expect(safeNext("/backoffice/pipeline/new")).toBe("/backoffice/pipeline/new");
  });
});
