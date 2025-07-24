import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommentBody from "../Forum/CommentBody/CommentBody";

// Mock fetch
global.fetch = vi.fn();

describe("CommentBody component", () => {
  const mockPostId = "abc123";
  const mockRefresh = vi.fn();

  beforeEach(() => {
    fetch.mockReset();
    mockRefresh.mockReset();
  });

  it("renders with no comments", () => {
    render(<CommentBody comments={[]} postId={mockPostId} refreshComments={mockRefresh} />);
    expect(screen.getByText("Add a Comment")).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("renders with comments", () => {
    const mockComments = [
      { _id: "1", content: "Great post!", author: "User1" },
      { _id: "2", content: "Thanks for sharing.", author: "User2" },
    ];

    render(<CommentBody comments={mockComments} postId={mockPostId} refreshComments={mockRefresh} />);

    expect(screen.getByText("Great post!")).toBeInTheDocument();
    expect(screen.getByText("Thanks for sharing.")).toBeInTheDocument();
  });

  it("calls refreshComments on mount", () => {
    render(<CommentBody comments={[]} postId={mockPostId} refreshComments={mockRefresh} />);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("posts a comment and clears input", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: vi.fn() });

    render(<CommentBody comments={[]} postId={mockPostId} refreshComments={mockRefresh} />);

    const textarea = screen.getByPlaceholderText("Write something...");
    fireEvent.change(textarea, { target: { value: "Test comment" } });

    const postButton = screen.getByText("Post");
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/v1/${mockPostId}/comment/create`,
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(mockRefresh).toHaveBeenCalled();
      expect(textarea.value).toBe(""); // cleared input
    });
  });

  it("does not post empty comment", async () => {
    render(<CommentBody comments={[]} postId={mockPostId} refreshComments={mockRefresh} />);

    const postButton = screen.getByText("Post");
    fireEvent.click(postButton);

    expect(fetch).not.toHaveBeenCalled();
  });
});
