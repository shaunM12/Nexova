import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIPELINE_API_BASE_URL } from "@/lib/backoffice/pipeline/config";
import { db } from "@/lib/backoffice/pipeline/mocks/db";
import { server } from "@/lib/backoffice/pipeline/mocks/server";
import { renderWithProviders, router, setTestUrl } from "../test-utils";
import { CandidateDetail } from "./CandidateDetail";

vi.mock("next/navigation", async () => (await import("../test-utils")).navigationMock);

const JAVIER = "demo-javier-moreno-gil";
const base = PIPELINE_API_BASE_URL;

beforeEach(() => {
  setTestUrl(`/backoffice/pipeline/${JAVIER}`);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

async function renderJavier() {
  renderWithProviders(<CandidateDetail id={JAVIER} />);
  await screen.findByRole("heading", { level: 1, name: "Javier Moreno Gil" });
}

describe("CandidateDetail", () => {
  it("shows labels, the current stage, and last-updated info", async () => {
    await renderJavier();
    const stages = screen.getByRole("list", { name: "Stage" });
    expect(within(stages).getByRole("button", { name: /Personal interview/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText("Status")).toHaveValue("in_progress");
    expect(screen.getByText(/Last updated/)).toHaveTextContent("13 days ago");
    expect(document.body.textContent).not.toMatch(/in_progress|personal_interview/);
  });

  it("changes status in one interaction", async () => {
    const user = userEvent.setup();
    await renderJavier();
    await user.selectOptions(screen.getByLabelText("Status"), "selected");
    expect(await screen.findByText("Status changed to Selected")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveValue("selected");
  });

  it("changes stage in one click", async () => {
    const user = userEvent.setup();
    await renderJavier();
    const stages = screen.getByRole("list", { name: "Stage" });
    await user.click(within(stages).getByRole("button", { name: /Technical interview/ }));
    expect(await screen.findByText("Stage changed to Technical interview")).toBeInTheDocument();
    expect(within(stages).getByRole("button", { name: /Technical interview/ })).toHaveAttribute("aria-current", "step");
  });

  it("updates optimistically and rolls back when the server rejects", async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${base}/records/:id`, async () => {
        await delay(150);
        return new HttpResponse(null, { status: 500 });
      }),
    );
    await renderJavier();
    const select = screen.getByLabelText("Status");

    await user.selectOptions(select, "selected");
    expect(select).toHaveValue("selected");
    expect(await screen.findByText(/Couldn't update status/)).toBeInTheDocument();
    await waitFor(() => expect(select).toHaveValue("in_progress"));
  });

  it("shows a not-found state for a missing candidate", async () => {
    renderWithProviders(<CandidateDetail id="missing" />);
    expect(await screen.findByText("Candidate not found")).toBeInTheDocument();
  });

  it("edits details with a full save", async () => {
    const user = userEvent.setup();
    await renderJavier();
    await user.click(screen.getByRole("button", { name: "Edit details" }));
    const phone = screen.getByLabelText(/^Phone/);
    await user.clear(phone);
    await user.type(phone, "+34 600 000 111");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Candidate details saved")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+34 600 000 111" })).toBeInTheDocument();
  });

  describe("notes", () => {
    it("lists notes and adds a new one", async () => {
      const user = userEvent.setup();
      await renderJavier();
      expect(await screen.findByText("Phone screen done. Fluent English, good energy.")).toBeInTheDocument();

      await user.type(screen.getByLabelText("Add a note"), "Personal interview booked for Monday.");
      await user.click(screen.getByRole("button", { name: "Save note" }));
      expect(await screen.findByText("Personal interview booked for Monday.")).toBeInTheDocument();
      expect(screen.getByLabelText("Add a note")).toHaveValue("");
    });

    it("rejects an empty note", async () => {
      const user = userEvent.setup();
      await renderJavier();
      await user.click(screen.getByRole("button", { name: "Save note" }));
      expect(await screen.findByText("Write a note before saving")).toBeInTheDocument();
    });

    it("asks before deleting; Escape cancels and returns focus", async () => {
      const user = userEvent.setup();
      await renderJavier();
      await screen.findByText("Phone screen done. Fluent English, good energy.");
      const [deleteButton] = screen.getAllByRole("button", { name: /^Delete note from/ });

      await user.click(deleteButton);
      const dialog = screen.getByRole("alertdialog");
      expect(within(dialog).getByRole("button", { name: "Cancel deleting note" })).toHaveFocus();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /^Delete note from/ })[0]).toHaveFocus();
    });

    it("deletes a note after confirming", async () => {
      const user = userEvent.setup();
      await renderJavier();
      const note = await screen.findByText("Phone screen done. Fluent English, good energy.");
      const item = note.closest("li")!;

      await user.click(within(item).getByRole("button", { name: /^Delete note from/ }));
      await user.click(within(item).getByRole("button", { name: /^Confirm delete note/ }));
      await waitFor(() =>
        expect(screen.queryByText("Phone screen done. Fluent English, good energy.")).not.toBeInTheDocument(),
      );
      expect(await screen.findByText("Note deleted")).toBeInTheDocument();
    });

    it("restores a note when the delete fails", async () => {
      const user = userEvent.setup();
      server.use(
        http.delete(`${base}/records/:id/notes/:noteId`, async () => {
          await delay(100);
          return new HttpResponse(null, { status: 500 });
        }),
      );
      await renderJavier();
      const note = await screen.findByText("Phone screen done. Fluent English, good energy.");
      const item = note.closest("li")!;

      await user.click(within(item).getByRole("button", { name: /^Delete note from/ }));
      await user.click(within(item).getByRole("button", { name: /^Confirm delete note/ }));
      expect(screen.queryByText("Phone screen done. Fluent English, good energy.")).not.toBeInTheDocument();
      expect(await screen.findByText(/Couldn't delete the note/)).toBeInTheDocument();
      expect(await screen.findByText("Phone screen done. Fluent English, good energy.")).toBeInTheDocument();
    });
  });

  describe("delete candidate", () => {
    it("asks first; Cancel keeps the candidate and returns focus", async () => {
      const user = userEvent.setup();
      await renderJavier();

      await user.click(screen.getByRole("button", { name: "Delete candidate" }));
      const dialog = screen.getByRole("alertdialog", { name: "Delete Javier Moreno Gil?" });
      expect(within(dialog).getByText(/can't be undone/)).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();

      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete candidate" })).toHaveFocus();
      expect(db.find(JAVIER)).toBeDefined();
    });

    it("deletes after confirming and returns to the list", async () => {
      const user = userEvent.setup();
      await renderJavier();

      await user.click(screen.getByRole("button", { name: "Delete candidate" }));
      await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete candidate" }));

      expect(await screen.findByText("Candidate deleted")).toBeInTheDocument();
      expect(router.replace).toHaveBeenCalledWith("/backoffice/pipeline");
      expect(db.find(JAVIER)).toBeUndefined();
    });

    it("stays on the page with an error toast when the delete fails", async () => {
      const user = userEvent.setup();
      server.use(http.delete(`${base}/records/:id`, () => new HttpResponse(null, { status: 500 })));
      await renderJavier();

      await user.click(screen.getByRole("button", { name: "Delete candidate" }));
      const dialog = screen.getByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Delete candidate" }));

      expect(await screen.findByText(/Couldn't delete the candidate/)).toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
      expect(within(dialog).getByRole("button", { name: "Delete candidate" })).toBeEnabled();
      expect(screen.getByRole("heading", { level: 1, name: "Javier Moreno Gil" })).toBeInTheDocument();
    });
  });
});
