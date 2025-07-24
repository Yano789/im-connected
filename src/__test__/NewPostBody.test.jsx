import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewPostBody from "../Forum/NewPostBody/NewPostBody";
import { MemoryRouter } from "react-router-dom";

// Mocks
const mockSetSelectedDraft = vi.fn();
const sampleDraft = { _id: "draft123", title: "Draft Title" };

vi.mock("../Forum/NewPostCard/NewPostCard", () => ({
  default: ({ onDraftAdded, renderDraft }) => (
    <div>
      <div>MockNewPostCard</div>
      <button onClick={() => onDraftAdded(sampleDraft)}>
        SimulateAddDraft
      </button>
      {renderDraft && <div>Render: {renderDraft.title}</div>}
    </div>
  ),
}));

vi.mock("../Forum/DraftPosts/DraftPosts", () => ({
  default: ({ refreshTrigger, onDraftSelected }) => (
    <div>
      <div>MockDraftPosts - refresh {refreshTrigger}</div>
      <button onClick={() => onDraftSelected(sampleDraft)}>SelectDraft</button>
    </div>
  ),
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("NewPostBody", () => {
  it("renders NewPostCard and DraftPosts", () => {
    renderWithRouter(<NewPostBody />);
    expect(screen.getByText("MockNewPostCard")).toBeInTheDocument();
    expect(screen.getByText(/MockDraftPosts - refresh 0/)).toBeInTheDocument();
  });

  it("updates selectedDraft when a draft is selected", async () => {
    renderWithRouter(<NewPostBody />);
    const selectBtn = screen.getByText("SelectDraft");

    await userEvent.click(selectBtn);
    expect(screen.getByText(/Render: Draft Title/)).toBeInTheDocument();
  });

  it("updates refreshTrigger and selectedDraft when same draft is re-added", async () => {
    renderWithRouter(<NewPostBody />);

    // Step 1: select the draft
    await userEvent.click(screen.getByText("SelectDraft"));
    expect(screen.getByText("Render: Draft Title")).toBeInTheDocument();

    // Step 2: simulate adding the same draft again
    await userEvent.click(screen.getByText("SimulateAddDraft"));

    // Step 3: confirm refreshCount increased (refreshTrigger = 1)
    expect(screen.getByText(/MockDraftPosts - refresh 1/)).toBeInTheDocument();

    // Step 4: confirm selectedDraft is still the same (title rendered)
    expect(screen.getByText("Render: Draft Title")).toBeInTheDocument();
  });

  it("updates refreshTrigger but not selectedDraft for different draft", async () => {
    const anotherDraft = { _id: "different", title: "Another Draft" };

    vi.mock("../Forum/NewPostCard/NewPostCard", () => {
      const sampleDraft = { _id: "draft123", title: "Draft Title" };
      const anotherDraft = { _id: "different", title: "Another Draft" };

      return {
        default: ({ onDraftAdded, renderDraft }) => (
          <div>
            <div>MockNewPostCard</div>
            <button onClick={() => onDraftAdded(sampleDraft)}>
              SimulateAddDraft
            </button>
            <button onClick={() => onDraftAdded(anotherDraft)}>
              AddAnother
            </button>
            {renderDraft && <div>Render: {renderDraft.title}</div>}
          </div>
        ),
      };
    });

    const { unmount } = renderWithRouter(<NewPostBody />);

    await userEvent.click(screen.getByText("SelectDraft")); // Set selectedDraft
    await userEvent.click(screen.getByText("AddAnother")); // Add different draft

    expect(screen.getByText(/MockDraftPosts - refresh 1/)).toBeInTheDocument();
    expect(screen.getByText("Render: Draft Title")).toBeInTheDocument();

    unmount(); // Cleanup to reset doMock
  });
});
