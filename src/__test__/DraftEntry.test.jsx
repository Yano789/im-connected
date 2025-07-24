import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import DraftEntry from "../Forum/DraftEntry/DraftEntry";

describe("DraftEntry", () => {
  const mockDelete = vi.fn();
  const mockClick = vi.fn();

  const sampleProps = {
    draftPostId: "123",
    draftTitle: "Test Draft",
    draftDate: "2025-07-22",
    draftContents: "This is a test draft content.",
    onDelete: mockDelete,
    onClick: mockClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, content, and date", () => {
    render(<DraftEntry {...sampleProps} />);
    expect(screen.getByText("Test Draft")).toBeInTheDocument();
    expect(screen.getByText("This is a test draft content.")).toBeInTheDocument();
    expect(screen.getByText("2025-07-22")).toBeInTheDocument();
  });

  it("calls onDelete when delete icon is clicked", () => {
    render(<DraftEntry {...sampleProps} />);
    const deleteBtn = screen.getByRole("img", { name: /delete/i });
    fireEvent.click(deleteBtn);
    expect(mockDelete).toHaveBeenCalledWith("123");
  });

  it("calls onClick when entry is clicked", () => {
    render(<DraftEntry {...sampleProps} />);
    const entry = screen.getByText("Test Draft").closest(".draftEntryDiv");
    fireEvent.click(entry);
    expect(mockClick).toHaveBeenCalled();
  });

  it("prevents propagation when delete is clicked", () => {
    render(<DraftEntry {...sampleProps} />);
    const deleteBtn = screen.getByRole("img", { name: /delete/i });
    fireEvent.click(deleteBtn);
    expect(mockClick).not.toHaveBeenCalled();
  });
});
