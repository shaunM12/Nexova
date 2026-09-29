import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIPELINE_API_BASE_URL } from "@/lib/backoffice/pipeline/config";
import { db } from "@/lib/backoffice/pipeline/mocks/db";
import { server } from "@/lib/backoffice/pipeline/mocks/server";
import { currentSearch, renderWithProviders, router, setTestUrl } from "../test-utils";
import { PipelineList } from "./PipelineList";

vi.mock("next/navigation", async () => (await import("../test-utils")).navigationMock);

const RAW_VALUES = /in_progress|personal_interview|technical_interview|offer_presented|\bpending\b|\breceived\b/;

function tableRows() {
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

beforeEach(() => {
  setTestUrl("/backoffice/pipeline");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PipelineList", () => {
  it("shows a skeleton, then every candidate with labels (never raw values)", async () => {
    renderWithProviders(<PipelineList />);
    expect(screen.getByText("Loading candidates…")).toBeInTheDocument();

    await screen.findByRole("table");
    expect(tableRows()).toHaveLength(12);
    expect(screen.getByText("Showing 1–12 of 12 candidates")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByText("In progress").length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(RAW_VALUES);
  });

  it("flags stale candidates", async () => {
    renderWithProviders(<PipelineList />);
    await screen.findByRole("table");
    const sofia = within(screen.getByRole("table")).getByText("Sofía Navarro Castillo").closest("tr")!;
    const javier = within(screen.getByRole("table")).getByText("Javier Moreno Gil").closest("tr")!;
    expect(within(sofia).getByText("Stale")).toBeInTheDocument();
    expect(within(javier).queryByText("Stale")).not.toBeInTheDocument();
  });

  it("filters by status through the URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelineList />);
    await screen.findByRole("table");

    await user.selectOptions(screen.getByLabelText("Status"), "discarded");
    expect(router.push).toHaveBeenCalledWith("/backoffice/pipeline?status=discarded", { scroll: false });
    await waitFor(() => expect(tableRows()).toHaveLength(2));
  });

  it("searches by name or email without reloading, debounced", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelineList />);
    await screen.findByRole("table");

    await user.type(screen.getByLabelText("Search"), "EMILY.CARTER");
    expect(router.replace).not.toHaveBeenCalled();
    await waitFor(() => expect(currentSearch()).toBe("q=EMILY.CARTER"));
    await waitFor(() => expect(tableRows()).toHaveLength(1));
    expect(within(screen.getByRole("table")).getByText("Emily Carter")).toBeInTheDocument();
  });

  it("shows an empty state with a way to clear filters", async () => {
    const user = userEvent.setup();
    setTestUrl("/backoffice/pipeline?q=nobody-here");
    renderWithProviders(<PipelineList />);

    expect(await screen.findByText("No candidates match these filters")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    await waitFor(() => expect(currentSearch()).toBe(""));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("shows an error with Retry when loading fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${PIPELINE_API_BASE_URL}/records`, () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    renderWithProviders(<PipelineList />);

    expect(await screen.findByText("Candidates couldn't be loaded")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("paginates with Previous / Next", async () => {
    const user = userEvent.setup();
    const seed = db.all();
    server.use(
      http.get(`${PIPELINE_API_BASE_URL}/records`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        const data = seed.slice(0, 10).map((record) => ({ ...record, id: `${record.id}-p${page}` }));
        return HttpResponse.json({ total: 45, page, limit: 20, data });
      }),
    );
    renderWithProviders(<PipelineList />);

    expect(await screen.findByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(router.push).toHaveBeenCalledWith("/backoffice/pipeline?page=2", { scroll: false });
    expect(await screen.findByText("Page 2 of 3")).toBeInTheDocument();
  });
});
