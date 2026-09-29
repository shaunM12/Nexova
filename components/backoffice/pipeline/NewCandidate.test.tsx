import { screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIPELINE_API_BASE_URL } from "@/lib/backoffice/pipeline/config";
import { server } from "@/lib/backoffice/pipeline/mocks/server";
import { renderWithProviders, router, setTestUrl } from "../test-utils";
import { NewCandidate } from "./NewCandidate";

vi.mock("next/navigation", async () => (await import("../test-utils")).navigationMock);

const base = PIPELINE_API_BASE_URL;

async function fillValid(user: UserEvent, email = "new.person@example.com") {
  await user.type(screen.getByLabelText(/^Full name/), "Nuria Prieto Lozano");
  await user.type(screen.getByLabelText(/^Email/), email);
  await user.type(screen.getByLabelText(/^Phone/), "+34 611 222 333");
  await user.type(screen.getByLabelText(/^Position/), "Executive Assistant");
  await user.type(screen.getByLabelText(/^Years of experience/), "5");
}

beforeEach(() => {
  setTestUrl("/backoffice/pipeline/new");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("NewCandidate", () => {
  it("requires every API-required field", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewCandidate />);
    await user.click(screen.getByRole("button", { name: "Add candidate" }));

    for (const message of [
      "Full name is required",
      "Email is required",
      "Phone is required",
      "Position is required",
      "Enter years of experience",
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/^Full name/)).toHaveFocus();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("registers a candidate and opens their detail page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewCandidate />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Add candidate" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/backoffice\/pipeline\/.+/)));
    expect(await screen.findByText("Nuria Prieto Lozano added")).toBeInTheDocument();
  });

  it("blocks a duplicate email (case-insensitive) and links to the existing record", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewCandidate />);
    await fillValid(user, "LUCIA.FERNANDEZ@example.com");
    await user.click(screen.getByRole("button", { name: "Add candidate" }));

    expect(await screen.findByText("A candidate with this email already exists")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Lucía Fernández Ortega" })).toHaveAttribute(
      "href",
      "/backoffice/pipeline/demo-lucia-fernandez-ortega",
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it("lets the user save when the duplicate check itself fails", async () => {
    const user = userEvent.setup();
    server.use(http.get(`${base}/records`, () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<NewCandidate />);
    await fillValid(user);
    await user.tab();

    expect(await screen.findByText(/Couldn't check for duplicates/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry check" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add candidate" }));
    await waitFor(() => expect(router.push).toHaveBeenCalled());
  });

  it("asks before leaving with unsaved changes", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithProviders(<NewCandidate />);

    await user.type(screen.getByLabelText(/^Full name/), "Half-typed name");
    await user.click(screen.getByRole("link", { name: /All candidates/ }));
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/^Discard changes\?/));
  });

  it("maps server validation errors to fields", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${base}/records`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "phone"], msg: "Phone number is not valid", type: "value_error" }] },
          { status: 422 },
        ),
      ),
    );
    renderWithProviders(<NewCandidate />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Add candidate" }));

    expect(await screen.findByText("Phone number is not valid")).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});
